// Performance Monitor Component
// ============================

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

// Constants
// ---------
const PERFORMANCE_CONFIG = {
  THRESHOLDS: {
    LCP: 2500,  // milliseconds
    FID: 100,   // milliseconds
    CLS: 0.1    // layout shift score
  },
  TIMING: {
    IMAGE_UPDATE_INTERVAL: 500,        // milliseconds
    VISIBILITY_CHECK_INTERVAL: 2000,   // milliseconds
    FALLBACK_DELAY: 2000,              // milliseconds
    FALLBACK_SETUP_DELAY: 1000,       // milliseconds
    MUTATION_DELAY: 100                // milliseconds
  },
  FEATURES: {
    ENABLE_LIVE_UPDATES: true
  }
};

const BROWSER_CONFIG = {
  SAFARI_USER_AGENT_PATTERN: /^((?!chrome|android).)*safari/i
};

const PERFORMANCE_ENTRY_TYPES = {
  LCP: 'largest-contentful-paint',
  FID: 'first-input',
  CLS: 'layout-shift',
  NAVIGATION: 'navigation'
};

const IMAGE_FILTER_CONFIG = {
  EXCLUDED_CLASSES: ['icon', 'svg-icon'],
  EXCLUDED_KEYWORDS: ['icon', 'svg'],
  MIN_DIMENSIONS: {
    WIDTH: 30,
    HEIGHT: 30
  },
  SIZE_CALCULATION: {
    BYTES_PER_PIXEL: 3,
    BYTES_TO_KB: 1024
  }
};

const CSS_CLASSES = {
  CONTAINER: 'performance-monitor',
  TOGGLE: 'performance-monitor__toggle',
  PANEL: 'performance-monitor__panel',
  SAFARI_NOTICE: 'performance-safari-notice',
  METRICS: 'performance-metrics',
  METRIC: 'metric',
  METRIC_LABEL: 'metric-label',
  METRIC_VALUE: 'metric-value',
  METRIC_WARNING: 'warning',
  METRIC_GOOD: 'good',
  SUGGESTIONS: 'performance-suggestions',
  SUGGESTION: 'suggestion',
  SUGGESTION_PREFIX: 'suggestion--'
};

const INITIAL_METRICS = {
  lcp: null,
  inp: null,
  fid: null,
  cls: null,
  imageCount: 0,
  loadedImages: 0,
  totalImageSize: 0,
  lastUpdate: Date.now(),
  isSafari: false
};

// Utility functions
// -----------------
const isServerSideRendering = () => {
  return typeof window === 'undefined';
};

const detectSafariBrowser = () => {
  if (isServerSideRendering()) return false;
  return BROWSER_CONFIG.SAFARI_USER_AGENT_PATTERN.test(navigator.userAgent);
};

const isPerformanceAPIAvailable = () => {
  return !isServerSideRendering() && window.performance;
};

const isPerformanceObserverAvailable = () => {
  return !isServerSideRendering() && 'PerformanceObserver' in window;
};

const getNavigationEntry = () => {
  if (!isPerformanceAPIAvailable()) return null;
  
  try {
    const entries = performance.getEntriesByType(PERFORMANCE_ENTRY_TYPES.NAVIGATION);
    return entries[0] || null;
  } catch (error) {
    return null;
  }
};

const calculateLoadTime = (navigation, useLoadEvent = true) => {
  if (!navigation) return 0;
  
  if (useLoadEvent && navigation.loadEventEnd > 0) {
    return navigation.loadEventEnd - navigation.navigationStart;
  }
  
  if (navigation.domContentLoadedEventEnd > 0) {
    return navigation.domContentLoadedEventEnd - navigation.navigationStart;
  }
  
  return 0;
};

const getFallbackTimingData = () => {
  if (!isPerformanceAPIAvailable()) return 0;
  
  try {
    const timing = performance.timing;
    if (timing && timing.loadEventEnd > 0) {
      return timing.loadEventEnd - timing.navigationStart;
    }
  } catch (error) {
    // Ignore timing API errors
  }
  
  return 0;
};

const shouldExcludeImage = (img) => {
  // Check for excluded classes
  const hasExcludedClass = IMAGE_FILTER_CONFIG.EXCLUDED_CLASSES.some(className => 
    img.classList.contains(className)
  );
  
  if (hasExcludedClass) return true;
  
  // Check for empty alt attribute (decorative images)
  if (img.getAttribute('alt') === '') return true;
  
  // Check for excluded keywords in src
  const hasExcludedKeyword = IMAGE_FILTER_CONFIG.EXCLUDED_KEYWORDS.some(keyword => 
    img.src.includes(keyword)
  );
  
  if (hasExcludedKeyword) return true;
  
  // Check minimum dimensions
  const rect = img.getBoundingClientRect();
  return rect.width < IMAGE_FILTER_CONFIG.MIN_DIMENSIONS.WIDTH || 
         rect.height < IMAGE_FILTER_CONFIG.MIN_DIMENSIONS.HEIGHT;
};

const calculateImageSize = (img) => {
  if (!img.complete || img.naturalWidth === 0) return 0;
  
  const pixelCount = img.naturalWidth * img.naturalHeight;
  const estimatedBytes = pixelCount * IMAGE_FILTER_CONFIG.SIZE_CALCULATION.BYTES_PER_PIXEL;
  return estimatedBytes / IMAGE_FILTER_CONFIG.SIZE_CALCULATION.BYTES_TO_KB;
};

const getContentImages = () => {
  const images = document.querySelectorAll('img');
  return Array.from(images).filter(img => !shouldExcludeImage(img));
};

const analyzeImages = () => {
  const contentImages = getContentImages();
  let loadedCount = 0;
  let totalSize = 0;
  
  contentImages.forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      loadedCount++;
      totalSize += calculateImageSize(img);
    }
  });
  
  return {
    total: contentImages.length,
    loaded: loadedCount,
    size: Math.round(totalSize)
  };
};

const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    ...INITIAL_METRICS,
    isSafari: detectSafariBrowser()
  });

  // Performance measurement functions
  // ---------------------------------
  const measureLCPFallback = () => {
    if (!isPerformanceAPIAvailable()) return;
    
    const navigation = getNavigationEntry();
    if (navigation) {
      const loadTime = calculateLoadTime(navigation, true) || calculateLoadTime(navigation, false);
      if (loadTime > 0) {
        setMetrics(prev => ({ ...prev, lcp: loadTime }));
        return;
      }
    }
    
    // Final fallback to deprecated timing API
    const fallbackTime = getFallbackTimingData();
    if (fallbackTime > 0) {
      setMetrics(prev => ({ ...prev, lcp: fallbackTime }));
    }
  };

  const updateMetricsFromEntry = (entry) => {
    switch (entry.entryType) {
      case PERFORMANCE_ENTRY_TYPES.LCP:
        setMetrics(prev => ({ 
          ...prev, 
          lcp: entry.startTime,
          lastUpdate: Date.now()
        }));
        break;
        
      case PERFORMANCE_ENTRY_TYPES.FID:
        const fidValue = entry.processingStart - entry.startTime;
        setMetrics(prev => ({ 
          ...prev, 
          fid: fidValue,
          lastUpdate: Date.now()
        }));
        break;
        
      case PERFORMANCE_ENTRY_TYPES.CLS:
        if (!entry.hadRecentInput) {
          setMetrics(prev => ({ 
            ...prev, 
            cls: (prev.cls || 0) + entry.value,
            lastUpdate: Date.now()
          }));
        }
        break;
        
      case PERFORMANCE_ENTRY_TYPES.NAVIGATION:
        if (entry.loadEventEnd > 0) {
          setMetrics(prev => ({ 
            ...prev, 
            lastUpdate: Date.now()
          }));
        }
        break;
    }
  };

  const updateImageMetrics = () => {
    const imageAnalysis = analyzeImages();
    setMetrics(prev => ({ 
      ...prev, 
      imageCount: imageAnalysis.total,
      loadedImages: imageAnalysis.loaded,
      totalImageSize: imageAnalysis.size,
      lastUpdate: Date.now()
    }));
  };

  // Performance Observer effect
  // ---------------------------
  useEffect(() => {
    if (isServerSideRendering() || metrics.isSafari) return;

    let observer = null;
    let fallbackTimer = null;

    if (isPerformanceObserverAvailable()) {
      try {
        observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(updateMetricsFromEntry);
        });

        observer.observe({ 
          entryTypes: [
            PERFORMANCE_ENTRY_TYPES.LCP, 
            PERFORMANCE_ENTRY_TYPES.FID, 
            PERFORMANCE_ENTRY_TYPES.CLS
          ] 
        });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }

    const setupFallbacks = () => {
      fallbackTimer = setTimeout(measureLCPFallback, PERFORMANCE_CONFIG.TIMING.FALLBACK_DELAY);
    };

    const fallbackSetupTimer = setTimeout(setupFallbacks, PERFORMANCE_CONFIG.TIMING.FALLBACK_SETUP_DELAY);

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

// Optimization suggestions
// ------------------------
const getOptimizationSuggestions = (metrics) => {
  const suggestions = [];

  if (metrics.lcp && metrics.lcp > PERFORMANCE_CONFIG.THRESHOLDS.LCP) {
    suggestions.push({
      type: 'warning',
      message: `LCP ist ${Math.round(metrics.lcp)}ms (Ziel: <${PERFORMANCE_CONFIG.THRESHOLDS.LCP}ms)`,
      suggestion: 'Bilder optimieren oder Lazy Loading verbessern'
    });
  }

  if (metrics.fid && metrics.fid > PERFORMANCE_CONFIG.THRESHOLDS.FID) {
    suggestions.push({
      type: 'warning',
      message: `FID ist ${Math.round(metrics.fid)}ms (Ziel: <${PERFORMANCE_CONFIG.THRESHOLDS.FID}ms)`,
      suggestion: 'JavaScript-Ausführung optimieren'
    });
  }

  if (metrics.cls && metrics.cls > PERFORMANCE_CONFIG.THRESHOLDS.CLS) {
    suggestions.push({
      type: 'warning',
      message: `CLS ist ${metrics.cls.toFixed(3)} (Ziel: <${PERFORMANCE_CONFIG.THRESHOLDS.CLS})`,
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
    <div className={CSS_CLASSES.CONTAINER}>
      <button 
        className={CSS_CLASSES.TOGGLE}
        onClick={() => setShowDetails(!showDetails)}
        title="Performance Monitor"
      >
        📊
      </button>
      
      {showDetails && (
        <div className={CSS_CLASSES.PANEL}>
          <h3>{isGerman ? 'Leistungs-Metriken' : 'Performance Metrics'}</h3>
          
          {metrics.isSafari ? (
            <div className={CSS_CLASSES.SAFARI_NOTICE}>
              <p style={{color: '#f59e0b', fontSize: '14px', margin: '10px 0', padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)'}}>
                {isGerman 
                  ? '⚠️ Leistungs-Metriken werden in Safari nicht unterstützt - Messungen sind dort unzuverlässig'
                  : '⚠️ Performance metrics not supported on Safari - measurements are unreliable there'
                }
              </p>
            </div>
          ) : (
            <div className={CSS_CLASSES.METRICS}>
            <div className={CSS_CLASSES.METRIC}>
              <span className={CSS_CLASSES.METRIC_LABEL}>LCP:</span>
              <span className={`${CSS_CLASSES.METRIC_VALUE} ${metrics.lcp && metrics.lcp > PERFORMANCE_CONFIG.THRESHOLDS.LCP ? CSS_CLASSES.METRIC_WARNING : CSS_CLASSES.METRIC_GOOD}`}>
                {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : (isGerman ? 'Lädt...' : 'Loading...')}
              </span>
            </div>
            
            <div className={CSS_CLASSES.METRIC}>
              <span className={CSS_CLASSES.METRIC_LABEL}>FID:</span>
              <span className={`${CSS_CLASSES.METRIC_VALUE} ${metrics.fid && metrics.fid > PERFORMANCE_CONFIG.THRESHOLDS.FID ? CSS_CLASSES.METRIC_WARNING : CSS_CLASSES.METRIC_GOOD}`}>
                {metrics.fid ? `${Math.round(metrics.fid)}ms` : (isGerman ? 'Noch keine Interaktion' : 'No interaction yet')}
              </span>
            </div>
            
            <div className={CSS_CLASSES.METRIC}>
              <span className={CSS_CLASSES.METRIC_LABEL}>CLS:</span>
              <span className={`${CSS_CLASSES.METRIC_VALUE} ${metrics.cls && metrics.cls > PERFORMANCE_CONFIG.THRESHOLDS.CLS ? CSS_CLASSES.METRIC_WARNING : CSS_CLASSES.METRIC_GOOD}`}>
                {metrics.cls ? metrics.cls.toFixed(3) : (isGerman ? 'Lädt...' : 'Loading...')}
              </span>
            </div>
            
            <div className={CSS_CLASSES.METRIC}>
              <span className={CSS_CLASSES.METRIC_LABEL}>Images:</span>
              <span className={CSS_CLASSES.METRIC_VALUE}>
                {metrics.loadedImages}/{metrics.imageCount}
              </span>
            </div>
            
          </div>
          )}
          
          {!metrics.isSafari && suggestions.length > 0 && (
            <div className={CSS_CLASSES.SUGGESTIONS}>
              <h4>{isGerman ? 'Optimierungsvorschläge:' : 'Optimization Suggestions:'}</h4>
              {suggestions.map((suggestion, index) => (
                <div key={index} className={`${CSS_CLASSES.SUGGESTION} ${CSS_CLASSES.SUGGESTION_PREFIX}${suggestion.type}`}>
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
