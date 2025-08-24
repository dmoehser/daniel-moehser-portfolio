// Back to Projects Button Component
// ================================

// Right-side menu bar for exiting fullscreen preview
// ------------------------------

import React, { useEffect, useRef, useState } from 'react';

// Animation timing constants
// ------------------------------
const TIMING = {
  AUTO_MINIMIZE: 3200,  // 3.2 seconds
  TRANSITION: 300        // 0.3 seconds
};

// Menu dimensions
// ------------------------------
const DIMENSIONS = {
  EXPANDED_WIDTH: '180px',
  MINIMIZED_WIDTH: '48px',
  HEIGHT: '48px'
};

const BackToProjectsButton = () => {
  const rightMenuRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-minimize functionality
  useEffect(() => {
    const autoMinimizeTimer = setTimeout(() => {
      setIsMinimized(true);
    }, TIMING.AUTO_MINIMIZE);

    return () => clearTimeout(autoMinimizeTimer);
  }, []);

  const handleMouseEnter = () => {
    setIsMinimized(false);
  };

  const handleMouseLeave = () => {
    setIsMinimized(true);
  };

  const handleClick = () => {
    try { 
      window.dispatchEvent(new Event('project:fullscreen:close')); 
    } catch {} 
  };

  return (
    <div
      ref={rightMenuRef}
      className={`back-to-projects ${isMinimized ? 'back-to-projects--minimized' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Arrow Icon */}
      <div className="back-to-projects__arrow">
        ←
      </div>
      
      {/* Menu Text */}
      <div className="back-to-projects__text">
        Back to Projects
      </div>
    </div>
  );
};

export default BackToProjectsButton;
