// Project Overlay Component
// ========================

import React, { useEffect } from 'react';

// Constants
// ---------
const CSS_CLASSES = {
  OVERLAY: 'project-iframe-overlay',
  CLOSE_BUTTON: 'project-overlay__close-btn',
  CONTENT: 'project-overlay__content',
  IFRAME: 'project-overlay__iframe'
};

const ARIA_LABELS = {
  CLOSE_PROJECT: 'Close project',
  PROJECT_DEMO: 'Project demo',
  MODAL_DESCRIPTION: 'Project demonstration in iframe'
};

const EVENTS = {
  PROJECT_CLOSE: 'project:close'
};

export default function ProjectOverlay({ projectOverlayUrl }) {
  // Early return for inactive state
  if (!projectOverlayUrl) return null;

  // Handle ESC key to close overlay
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        window.dispatchEvent(new Event(EVENTS.PROJECT_CLOSE));
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    window.dispatchEvent(new Event(EVENTS.PROJECT_CLOSE));
  };

  return (
    <div
      className={CSS_CLASSES.OVERLAY}
      role="dialog"
      aria-modal="true"
      aria-label={ARIA_LABELS.PROJECT_DEMO}
      aria-describedby="project-overlay-description"
    >
      <span id="project-overlay-description" className="sr-only">
        {ARIA_LABELS.MODAL_DESCRIPTION}
      </span>
      
      <button
        type="button"
        className={CSS_CLASSES.CLOSE_BUTTON}
        aria-label={ARIA_LABELS.CLOSE_PROJECT}
        onClick={handleClose}
      >
        ×
      </button>
      
      <div className={CSS_CLASSES.CONTENT}>
        <iframe
          title={ARIA_LABELS.PROJECT_DEMO}
          src={projectOverlayUrl}
          className={CSS_CLASSES.IFRAME}
          loading="lazy"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
