// Fullscreen Preview Manager Component
// ===================================

import { useEffect, useState } from 'react';

// Constants
// ---------
const EVENT_CONFIG = {
  FULLSCREEN_OPEN: 'project:fullscreen:open',
  FULLSCREEN_CLOSE: 'project:fullscreen:close',
  KEYS: {
    ESCAPE: 'Escape'
  }
};

const INITIAL_STATE = {
  IS_FULLSCREEN: false,
  PROJECT: null
};

const EVENT_OPTIONS = {
  KEYDOWN: { passive: true }
};

export default function FullscreenPreviewManager() {
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(INITIAL_STATE.IS_FULLSCREEN);
  const [fullscreenProject, setFullscreenProject] = useState(INITIAL_STATE.PROJECT);

  // Utility functions
  // -----------------
  const openFullscreenPreview = (projectData) => {
    setIsFullscreenPreview(true);
    setFullscreenProject(projectData);
  };

  const closeFullscreenPreview = () => {
    setIsFullscreenPreview(INITIAL_STATE.IS_FULLSCREEN);
    setFullscreenProject(INITIAL_STATE.PROJECT);
  };

  const dispatchCloseEvent = () => {
    try {
      const closeEvent = new Event(EVENT_CONFIG.FULLSCREEN_CLOSE);
      window.dispatchEvent(closeEvent);
    } catch (error) {
      console.warn('Failed to dispatch fullscreen close event:', error);
    }
  };

  const isEscapeKeyPressed = (event) => {
    return event.key === EVENT_CONFIG.KEYS.ESCAPE;
  };

  // Event handlers
  // --------------
  const handleFullscreenOpen = (event) => {
    if (event.detail) {
      openFullscreenPreview(event.detail);
    }
  };

  const handleFullscreenClose = () => {
    closeFullscreenPreview();
  };

  const handleEscapeKey = (event) => {
    if (isEscapeKeyPressed(event) && isFullscreenPreview) {
      dispatchCloseEvent();
    }
  };

  // Fullscreen preview event listeners effect
  // ------------------------------------------
  useEffect(() => {
    window.addEventListener(EVENT_CONFIG.FULLSCREEN_OPEN, handleFullscreenOpen);
    window.addEventListener(EVENT_CONFIG.FULLSCREEN_CLOSE, handleFullscreenClose);

    return () => {
      window.removeEventListener(EVENT_CONFIG.FULLSCREEN_OPEN, handleFullscreenOpen);
      window.removeEventListener(EVENT_CONFIG.FULLSCREEN_CLOSE, handleFullscreenClose);
    };
  }, []);

  // Escape key handling effect
  // --------------------------
  useEffect(() => {
    window.addEventListener('keydown', handleEscapeKey, EVENT_OPTIONS.KEYDOWN);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isFullscreenPreview]);

  return { 
    isFullscreenPreview, 
    fullscreenProject
  };
}
