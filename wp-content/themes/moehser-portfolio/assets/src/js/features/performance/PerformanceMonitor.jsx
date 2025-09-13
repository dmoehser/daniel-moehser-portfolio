// Performance Monitor Component
// ============================

// Monitor and optimize performance metrics
// ------------------------------

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

// Performance monitoring configuration
// ------------------------------
const PERFORMANCE_CONFIG = {
  LCP_THRESHOLD: 2500,
  FID_THRESHOLD: 100,
  CLS_THRESHOLD: 0.1,
  IMAGE_UPDATE_INTERVAL: 500,
  ENABLE_LIVE_UPDATES: true,
  VISIBILITY_CHECK_INTERVAL: 2000,
};

const isSafari = () => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

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

  const measureLCPFallback = () => {
    if (typeof window === 'undefined' || !window.performance) return;
    
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (!navigation) return;
      
      // Use load timing as LCP fallback
      const loadTime = navigation.loadEventEnd - navigation.navigationStart;
      if (loadTime > 0) {
        setMetrics(prev => ({ ...prev, lcp: loadTime }));
        return;
      }
      
      // Fallback to DOMContentLoaded timing
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
      if (domContentLoaded > 0) {
        setMetrics(prev => ({ ...prev, lcp: domContentLoaded }));
      }
    } catch (error) {
      // Ignore deprecated API warnings - fallback to timing API
      const timing = performance.timing;
      if (timing) {
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        if (loadTime > 0) {
          setMetrics(prev => ({ ...prev, lcp: loadTime }));
        }
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (metrics.isSafari) return;

    let observer = null;
    let fallbackTimer = null;

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

        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }

    const setupFallbacks = () => {
      fallbackTimer = setTimeout(() => {
        measureLCPFallback();
      }, 2000);
    };

    const fallbackSetupTimer = setTimeout(setupFallbacks, 1000);

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

  useEffect(() => {
    let mounted = true;
    let updateInterval = null;
    let visibilityCheckInterval = null;
    
    const updateImageCount = () => {
      if (!mounted) return;
      
      const images = document.querySelectorAll('img');
      
      const contentImages = Array.from(images).filter(img => {
        if (img.classList.contains('icon') || 
            img.classList.contains('svg-icon') ||
            img.getAttribute('alt') === '' ||
            img.src.includes('icon') ||
            img.src.includes('svg')) {
          return false;
        }
        
        const rect = img.getBoundingClientRect();
        return rect.width > 30 && rect.height > 30;
      });
      
      let loadedCount = 0;
      let totalSize = 0;
      
      contentImages.forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
          loadedCount++;
          
          const estimatedSize = (img.naturalWidth * img.naturalHeight * 3) / 1024;
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
      
      updateImageCount();
    };

    const setupLiveUpdates = () => {
      if (!PERFORMANCE_CONFIG.ENABLE_LIVE_UPDATES) return;
      
      const isWindowActive = () => {
        return !document.hidden && document.visibilityState === 'visible';
      };
      
      updateInterval = setInterval(() => {
        if (isWindowActive()) {
          updateImageCount();
        }
      }, PERFORMANCE_CONFIG.IMAGE_UPDATE_INTERVAL);
      
      visibilityCheckInterval = setInterval(() => {
        if (isWindowActive()) {
          updateImageCount();
        }
      }, PERFORMANCE_CONFIG.VISIBILITY_CHECK_INTERVAL);
      
      document.addEventListener('visibilitychange', () => {
        if (isWindowActive()) {
          updateImageCount();
        }
      });
      
      window.addEventListener('focus', updateImageCount);
      window.addEventListener('blur', updateImageCount);
    };

    updateImageCount();
    setupLiveUpdates();

    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', handleImageLoad);
        img.addEventListener('error', handleImageLoad);
      }
    });

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
        setTimeout(updateImageCount, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener('load', updateImageCount);

    return () => {
      mounted = false;
      
      if (updateInterval) clearInterval(updateInterval);
      if (visibilityCheckInterval) clearInterval(visibilityCheckInterval);
      
      if (observer) observer.disconnect();
      
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

const getOptimizationSuggestions = (metrics) => {
  const suggestions = [];

  if (metrics.lcp && metrics.lcp > PERFORMANCE_CONFIG.LCP_THRESHOLD) {
    suggestions.push({
      type: 'warning',
      message: `LCP ist ${Math.round(metrics.lcp)}ms (Ziel: <${PERFORMANCE_CONFIG.LCP_THRESHOLD}ms)`,
      suggestion: 'Bilder optimieren oder Lazy Loading verbessern'
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

export default function PerformanceMonitor() {
  const metrics = usePerformanceMonitor();
  const { isGerman } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const suggestions = getOptimizationSuggestions(metrics);


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
          <h3>{isGerman ? 'Leistungs-Metriken' : 'Performance Metrics'}</h3>
          
          {metrics.isSafari ? (
            <div className="performance-safari-notice">
              <p style={{color: '#f59e0b', fontSize: '14px', margin: '10px 0', padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)'}}>
                {isGerman 
                  ? '⚠️ Leistungs-Metriken werden in Safari nicht unterstützt - Messungen sind dort unzuverlässig'
                  : '⚠️ Performance metrics not supported on Safari - measurements are unreliable there'
                }
              </p>
            </div>
          ) : (
            <div className="performance-metrics">
            <div className="metric">
              <span className="metric-label">LCP:</span>
              <span className={`metric-value ${metrics.lcp && metrics.lcp > PERFORMANCE_CONFIG.LCP_THRESHOLD ? 'warning' : 'good'}`}>
                {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : (isGerman ? 'Lädt...' : 'Loading...')}
              </span>
            </div>
            
            <div className="metric">
              <span className="metric-label">FID:</span>
              <span className={`metric-value ${metrics.fid && metrics.fid > PERFORMANCE_CONFIG.FID_THRESHOLD ? 'warning' : 'good'}`}>
                {metrics.fid ? `${Math.round(metrics.fid)}ms` : (isGerman ? 'Noch keine Interaktion' : 'No interaction yet')}
              </span>
            </div>
            
            <div className="metric">
              <span className="metric-label">CLS:</span>
              <span className={`metric-value ${metrics.cls && metrics.cls > PERFORMANCE_CONFIG.CLS_THRESHOLD ? 'warning' : 'good'}`}>
                {metrics.cls ? metrics.cls.toFixed(3) : (isGerman ? 'Lädt...' : 'Loading...')}
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
              <h4>{isGerman ? 'Optimierungsvorschläge:' : 'Optimization Suggestions:'}</h4>
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

export { usePerformanceMonitor, PERFORMANCE_CONFIG };
