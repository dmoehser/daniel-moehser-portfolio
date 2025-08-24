// Fullscreen Preview Manager Component
// ===================================

// Manages fullscreen preview state and event listeners
// ------------------------------

import { useEffect, useState } from 'react';

export default function FullscreenPreviewManager() {
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [fullscreenProject, setFullscreenProject] = useState(null);

  // Fullscreen preview event listeners
  useEffect(() => {
    const openFullscreen = (e) => {
      setIsFullscreenPreview(true);
      setFullscreenProject(e.detail);
    };
    
    const closeFullscreen = () => {
      setIsFullscreenPreview(false);
      setFullscreenProject(null);
    };

    window.addEventListener('project:fullscreen:open', openFullscreen);
    window.addEventListener('project:fullscreen:close', closeFullscreen);

    return () => {
      window.removeEventListener('project:fullscreen:open', openFullscreen);
      window.removeEventListener('project:fullscreen:close', closeFullscreen);
    };
  }, []);

  // Close fullscreen preview on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isFullscreenPreview) {
        window.dispatchEvent(new Event('project:fullscreen:close'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreenPreview]);

  return { isFullscreenPreview, fullscreenProject };
}
