// Fullscreen Preview Component
// ===========================

import React, { useEffect } from 'react';
import BackToProjectsButton from './BackToProjectsButton.jsx';

// Constants
// ---------
const CSS_CLASSES = {
  OVERLAY: 'fullscreen-preview-overlay',
  IFRAME: 'fullscreen-preview__iframe'
};

const ARIA_LABELS = {
  DIALOG_TITLE: 'Live Preview',
  MODAL_DESCRIPTION: 'Fullscreen preview of the selected project'
};

export default function FullscreenPreview({ isFullscreenPreview, fullscreenProject }) {
  // Early return for inactive state
  if (!isFullscreenPreview || !fullscreenProject) return null;

  // Prevent background scrolling when fullscreen is active
  useEffect(() => {
    if (isFullscreenPreview) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreenPreview]);

  return (
    <div
      className={CSS_CLASSES.OVERLAY}
      role="dialog"
      aria-modal="true"
      aria-label={ARIA_LABELS.DIALOG_TITLE}
      aria-describedby="fullscreen-preview-description"
    >
      <span id="fullscreen-preview-description" className="sr-only">
        {ARIA_LABELS.MODAL_DESCRIPTION}
      </span>
      
      <BackToProjectsButton />
      
      <iframe
        title={`${ARIA_LABELS.DIALOG_TITLE} - ${fullscreenProject.title || 'Project'}`}
        src={fullscreenProject.url}
        className={CSS_CLASSES.IFRAME}
        loading="lazy"
        allow="fullscreen"
      />
    </div>
  );
}
