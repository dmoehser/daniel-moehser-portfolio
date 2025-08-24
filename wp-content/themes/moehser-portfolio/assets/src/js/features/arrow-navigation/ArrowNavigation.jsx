// Arrow Navigation Component
// =========================

// Keyboard navigation between sections with Layout Builder support
// ------------------------------

import { useEffect } from 'react';

// Navigation timing and offset constants
// ------------------------------
const NAVIGATION = {
  SCROLL_LOCK_DURATION: 450,  // milliseconds
  SECTION_OFFSET: 4           // pixels for current section detection
};

export default function ArrowNavigation({ projectOverlayUrl, isFullscreenPreview }) {
  useEffect(() => {
    let isArrowScrolling = false;
    let scrollLockTimer = null;
    
    const onArrowNav = (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      
      // Avoid navigation when overlays are active
      const hasActiveOverlay = typeof window !== 'undefined' && 
        (window.__terminalOpen || projectOverlayUrl || isFullscreenPreview);
      if (hasActiveOverlay) return;
      
      if (isArrowScrolling) return;
      
      const container = document.getElementById('content-scroll');
      if (!container) return;
      
      // Get sections in their current CSS order (respecting Layout Builder)
      const sections = Array.from(container.querySelectorAll('section'));
      if (sections.length === 0) return;
      
      // Sort sections by their computed CSS order value
      const orderedSections = sections
        .filter(section => section.style.display !== 'none') // Only visible sections
        .sort((a, b) => {
          const orderA = parseInt(getComputedStyle(a).order) || 0;
          const orderB = parseInt(getComputedStyle(b).order) || 0;
          return orderA - orderB;
        });
      
      if (orderedSections.length === 0) return;

      // Find current section index by scrollTop
      const currentScrollTop = container.scrollTop;
      let currentIndex = 0;
      
      for (let i = 0; i < orderedSections.length; i += 1) {
        if (currentScrollTop >= orderedSections[i].offsetTop - NAVIGATION.SECTION_OFFSET) {
          currentIndex = i;
        }
      }

      // Calculate target section index
      const direction = e.key === 'ArrowDown' ? 1 : -1;
      let targetIndex = currentIndex + direction;
      
      // Clamp target index to valid range
      targetIndex = Math.max(0, Math.min(targetIndex, orderedSections.length - 1));
      
      if (targetIndex === currentIndex) return;

      // Perform smooth scroll to target section
      e.preventDefault();
      isArrowScrolling = true;
      
      const targetTop = orderedSections[targetIndex].offsetTop;
      container.scrollTo({ top: targetTop, behavior: 'smooth' });
      
      // Reset scroll lock after delay
      if (scrollLockTimer) clearTimeout(scrollLockTimer);
      scrollLockTimer = setTimeout(() => { 
        isArrowScrolling = false; 
      }, NAVIGATION.SCROLL_LOCK_DURATION);
    };

    window.addEventListener('keydown', onArrowNav);
    return () => {
      window.removeEventListener('keydown', onArrowNav);
      if (scrollLockTimer) clearTimeout(scrollLockTimer);
    };
  }, [projectOverlayUrl, isFullscreenPreview]);

  return null;
}
