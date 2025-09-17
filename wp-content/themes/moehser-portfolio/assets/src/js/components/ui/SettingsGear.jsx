// Settings Gear Component
// ======================

import React, { useState, useRef, useEffect } from 'react';
import gearIcon from '../../../img/settings-gear.svg';
import { usePerformanceMonitor } from '../../features/performance/PerformanceMonitor.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// Constants
// ---------
const THEME_CONFIG = {
  DARK_CLASS: 'theme-dark',
  STORAGE_KEY: 'theme',
  VALUES: {
    DARK: 'dark',
    LIGHT: 'light'
  }
};

const PERFORMANCE_CONFIG = {
  THRESHOLDS: {
    LCP_WARNING: 2500, // milliseconds
    FID_WARNING: 100,  // milliseconds
    CLS_WARNING: 0.1   // layout shift score
  }
};

const EVENT_CONFIG = {
  TERMINAL_OPEN: 'terminal:open',
  KEYS: {
    ESCAPE: 'Escape'
  }
};

const CSS_CLASSES = {
  CONTAINER: 'settings-gear',
  TRIGGER: 'settings-gear__trigger',
  MENU: 'settings-gear__menu',
  OPTION: 'settings-gear__option',
  OPTION_DISABLED: 'settings-gear__option--disabled',
  ICON: 'settings-gear__icon',
  LABEL: 'settings-gear__label',
  SECTION: 'settings-gear__section',
  SECTION_HEADER: 'settings-gear__section-header',
  SECTION_TITLE: 'settings-gear__section-title',
  PERFORMANCE_PANEL: 'settings-gear__performance-panel',
  PERFORMANCE_HEADER: 'settings-gear__performance-header',
  PERFORMANCE_BACK: 'settings-gear__performance-back',
  PERFORMANCE_CLOSE: 'settings-gear__performance-close',
  PERFORMANCE_METRICS: 'settings-gear__performance-metrics',
  METRIC: 'settings-gear__metric',
  METRIC_INFO: 'settings-gear__metric-info',
  METRIC_LABEL: 'settings-gear__metric-label',
  METRIC_TOOLTIP: 'settings-gear__metric-tooltip',
  METRIC_VALUE: 'settings-gear__metric-value'
};

const ICONS = {
  THEME: {
    DARK: '☀️',
    LIGHT: '🌙'
  },
  LANGUAGE: {
    GERMAN: '🇬🇧',
    ENGLISH: '🇩🇪'
  },
  PERFORMANCE: '📊',
  TERMINAL: '⌨️',
  BACK_ARROW: '←',
  CLOSE: '×'
};

const EVENT_OPTIONS = {
  MOUSE_DOWN: { passive: true },
  KEY_DOWN: { passive: true }
};

export default function SettingsGear() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const performanceRef = useRef(null);
  const metrics = usePerformanceMonitor();
  const { isGerman, switchLanguage } = useLanguage();

  // Utility functions
  // -----------------
  const getSystemThemePreference = () => {
    return window.matchMedia && 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const applyTheme = (isDarkTheme) => {
    const body = document.body;
    if (isDarkTheme) {
      body.classList.add(THEME_CONFIG.DARK_CLASS);
    } else {
      body.classList.remove(THEME_CONFIG.DARK_CLASS);
    }
    return body.classList.contains(THEME_CONFIG.DARK_CLASS);
  };

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
    
    if (savedTheme === THEME_CONFIG.VALUES.DARK) {
      return applyTheme(true);
    } else if (savedTheme === THEME_CONFIG.VALUES.LIGHT) {
      return applyTheme(false);
    } else {
      // Use system preference if no saved theme
      const prefersDark = getSystemThemePreference();
      return applyTheme(prefersDark);
    }
  };

  const saveThemePreference = (isDarkTheme) => {
    const themeValue = isDarkTheme ? THEME_CONFIG.VALUES.DARK : THEME_CONFIG.VALUES.LIGHT;
    localStorage.setItem(THEME_CONFIG.STORAGE_KEY, themeValue);
  };

  const isClickOutsideAllElements = (event) => {
    const isOutsideMenu = !menuRef.current?.contains(event.target);
    const isOutsideButton = !buttonRef.current?.contains(event.target);
    const isOutsidePerformance = !performanceRef.current?.contains(event.target);
    
    return isOutsideMenu && isOutsideButton && isOutsidePerformance;
  };

  const getPerformanceMetricClassName = (metricType, value) => {
    if (!value) return CSS_CLASSES.METRIC_VALUE;
    
    let isWarning = false;
    switch (metricType) {
      case 'lcp':
        isWarning = value > PERFORMANCE_CONFIG.THRESHOLDS.LCP_WARNING;
        break;
      case 'fid':
        isWarning = value > PERFORMANCE_CONFIG.THRESHOLDS.FID_WARNING;
        break;
      case 'cls':
        isWarning = value > PERFORMANCE_CONFIG.THRESHOLDS.CLS_WARNING;
        break;
      default:
        isWarning = false;
    }
    
    return `${CSS_CLASSES.METRIC_VALUE} ${isWarning ? 'warning' : 'good'}`;
  };

  const dispatchTerminalEvent = () => {
    try {
      const event = new CustomEvent(EVENT_CONFIG.TERMINAL_OPEN);
      window.dispatchEvent(event);
      return true;
    } catch (error) {
      console.log('Terminal not available');
      return false;
    }
  };

  // Theme initialization effect
  // ---------------------------
  useEffect(() => {
    const isDarkTheme = initializeTheme();
    setIsDark(isDarkTheme);
  }, []);

  // Event handlers
  // ---------------
  const handleClickOutside = (event) => {
    if (isClickOutsideAllElements(event)) {
      if (showPerformance) {
        setShowPerformance(false);
        setIsOpen(false);
      } else {
        setIsOpen(false);
      }
    }
  };

  const handleEscapeKey = (event) => {
    if (event.key === EVENT_CONFIG.KEYS.ESCAPE) {
      if (showPerformance) {
        setShowPerformance(false);
      } else if (isOpen) {
        setIsOpen(false);
      }
    }
  };

  // Outside click and keyboard navigation effect
  // --------------------------------------------
  useEffect(() => {
    if (isOpen || showPerformance) {
      document.addEventListener('mousedown', handleClickOutside, EVENT_OPTIONS.MOUSE_DOWN);
      document.addEventListener('keydown', handleEscapeKey, EVENT_OPTIONS.KEY_DOWN);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, showPerformance]);

  // Action handlers
  // ---------------
  const toggleTheme = () => {
    const body = document.body;
    body.classList.toggle(THEME_CONFIG.DARK_CLASS);
    
    const isDarkTheme = body.classList.contains(THEME_CONFIG.DARK_CLASS);
    setIsDark(isDarkTheme);
    
    saveThemePreference(isDarkTheme);
    setIsOpen(false);
  };

  const handleTerminalOpen = () => {
    dispatchTerminalEvent();
    setIsOpen(false);
  };

  const togglePerformanceMetrics = () => {
    setShowPerformance(!showPerformance);
  };

  const handlePerformanceBack = () => {
    setShowPerformance(false);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handlePerformanceClose = () => {
    setShowPerformance(false);
    setIsOpen(false);
  };

  return (
    <div className={CSS_CLASSES.CONTAINER}>
      <button
        ref={buttonRef}
        className={CSS_CLASSES.TRIGGER}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close settings menu' : 'Open settings menu'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Settings"
      >
        <img src={gearIcon} alt="" aria-hidden="true" />
      </button>
      
      {isOpen && !showPerformance && (
        <div 
          ref={menuRef} 
          className={CSS_CLASSES.MENU}
          role="menu"
          aria-label={isGerman ? 'Einstellungsmenü' : 'Settings menu'}
        >
          <button
            className={CSS_CLASSES.OPTION}
            onClick={toggleTheme}
            aria-label={isDark 
              ? (isGerman ? 'Zu Hell-Modus wechseln' : 'Switch to light mode')
              : (isGerman ? 'Zu Dunkel-Modus wechseln' : 'Switch to dark mode')
            }
          >
            <span className={CSS_CLASSES.ICON} aria-hidden="true">
              {isDark ? ICONS.THEME.DARK : ICONS.THEME.LIGHT}
            </span>
            <span className={CSS_CLASSES.LABEL}>
              {isDark 
                ? (isGerman ? 'Hell-Modus' : 'Light Mode')
                : (isGerman ? 'Dunkel-Modus' : 'Dark Mode')
              }
            </span>
          </button>
          
          <div className={CSS_CLASSES.SECTION}>
            <div className={CSS_CLASSES.SECTION_HEADER}>
              <span className={CSS_CLASSES.SECTION_TITLE}>
                {isGerman ? 'Sprache' : 'Language'}
              </span>
            </div>
            <button
              className={CSS_CLASSES.OPTION}
              onClick={switchLanguage}
              aria-label={isGerman 
                ? 'Zu English wechseln' 
                : 'Switch to German'
              }
            >
              <span className={CSS_CLASSES.ICON} aria-hidden="true">
                {isGerman ? ICONS.LANGUAGE.GERMAN : ICONS.LANGUAGE.ENGLISH}
              </span>
              <span className={CSS_CLASSES.LABEL}>
                {isGerman ? 'English' : 'German'}
              </span>
            </button>
          </div>
          
          <button
            className={`${CSS_CLASSES.OPTION} ${metrics.isSafari ? CSS_CLASSES.OPTION_DISABLED : ''}`}
            onClick={metrics.isSafari ? undefined : togglePerformanceMetrics}
            aria-label={metrics.isSafari 
              ? (isGerman ? 'Performance-Metriken nicht für Safari verfügbar' : 'Performance metrics not available on Safari')
              : (isGerman ? 'Performance-Metriken öffnen' : 'Open performance metrics')
            }
            title={metrics.isSafari ? (isGerman ? 'Nicht für Safari unterstützt' : 'Not supported on Safari') : ''}
            disabled={metrics.isSafari}
          >
            <span className={CSS_CLASSES.ICON} aria-hidden="true">{ICONS.PERFORMANCE}</span>
            <span className={CSS_CLASSES.LABEL}>
              {isGerman ? 'Leistung' : 'Performance'}
            </span>
          </button>
          
          <button
            className={CSS_CLASSES.OPTION}
            onClick={handleTerminalOpen}
            aria-label={isGerman ? 'Terminal öffnen' : 'Open terminal'}
          >
            <span className={CSS_CLASSES.ICON} aria-hidden="true">{ICONS.TERMINAL}</span>
            <span className={CSS_CLASSES.LABEL}>
              {isGerman ? 'Terminal' : 'Terminal'}
            </span>
          </button>
        </div>
      )}

      {/* Performance Metrics Panel */}
      {showPerformance && (
        <div ref={performanceRef} className={CSS_CLASSES.PERFORMANCE_PANEL}>
          <div className={CSS_CLASSES.PERFORMANCE_HEADER}>
            <button 
              className={CSS_CLASSES.PERFORMANCE_BACK}
              onClick={handlePerformanceBack}
              aria-label={isGerman ? 'Zurück zu Einstellungen' : 'Back to settings'}
              title={isGerman ? 'Zurück zu Einstellungen' : 'Back to settings'}
            >
              {ICONS.BACK_ARROW}
            </button>
            <h3>{isGerman ? 'Leistungs-Metriken' : 'Performance Metrics'}</h3>
            <button 
              className={CSS_CLASSES.PERFORMANCE_CLOSE}
              onClick={handlePerformanceClose}
              aria-label={isGerman ? 'Einstellungen schließen' : 'Close settings'}
              title={isGerman ? 'Einstellungen schließen' : 'Close settings'}
            >
              {ICONS.CLOSE}
            </button>
          </div>
          
          <div className={CSS_CLASSES.PERFORMANCE_METRICS}>
            {metrics.isSafari ? (
              <div style={{padding: '20px', textAlign: 'center', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)'}}>
                <p style={{margin: '0', fontSize: '14px'}}>
                  {isGerman 
                    ? '⚠️ Leistungs-Metriken werden in Safari nicht unterstützt - Messungen sind dort unzuverlässig'
                    : '⚠️ Performance metrics not supported on Safari - measurements are unreliable there'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className={CSS_CLASSES.METRIC}>
              <div className={CSS_CLASSES.METRIC_INFO}>
                <span className={CSS_CLASSES.METRIC_LABEL}>LCP:</span>
                <span className={CSS_CLASSES.METRIC_TOOLTIP}>
                  {isGerman 
                    ? 'Largest Contentful Paint - Zeit bis das größte Element lädt'
                    : 'Largest Contentful Paint - Time until the largest element loads'
                  }
                </span>
              </div>
              <span className={getPerformanceMetricClassName('lcp', metrics.lcp)}>
                {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : (isGerman ? 'Lädt...' : 'Loading...')}
              </span>
            </div>
            
            <div className={CSS_CLASSES.METRIC}>
              <div className={CSS_CLASSES.METRIC_INFO}>
                <span className={CSS_CLASSES.METRIC_LABEL}>FID:</span>
                <span className={CSS_CLASSES.METRIC_TOOLTIP}>
                  {isGerman 
                    ? 'First Input Delay - Zeit von erster Benutzerinteraktion zur Browser-Antwort'
                    : 'First Input Delay - Time from first user interaction to browser response'
                  }
                </span>
              </div>
              <span className={getPerformanceMetricClassName('fid', metrics.fid)}>
                {metrics.fid ? `${Math.round(metrics.fid)}ms` : (isGerman ? 'Noch keine Interaktion' : 'No interaction yet')}
              </span>
            </div>
            
            <div className={CSS_CLASSES.METRIC}>
              <div className={CSS_CLASSES.METRIC_INFO}>
                <span className={CSS_CLASSES.METRIC_LABEL}>CLS:</span>
                <span className={CSS_CLASSES.METRIC_TOOLTIP}>
                  {isGerman 
                    ? 'Cumulative Layout Shift - Layout-Stabilität während des Ladens'
                    : 'Cumulative Layout Shift - Layout stability during loading'
                  }
                </span>
              </div>
              <span className={getPerformanceMetricClassName('cls', metrics.cls)}>
                {metrics.cls ? metrics.cls.toFixed(3) : (isGerman ? 'Lädt...' : 'Loading...')}
              </span>
            </div>
            
            <div className={CSS_CLASSES.METRIC}>
              <div className={CSS_CLASSES.METRIC_INFO}>
                <span className={CSS_CLASSES.METRIC_LABEL}>Images:</span>
                <span className={CSS_CLASSES.METRIC_TOOLTIP}>
                  {isGerman 
                    ? 'Bild-Ladestatus - Anzahl geladener Bilder vs Gesamtanzahl'
                    : 'Image Loading Progress - Number of loaded images vs total count'
                  }
                </span>
              </div>
              <span className={CSS_CLASSES.METRIC_VALUE}>
                {metrics.loadedImages}/{metrics.imageCount}
              </span>
            </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
