// Scroll Progress Component
// ========================

import React, { useRef, useEffect } from 'react';

// Constants
// ---------
const TIMING_CONFIG = {
  CONTAINER_CHECK_DELAY: 100, // milliseconds
  CONTAINER_CHECK_MAX_RETRIES: 50 // maximum retry attempts
};

const PROGRESS_CONFIG = {
  MAX: 100, // maximum percentage
  MIN: 0    // minimum percentage
};

const DOM_CONFIG = {
  CONTAINER_ID: 'content-scroll',
  CSS_PROPERTY: '--progress'
};

const CSS_CLASSES = {
  CONTAINER: 'scroll-progress-top',
  BAR: 'scroll-progress-top__bar'
};

const EVENT_OPTIONS = {
  SCROLL: { passive: true },
  RESIZE: { passive: true }
};

export default function ScrollProgress() {
  const topRef = useRef(null);

  // Utility functions
  const calculateScrollProgress = (container) => {
    const scrollableHeight = container.scrollHeight - container.clientHeight;
    if (scrollableHeight <= 0) return PROGRESS_CONFIG.MIN;
    
    const scrollPercentage = (container.scrollTop / scrollableHeight) * 100;
    return Math.min(PROGRESS_CONFIG.MAX, Math.max(PROGRESS_CONFIG.MIN, scrollPercentage));
  };

  const updateProgressBar = (progressPercentage) => {
    if (topRef.current) {
      topRef.current.style.setProperty(DOM_CONFIG.CSS_PROPERTY, `${progressPercentage}%`);
    }
  };

  const handleScrollEvent = () => {
    const container = document.getElementById(DOM_CONFIG.CONTAINER_ID);
    if (!container) return;
    
    const progress = calculateScrollProgress(container);
    updateProgressBar(progress);
  };

  useEffect(() => {
    let retryCount = 0;
    let cleanupFunction = null;

    const initializeScrollProgress = () => {
      const container = document.getElementById(DOM_CONFIG.CONTAINER_ID);
      
      if (container) {
        // Initialize progress bar
        handleScrollEvent();
        
        // Add event listeners with passive options for better performance
        container.addEventListener('scroll', handleScrollEvent, EVENT_OPTIONS.SCROLL);
        window.addEventListener('resize', handleScrollEvent, EVENT_OPTIONS.RESIZE);
        
        // Store cleanup function
        cleanupFunction = () => {
          container.removeEventListener('scroll', handleScrollEvent);
          window.removeEventListener('resize', handleScrollEvent);
        };
        
        return true; // Success
      } else if (retryCount < TIMING_CONFIG.CONTAINER_CHECK_MAX_RETRIES) {
        // Retry after delay with exponential backoff protection
        retryCount++;
        setTimeout(initializeScrollProgress, TIMING_CONFIG.CONTAINER_CHECK_DELAY);
        return false; // Retry
      } else {
        console.warn(`ScrollProgress: Container '${DOM_CONFIG.CONTAINER_ID}' not found after ${retryCount} retries`);
        return false; // Failed
      }
    };
    
    initializeScrollProgress();
    
    // Cleanup function for useEffect
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, []);

  return (
    <div className={CSS_CLASSES.CONTAINER} ref={topRef} aria-hidden="true">
      <div className={CSS_CLASSES.BAR} />
    </div>
  );
}
