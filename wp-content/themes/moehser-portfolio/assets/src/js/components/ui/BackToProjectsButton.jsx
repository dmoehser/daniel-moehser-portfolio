// Back to Projects Button Component
// ================================

// Right-side menu bar for exiting fullscreen preview
// ------------------------------

import React, { useEffect, useRef, useState } from 'react';

// Constants
// =========

// Animation timing
const TIMING = {
  AUTO_MINIMIZE: 3200,  // 3.2 seconds
  TRANSITION: 300        // 0.3 seconds
};

// Menu dimensions
const DIMENSIONS = {
  EXPANDED_WIDTH: '180px',
  MINIMIZED_WIDTH: '48px',
  HEIGHT: '48px'
};

// Event names
const EVENTS = {
  PROJECT_FULLSCREEN_CLOSE: 'project:fullscreen:close'
};

// CSS classes
const CSS_CLASSES = {
  BASE: 'back-to-projects',
  MINIMIZED: 'back-to-projects--minimized',
  ARROW: 'back-to-projects__arrow',
  TEXT: 'back-to-projects__text'
};

// Helper Functions
// ================

// Helper function to dispatch close event
const dispatchCloseEvent = () => {
  try { 
    window.dispatchEvent(new Event(EVENTS.PROJECT_FULLSCREEN_CLOSE)); 
  } catch (error) {
    // Silent fail for event dispatch errors
  }
};

// Helper function to get CSS classes for button
const getButtonClasses = (isMinimized) => {
  const baseClass = CSS_CLASSES.BASE;
  const minimizedClass = isMinimized ? CSS_CLASSES.MINIMIZED : '';
  return `${baseClass} ${minimizedClass}`.trim();
};

// Helper function to create auto-minimize timer
const createAutoMinimizeTimer = (callback) => {
  return setTimeout(callback, TIMING.AUTO_MINIMIZE);
};

const BackToProjectsButton = () => {
  const rightMenuRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-minimize functionality
  useEffect(() => {
    const autoMinimizeTimer = createAutoMinimizeTimer(() => {
      setIsMinimized(true);
    });

    return () => clearTimeout(autoMinimizeTimer);
  }, []);

  // Helper function to handle mouse enter
  const handleMouseEnter = () => {
    setIsMinimized(false);
  };

  // Helper function to handle mouse leave
  const handleMouseLeave = () => {
    setIsMinimized(true);
  };

  // Helper function to handle button click
  const handleClick = () => {
    dispatchCloseEvent();
  };

  return (
    <div
      ref={rightMenuRef}
      className={getButtonClasses(isMinimized)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Arrow Icon */}
      <div className={CSS_CLASSES.ARROW}>
        ←
      </div>
      
      {/* Menu Text */}
      <div className={CSS_CLASSES.TEXT}>
        Back to Projects
      </div>
    </div>
  );
};

export default BackToProjectsButton;
