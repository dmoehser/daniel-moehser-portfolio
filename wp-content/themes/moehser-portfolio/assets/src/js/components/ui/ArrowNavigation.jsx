// Arrow Navigation
// ===============

// Keyboard navigation between sections
// -----------------------------------

import { useEffect } from 'react';

const NAVIGATION = {
  SCROLL_LOCK_DURATION: 450,
  SECTION_OFFSET: 4
};

export default function ArrowNavigation({ projectOverlayUrl, isFullscreenPreview }) {
  useEffect(() => {
    let isArrowScrolling = false;
    let scrollLockTimer = null;
    
    const onArrowNav = (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      
      // Disable on mobile devices
      if (window.innerWidth <= 768) return;
      
      // Avoid navigation when overlays are active
      const hasActiveOverlay = typeof window !== 'undefined' && 
        (window.__terminalOpen || projectOverlayUrl || isFullscreenPreview);
      if (hasActiveOverlay) return;
      
      if (isArrowScrolling) return;
      
      const container = document.getElementById('content-scroll');
      if (!container) return;
      
      const sections = Array.from(container.querySelectorAll('section'));
      if (sections.length === 0) return;
      
      const orderedSections = sections
        .filter(section => section.style.display !== 'none')
        .sort((a, b) => {
          const orderA = parseInt(getComputedStyle(a).order) || 0;
          const orderB = parseInt(getComputedStyle(b).order) || 0;
          return orderA - orderB;
        });
      
      if (orderedSections.length === 0) return;

      const currentScrollTop = container.scrollTop;
      let currentIndex = 0;
      
      for (let i = 0; i < orderedSections.length; i += 1) {
        if (currentScrollTop >= orderedSections[i].offsetTop - NAVIGATION.SECTION_OFFSET) {
          currentIndex = i;
        }
      }

      const direction = e.key === 'ArrowDown' ? 1 : -1;
      let targetIndex = currentIndex + direction;
      
      targetIndex = Math.max(0, Math.min(targetIndex, orderedSections.length - 1));
      
      if (targetIndex === currentIndex) return;

      e.preventDefault();
      isArrowScrolling = true;
      
      const targetTop = orderedSections[targetIndex].offsetTop;
      container.scrollTo({ top: targetTop, behavior: 'smooth' });
      
      if (scrollLockTimer) clearTimeout(scrollLockTimer);
      scrollLockTimer = setTimeout(() => { 
        isArrowScrolling = false; 
      }, NAVIGATION.SCROLL_LOCK_DURATION);
    };

    const handleResize = () => {
      // Re-evaluate mobile state on resize
    };

    window.addEventListener('keydown', onArrowNav);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('keydown', onArrowNav);
      window.removeEventListener('resize', handleResize);
      if (scrollLockTimer) clearTimeout(scrollLockTimer);
    };
  }, [projectOverlayUrl, isFullscreenPreview]);

  return null;
}
