// Project Overlay Component
// ========================

// Modal overlay for displaying project demos in iframe
// ------------------------------

import React from 'react';

export default function ProjectOverlay({ projectOverlayUrl, onClose }) {
  if (!projectOverlayUrl) return null;

  const handleClose = () => {
    window.dispatchEvent(new Event('project:close'));
  };

  return (
    <div
      className="project-iframe-overlay"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="project-overlay__close-btn"
        aria-label="Close project"
        onClick={handleClose}
      >
        ×
      </button>
      
      <div className="project-overlay__content">
        <iframe
          title="Project demo"
          src={projectOverlayUrl}
          className="project-overlay__iframe"
          loading="lazy"
        />
      </div>
    </div>
  );
}
