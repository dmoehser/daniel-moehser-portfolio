// Performance Monitor Component
// ============================

// Monitor and optimize performance metrics
// ------------------------------

import React, { useEffect, useState } from 'react';

// Performance monitoring configuration
// ------------------------------
const PERFORMANCE_CONFIG = {
  // Core Web Vitals thresholds
  LCP_THRESHOLD: 2500,    // Largest Contentful Paint (ms)
  INP_THRESHOLD: 200,     // Interaction to Next Paint (ms) - modern metric
  CLS_THRESHOLD: 0.1,     // Cumulative Layout Shift
  
  // Performance budgets
  IMAGE_SIZE_LIMIT: 200,   // KB per image
  
  // Monitoring intervals
  MONITOR_INTERVAL: 1000,  // ms
};

// Performance metrics state
// ------------------------
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    lcp: null,
    inp: null,
    cls: null,
    imageCount: 0,
    loadedImages: 0
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
                setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
                break;
              case 'first-input':
                // INP measurement - first input delay
                const inpValue = entry.processingStart - entry.startTime;
                setMetrics(prev => ({ ...prev, inp: inpValue }));
                break;
              case 'layout-shift':
                if (!entry.hadRecentInput) {
                  setMetrics(prev => ({ 
                    ...prev, 
                    cls: (prev.cls || 0) + entry.value 
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



  // Monitor image loading
  useEffect(() => {
    let mounted = true;
    
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
      
      setMetrics(prev => ({ ...prev, imageCount: contentImages.length }));
      
      // Count loaded images
      const loadedCount = contentImages.filter(img => img.complete).length;
      setMetrics(prev => ({ ...prev, loadedImages: loadedCount }));
    };

    const handleImageLoad = () => {
      if (!mounted) return;
      
      setMetrics(prev => ({ 
        ...prev, 
        loadedImages: Math.min(prev.loadedImages + 1, prev.imageCount)
      }));
    };

    // Initial count
    updateImageCount();

    // Add load listeners to all current images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', handleImageLoad);
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
      observer.disconnect();
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
      });
      window.removeEventListener('load', updateImageCount);
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
          
          <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">LCP:</span>
              <span className={`metric-value ${metrics.lcp && metrics.lcp > PERFORMANCE_CONFIG.LCP_THRESHOLD ? 'warning' : 'good'}`}>
                {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'Loading...'}
              </span>
            </div>
            
            <div className="metric">
              <span className="metric-label">INP:</span>
              <span className={`metric-value ${metrics.inp && metrics.inp > PERFORMANCE_CONFIG.INP_THRESHOLD ? 'warning' : 'good'}`}>
                {metrics.inp ? `${Math.round(metrics.inp)}ms` : 'No interaction yet'}
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
          
          {suggestions.length > 0 && (
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
