// Scroll Progress Component
// ========================

// Top scroll progress bar with container detection
// ------------------------------

import React, { useRef, useEffect } from 'react';

// Timing and progress constants
// ------------------------------
const TIMING = {
  CONTAINER_CHECK_DELAY: 100  // milliseconds
};

const PROGRESS = {
  MAX: 100,  // maximum percentage
  MIN: 0     // minimum percentage
};

export default function ScrollProgress() {
  const topRef = useRef(null);

  // Calculate scroll progress percentage
  const calculateProgress = (container) => {
    const total = container.scrollHeight - container.clientHeight;
    if (total <= 0) return PROGRESS.MIN;
    
    const scrollPercentage = (container.scrollTop / total) * 100;
    return Math.min(PROGRESS.MAX, Math.max(PROGRESS.MIN, scrollPercentage));
  };

  // Update progress bar with calculated percentage
  const updateProgress = (progress) => {
    if (topRef.current) {
      topRef.current.style.setProperty('--progress', `${progress}%`);
    }
  };

  // Handle scroll events
  const handleScroll = () => {
    const container = document.getElementById('content-scroll');
    if (!container) return;
    
    const progress = calculateProgress(container);
    updateProgress(progress);
  };

  useEffect(() => {
    // Wait for content-scroll container to be available
    const waitForContainer = () => {
      const container = document.getElementById('content-scroll');
      
      if (container) {
        // Initialize progress bar
        handleScroll();
        
        // Add event listeners
        container.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        
        // Return cleanup function
        return () => {
          container.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', handleScroll);
        };
      } else {
        // Retry after delay
        setTimeout(waitForContainer, TIMING.CONTAINER_CHECK_DELAY);
      }
    };
    
    waitForContainer();
  }, []);

  return (
    <div className="scroll-progress-top" ref={topRef} aria-hidden="true">
      <div className="scroll-progress-top__bar" />
    </div>
  );
}
