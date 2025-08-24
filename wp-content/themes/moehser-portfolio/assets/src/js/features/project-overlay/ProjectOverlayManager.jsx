// Project Overlay Manager Component
// =================================

// Manages project overlay state and event listeners
// ------------------------------

import { useEffect, useState } from 'react';

export default function ProjectOverlayManager() {
  const [projectOverlayUrl, setProjectOverlayUrl] = useState('');

  // Extract URL from event detail safely
  const extractProjectUrl = (event) => {
    if (!event || !event.detail || typeof event.detail.url !== 'string') {
      return '';
    }
    return event.detail.url;
  };

  // Update terminal state safely
  const updateTerminalState = (isOpen) => {
    if (typeof window !== 'undefined') {
      window.__terminalOpen = isOpen;
    }
  };

  // Listen for project overlay open/close events and Escape key
  useEffect(() => {
    const openProject = (event) => {
      const url = extractProjectUrl(event);
      if (!url) return;
      
      setProjectOverlayUrl(url);
      updateTerminalState(true);
    };

    const closeProject = () => {
      setProjectOverlayUrl('');
      updateTerminalState(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && projectOverlayUrl) {
        closeProject();
      }
    };
    
    // Add event listeners
    window.addEventListener('project:open', openProject);
    window.addEventListener('project:close', closeProject);
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('project:open', openProject);
      window.removeEventListener('project:close', closeProject);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [projectOverlayUrl]);

  return { projectOverlayUrl, setProjectOverlayUrl };
}
