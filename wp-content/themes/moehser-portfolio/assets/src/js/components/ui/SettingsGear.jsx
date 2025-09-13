// Settings Gear Component
// ======================

// Subtle settings gear with theme toggle and terminal access
// ----------------------------------------------------------

import React, { useState, useRef, useEffect } from 'react';
import gearIcon from '../../../img/settings-gear.svg';
import { usePerformanceMonitor } from '../../features/performance/PerformanceMonitor.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function SettingsGear() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const performanceRef = useRef(null);
  const metrics = usePerformanceMonitor();
  const { isGerman, switchLanguage } = useLanguage();

  useEffect(() => {
    // Check current theme
    const body = document.body;
    setIsDark(body.classList.contains('theme-dark'));
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      body.classList.add('theme-dark');
    }
    
    // Use system preference if no saved theme
    if (!savedTheme) {
      const prefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        body.classList.add('theme-dark');
      }
    }
    
    setIsDark(body.classList.contains('theme-dark'));
  }, []);

  useEffect(() => {
    // Close menu when clicking outside or pressing ESC
    const handleClickOutside = (event) => {
      // Check if click is outside all relevant elements
      const isOutsideMenu = !menuRef.current?.contains(event.target);
      const isOutsideButton = !buttonRef.current?.contains(event.target);
      const isOutsidePerformance = !performanceRef.current?.contains(event.target);
      
      if (isOutsideMenu && isOutsideButton && isOutsidePerformance) {
        if (showPerformance) {
          setShowPerformance(false);
          setIsOpen(false);
        } else {
          setIsOpen(false);
        }
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (showPerformance) {
          setShowPerformance(false);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen || showPerformance) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, showPerformance]);

  const toggleTheme = () => {
    const body = document.body;
    body.classList.toggle('theme-dark');
    
    const isDarkTheme = body.classList.contains('theme-dark');
    setIsDark(isDarkTheme);
    
    // Save theme preference
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    setIsOpen(false); // Close menu after action
  };

  const openTerminal = () => {
    // Dispatch terminal open event
    try {
      const event = new CustomEvent('terminal:open');
      window.dispatchEvent(event);
    } catch (error) {
      console.log('Terminal not available');
    }
    setIsOpen(false); // Close menu after action
  };


  // Toggle performance metrics
  const togglePerformance = () => {
    setShowPerformance(!showPerformance);
  };

  // Close performance panel and show settings menu
  const closePerformance = () => {
    setShowPerformance(false);
    // Keep the settings menu open when going back
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Close performance panel completely
  const closePerformanceCompletely = () => {
    setShowPerformance(false);
    setIsOpen(false);
  };

  return (
    <div className="settings-gear">
      <button
        ref={buttonRef}
        className="settings-gear__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open settings"
        title="Settings"
      >
        <img src={gearIcon} alt="" aria-hidden="true" />
      </button>
      
      {isOpen && !showPerformance && (
        <div ref={menuRef} className="settings-gear__menu">
          <button
            className="settings-gear__option"
            onClick={toggleTheme}
          >
            <span className="settings-gear__icon">
              {isDark ? '☀️' : '🌙'}
            </span>
            <span className="settings-gear__label">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          
          <div className="settings-gear__section">
            <div className="settings-gear__section-header">
              <span className="settings-gear__section-title">
                {isGerman ? 'Sprache' : 'Language'}
              </span>
            </div>
            <button
              className="settings-gear__option"
              onClick={switchLanguage}
            >
              <span className="settings-gear__icon">
                {isGerman ? '🇬🇧' : '🇩🇪'}
              </span>
              <span className="settings-gear__label">
                {isGerman ? 'English' : 'German'}
              </span>
            </button>
          </div>
          
          <button
            className="settings-gear__option"
            onClick={togglePerformance}
          >
            <span className="settings-gear__icon">📊</span>
            <span className="settings-gear__label">Performance</span>
          </button>
          
          <button
            className="settings-gear__option"
            onClick={openTerminal}
          >
            <span className="settings-gear__icon">⌨️</span>
            <span className="settings-gear__label">Terminal</span>
          </button>
        </div>
      )}

      {/* Performance Metrics Panel */}
      {showPerformance && (
        <div ref={performanceRef} className="settings-gear__performance-panel">
          <div className="settings-gear__performance-header">
            <button 
              className="settings-gear__performance-back"
              onClick={closePerformance}
              aria-label="Back to settings"
              title="Back to settings"
            >
              ←
            </button>
            <h3>Performance Metrics</h3>
            <button 
              className="settings-gear__performance-close"
              onClick={closePerformanceCompletely}
              aria-label="Close settings"
              title="Close settings"
            >
              ×
            </button>
          </div>
          
          <div className="settings-gear__performance-metrics">
            <div className="settings-gear__metric">
              <div className="settings-gear__metric-info">
                <span className="settings-gear__metric-label">LCP:</span>
                <span className="settings-gear__metric-tooltip">Largest Contentful Paint - Time until the largest element loads</span>
              </div>
              <span className={`settings-gear__metric-value ${metrics.lcp && metrics.lcp > 2500 ? 'warning' : 'good'}`}>
                {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'Loading...'}
              </span>
            </div>
            
            <div className="settings-gear__metric">
              <div className="settings-gear__metric-info">
                <span className="settings-gear__metric-label">INP:</span>
                <span className="settings-gear__metric-tooltip">Interaction to Next Paint - Time from user interaction to visual response</span>
              </div>
              <span className={`settings-gear__metric-value ${metrics.inp && metrics.inp > 200 ? 'warning' : 'good'}`}>
                {metrics.inp ? `${Math.round(metrics.inp)}ms` : 'No interaction yet'}
              </span>
            </div>
            
            <div className="settings-gear__metric">
              <div className="settings-gear__metric-info">
                <span className="settings-gear__metric-label">CLS:</span>
                <span className="settings-gear__metric-tooltip">Cumulative Layout Shift - Layout stability during loading</span>
              </div>
              <span className={`settings-gear__metric-value ${metrics.cls && metrics.cls > 0.1 ? 'warning' : 'good'}`}>
                {metrics.cls ? metrics.cls.toFixed(3) : 'Loading...'}
              </span>
            </div>
            
            <div className="settings-gear__metric">
              <div className="settings-gear__metric-info">
                <span className="settings-gear__metric-label">Images:</span>
                <span className="settings-gear__metric-tooltip">Image Loading Progress - Number of loaded images vs total count</span>
              </div>
              <span className="settings-gear__metric-value">
                {metrics.loadedImages}/{metrics.imageCount}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
