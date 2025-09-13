// Performance Monitor Component
// ============================

// Monitor and optimize performance metrics
// ------------------------------

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

// Performance monitoring configuration
// ------------------------------
const PERFORMANCE_CONFIG = {
  // Core Web Vitals thresholds (updated 2024 standards)
  LCP_THRESHOLD: 2500,    // Largest Contentful Paint (ms) - Good: <2.5s
  INP_THRESHOLD: 200,     // Interaction to Next Paint (ms) - Good: <200ms
  CLS_THRESHOLD: 0.1,     // Cumulative Layout Shift - Good: <0.1
  FID_THRESHOLD: 100,     // First Input Delay (ms) - Good: <100ms
  
  // Performance budgets (image limits removed - no warnings needed)
  
  // Monitoring intervals
  MONITOR_INTERVAL: 1000,  // ms
  IMAGE_UPDATE_INTERVAL: 500, // ms - more frequent for live updates
  
  // Real-time monitoring
  ENABLE_LIVE_UPDATES: true,
  VISIBILITY_CHECK_INTERVAL: 2000, // ms
};

// Safari detection utility
// ------------------------
const isSafari = () => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Performance metrics state
// ------------------------
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    lcp: null,
    inp: null,
    fid: null,
    cls: null,
    imageCount: 0,
    loadedImages: 0,
    totalImageSize: 0,
    lastUpdate: Date.now(),
    isSafari: isSafari()
  });

  // Fallback LCP measurement using resource timing
  // ----------------------------------------------
  const measureLCPFallback = () => {
    if (typeof window === 'undefined' || !window.performance) return;
    
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return;
    
    // Try to get LCP from existing entries first
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      const latestLCP = lcpEntries[lcpEntries.length - 1];
      setMetrics(prev => ({ ...prev, lcp: latestLCP.startTime }));
      return;
    }
    
    // Fallback: estimate LCP based on load timing
    const loadTime = navigation.loadEventEnd - navigation.navigationStart;
    if (loadTime > 0) {
      setMetrics(prev => ({ ...prev, lcp: loadTime }));
      return;
    }
    
    // Last resort: use DOMContentLoaded timing
    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
    if (domContentLoaded > 0) {
      setMetrics(prev => ({ ...prev, lcp: domContentLoaded }));
    }
  };

  // Monitor Core Web Vitals with robust fallbacks
  // ----------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Skip performance monitoring on Safari - not reliable
    if (metrics.isSafari) return;

    let observer = null;
    let fallbackTimer = null;

    // Try to use PerformanceObserver first
    if ('PerformanceObserver' in window) {
      try {
        observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry) => {
            switch (entry.entryType) {
              case 'largest-contentful-paint':
                setMetrics(prev => ({ 
                  ...prev, 
                  lcp: entry.startTime,
                  lastUpdate: Date.now()
                }));
                break;
              case 'first-input':
                // FID measurement - first input delay
                const fidValue = entry.processingStart - entry.startTime;
                setMetrics(prev => ({ 
                  ...prev, 
                  fid: fidValue,
                  lastUpdate: Date.now()
                }));
                break;
              case 'layout-shift':
                if (!entry.hadRecentInput) {
                  setMetrics(prev => ({ 
                    ...prev, 
                    cls: (prev.cls || 0) + entry.value,
                    lastUpdate: Date.now()
                  }));
                }
                break;
              case 'navigation':
                // Update metrics when navigation completes
                if (entry.loadEventEnd > 0) {
                  setMetrics(prev => ({ 
                    ...prev, 
                    lastUpdate: Date.now()
                  }));
                }
                break;
            }
          });
        });

        // Observe different performance entry types
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }

    // Fallback measurements if PerformanceObserver fails
    // -------------------------------------------------
    const setupFallbacks = () => {
      // LCP fallback - always try after page load
      fallbackTimer = setTimeout(() => {
        measureLCPFallback();
      }, 2000); // Wait 2 seconds for content to load

    };

    // Set up fallbacks after a short delay
    const fallbackSetupTimer = setTimeout(setupFallbacks, 1000);

    // Also try to measure LCP immediately if page is already loaded
    if (document.readyState === 'complete') {
      measureLCPFallback();
    } else {
      window.addEventListener('load', measureLCPFallback, { once: true });
    }

    return () => {
      if (observer) observer.disconnect();
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (fallbackSetupTimer) clearTimeout(fallbackSetupTimer);
      window.removeEventListener('load', measureLCPFallback);
    };
  }, []);



  // Monitor image loading with live updates
  useEffect(() => {
    let mounted = true;
    let updateInterval = null;
    let visibilityCheckInterval = null;
    
    const updateImageCount = () => {
      if (!mounted) return;
      
      // Count all images but exclude obvious icons and decorative elements
      const images = document.querySelectorAll('img');
      
      // Filter out small images that are likely icons (less than 30px) or have icon-like attributes
      const contentImages = Array.from(images).filter(img => {
        // Skip images with icon-like classes or attributes
        if (img.classList.contains('icon') || 
            img.classList.contains('svg-icon') ||
            img.getAttribute('alt') === '' ||
            img.src.includes('icon') ||
            img.src.includes('svg')) {
          return false;
        }
        
        // Check if image is large enough to be content (not icon)
        const rect = img.getBoundingClientRect();
        return rect.width > 30 && rect.height > 30;
      });
      
      // Count loaded images and calculate total size
      let loadedCount = 0;
      let totalSize = 0;
      
      contentImages.forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
          loadedCount++;
          
          // Estimate image size (rough calculation)
          const estimatedSize = (img.naturalWidth * img.naturalHeight * 3) / 1024; // Rough KB estimate
          totalSize += estimatedSize;
        }
      });
      
      setMetrics(prev => ({ 
        ...prev, 
        imageCount: contentImages.length,
        loadedImages: loadedCount,
        totalImageSize: Math.round(totalSize),
        lastUpdate: Date.now()
      }));
    };

    const handleImageLoad = () => {
      if (!mounted) return;
      
      // Update immediately when image loads
      updateImageCount();
    };

    // Live update functionality
    const setupLiveUpdates = () => {
      if (!PERFORMANCE_CONFIG.ENABLE_LIVE_UPDATES) return;
      
      // Check if window is visible and active
      const isWindowActive = () => {
        return !document.hidden && document.visibilityState === 'visible';
      };
      
      // Set up periodic updates when window is active
      updateInterval = setInterval(() => {
        if (isWindowActive()) {
          updateImageCount();
        }
      }, PERFORMANCE_CONFIG.IMAGE_UPDATE_INTERVAL);
      
      // Check window visibility periodically
      visibilityCheckInterval = setInterval(() => {
        if (isWindowActive()) {
          updateImageCount();
        }
      }, PERFORMANCE_CONFIG.VISIBILITY_CHECK_INTERVAL);
      
      // Listen for visibility changes
      document.addEventListener('visibilitychange', () => {
        if (isWindowActive()) {
          updateImageCount();
        }
      });
      
      // Listen for window focus/blur
      window.addEventListener('focus', updateImageCount);
      window.addEventListener('blur', updateImageCount);
    };

    // Initial count
    updateImageCount();
    setupLiveUpdates();

    // Add load listeners to all current images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', handleImageLoad);
        img.addEventListener('error', handleImageLoad);
      }
    });

    // Set up MutationObserver to watch for new images
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'IMG' || node.querySelectorAll('img').length > 0) {
                shouldUpdate = true;
              }
            }
          });
        }
      });
      
      if (shouldUpdate) {
        // Debounce updates
        setTimeout(updateImageCount, 100);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Update on window load (for lazy loaded images)
    window.addEventListener('load', updateImageCount);

    return () => {
      mounted = false;
      
      // Clean up intervals
      if (updateInterval) clearInterval(updateInterval);
      if (visibilityCheckInterval) clearInterval(visibilityCheckInterval);
      
      // Clean up observers
      if (observer) observer.disconnect();
      
      // Clean up event listeners
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
        img.removeEventListener('error', handleImageLoad);
      });
      
      window.removeEventListener('load', updateImageCount);
      window.removeEventListener('focus', updateImageCount);
      window.removeEventListener('blur', updateImageCount);
      document.removeEventListener('visibilitychange', updateImageCount);
    };
  }, []);

  return metrics;
};

// Performance optimization suggestions
// ----------------------------------
const getOptimizationSuggestions = (metrics) => {
  const suggestions = [];

  if (metrics.lcp && metrics.lcp > PERFORMANCE_CONFIG.LCP_THRESHOLD) {
    suggestions.push({
      type: 'warning',
      message: `LCP ist ${Math.round(metrics.lcp)}ms (Ziel: <${PERFORMANCE_CONFIG.LCP_THRESHOLD}ms)`,
      suggestion: 'Bilder optimieren oder Lazy Loading verbessern'
    });
  }

  if (metrics.inp && metrics.inp > PERFORMANCE_CONFIG.INP_THRESHOLD) {
    suggestions.push({
      type: 'warning',
      message: `INP ist ${Math.round(metrics.inp)}ms (Ziel: <${PERFORMANCE_CONFIG.INP_THRESHOLD}ms)`,
      suggestion: 'JavaScript-Code optimieren oder aufteilen'
    });
  }

  if (metrics.cls && metrics.cls > PERFORMANCE_CONFIG.CLS_THRESHOLD) {
    suggestions.push({
      type: 'warning',
      message: `CLS ist ${metrics.cls.toFixed(3)} (Ziel: <${PERFORMANCE_CONFIG.CLS_THRESHOLD})`,
      suggestion: 'Layout-Shifts vermeiden, Bildgrößen definieren'
    });
  }


  return suggestions;
};

// Performance monitor component
// ----------------------------
export default function PerformanceMonitor() {
  const metrics = usePerformanceMonitor();
  const { isGerman } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const suggestions = getOptimizationSuggestions(metrics);

  // Always show when integrated in Settings Gear
  // Performance monitoring is useful for all users

  return (
    <div className="performance-monitor">
      <button 
        className="performance-monitor__toggle"
        onClick={() => setShowDetails(!showDetails)}
        title="Performance Monitor"
      >
        📊
      </button>
      
      {showDetails && (
        <div className="performance-monitor__panel">
          <h3>Performance Metrics</h3>
          
          {metrics.isSafari ? (
            <div className="performance-safari-notice">
              <p style={{color: '#f59e0b', fontSize: '14px', margin: '10px 0', padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)'}}>
                {isGerman 
                  ? '⚠️ Performance-Metriken werden in Safari nicht unterstützt - Messungen sind dort unzuverlässig'
                  : '⚠️ Performance metrics not supported on Safari - measurements are unreliable there'
                }
              </p>
            </div>
          ) : (
            <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">LCP:</span>
              <span className={`metric-value ${metrics.lcp && metrics.lcp > PERFORMANCE_CONFIG.LCP_THRESHOLD ? 'warning' : 'good'}`}>
                {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'Loading...'}
              </span>
            </div>
            
            <div className="metric">
              <span className="metric-label">FID:</span>
              <span className={`metric-value ${metrics.fid && metrics.fid > PERFORMANCE_CONFIG.FID_THRESHOLD ? 'warning' : 'good'}`}>
                {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'No interaction yet'}
              </span>
            </div>
            
            <div className="metric">
              <span className="metric-label">CLS:</span>
              <span className={`metric-value ${metrics.cls && metrics.cls > PERFORMANCE_CONFIG.CLS_THRESHOLD ? 'warning' : 'good'}`}>
                {metrics.cls ? metrics.cls.toFixed(3) : 'Loading...'}
              </span>
            </div>
            
            <div className="metric">
              <span className="metric-label">Images:</span>
              <span className="metric-value">
                {metrics.loadedImages}/{metrics.imageCount}
              </span>
            </div>
            
          </div>
          )}
          
          {!metrics.isSafari && suggestions.length > 0 && (
            <div className="performance-suggestions">
              <h4>Optimization Suggestions:</h4>
              {suggestions.map((suggestion, index) => (
                <div key={index} className={`suggestion suggestion--${suggestion.type}`}>
                  <strong>{suggestion.message}</strong>
                  <p>{suggestion.suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export the hook for use in other components
export { usePerformanceMonitor, PERFORMANCE_CONFIG };
