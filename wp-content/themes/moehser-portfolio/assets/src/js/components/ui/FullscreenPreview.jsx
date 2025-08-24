// Fullscreen Preview Component
// ===========================

// Fullscreen iframe preview for live project demos
// ------------------------------

import React from 'react';
import BackToProjectsButton from './BackToProjectsButton.jsx';

export default function FullscreenPreview({ isFullscreenPreview, fullscreenProject }) {
  if (!isFullscreenPreview || !fullscreenProject) return null;

  return (
    <div
      className="fullscreen-preview-overlay"
      role="dialog"
      aria-modal="true"
    >
      {/* Right side menu bar */}
      <BackToProjectsButton />
      
      {/* Fullscreen iframe */}
      <iframe
        title="Live Preview"
        src={fullscreenProject.url}
        className="fullscreen-preview__iframe"
        loading="lazy"
      />
    </div>
  );
}
