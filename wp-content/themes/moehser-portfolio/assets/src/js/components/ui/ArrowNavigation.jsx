// Arrow Navigation
// ===============

// Keyboard navigation between sections
// -----------------------------------

import { useEffect } from 'react';

// Constants
// =========

const NAVIGATION = {
  SCROLL_LOCK_DURATION: 450,
  SECTION_OFFSET: 4,
  MOBILE_BREAKPOINT: 768,
  CONTAINER_ID: 'content-scroll'
};

const KEYBOARD = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp'
};

const SCROLL_BEHAVIOR = {
  SMOOTH: 'smooth'
};

// Helper Functions
// ================

// Helper function to check if device is mobile
const isMobileDevice = () => {
  return window.innerWidth <= NAVIGATION.MOBILE_BREAKPOINT;
};

// Helper function to check if any overlay is active
const hasActiveOverlay = (isFullscreenPreview) => {
  return typeof window !== 'undefined' && 
    (window.__terminalOpen || isFullscreenPreview);
};

// Helper function to get scroll container
const getScrollContainer = () => {
  return document.getElementById(NAVIGATION.CONTAINER_ID);
};

// Helper function to get visible sections sorted by order
const getVisibleSections = (container) => {
  if (!container) return [];
  
  const sections = Array.from(container.querySelectorAll('section'));
  return sections
    .filter(section => section.style.display !== 'none')
    .sort((a, b) => {
      const orderA = parseInt(getComputedStyle(a).order) || 0;
      const orderB = parseInt(getComputedStyle(b).order) || 0;
      return orderA - orderB;
    });
};

// Helper function to find current section index
const findCurrentSectionIndex = (sections, scrollTop) => {
  let currentIndex = 0;
  
  for (let i = 0; i < sections.length; i += 1) {
    if (scrollTop >= sections[i].offsetTop - NAVIGATION.SECTION_OFFSET) {
      currentIndex = i;
    }
  }
  
  return currentIndex;
};

// Helper function to calculate target section index
const calculateTargetIndex = (currentIndex, direction, maxIndex) => {
  const targetIndex = currentIndex + direction;
  return Math.max(0, Math.min(targetIndex, maxIndex));
};

// Helper function to scroll to section
const scrollToSection = (container, targetTop) => {
  container.scrollTo({ 
    top: targetTop, 
    behavior: SCROLL_BEHAVIOR.SMOOTH 
  });
};

// Helper function to set scroll lock timer
const setScrollLockTimer = (callback, duration) => {
  return setTimeout(callback, duration);
};

export default function ArrowNavigation({ isFullscreenPreview }) {
  useEffect(() => {
    let isArrowScrolling = false;
    let scrollLockTimer = null;
    
    // Helper function to handle arrow navigation
    const handleArrowNavigation = (event) => {
      // Check if arrow key was pressed
      if (event.key !== KEYBOARD.ARROW_DOWN && event.key !== KEYBOARD.ARROW_UP) {
        return;
      }
      
      // Disable on mobile devices
      if (isMobileDevice()) {
        return;
      }
      
      // Avoid navigation when overlays are active
      if (hasActiveOverlay(isFullscreenPreview)) {
        return;
      }
      
      // Prevent multiple simultaneous scrolls
      if (isArrowScrolling) {
        return;
      }
      
      // Get scroll container
      const container = getScrollContainer();
      if (!container) {
        return;
      }
      
      // Get visible sections
      const sections = getVisibleSections(container);
      if (sections.length === 0) {
        return;
      }

      // Find current section index
      const currentScrollTop = container.scrollTop;
      const currentIndex = findCurrentSectionIndex(sections, currentScrollTop);

      // Calculate target section index
      const direction = event.key === KEYBOARD.ARROW_DOWN ? 1 : -1;
      const targetIndex = calculateTargetIndex(currentIndex, direction, sections.length - 1);
      
      // Don't scroll if already at target
      if (targetIndex === currentIndex) {
        return;
      }

      // Prevent default behavior and start scrolling
      event.preventDefault();
      isArrowScrolling = true;
      
      // Scroll to target section
      const targetTop = sections[targetIndex].offsetTop;
      scrollToSection(container, targetTop);
      
      // Set scroll lock timer
      if (scrollLockTimer) {
        clearTimeout(scrollLockTimer);
      }
      scrollLockTimer = setScrollLockTimer(() => { 
        isArrowScrolling = false; 
      }, NAVIGATION.SCROLL_LOCK_DURATION);
    };

    // Helper function to handle window resize
    const handleWindowResize = () => {
      // Re-evaluate mobile state on resize
      // This function is intentionally empty as mobile state is checked on each key press
    };

    // Helper function to cleanup event listeners and timers
    const cleanup = () => {
      window.removeEventListener('keydown', handleArrowNavigation);
      window.removeEventListener('resize', handleWindowResize);
      if (scrollLockTimer) {
        clearTimeout(scrollLockTimer);
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleArrowNavigation);
    window.addEventListener('resize', handleWindowResize);
    
    // Return cleanup function
    return cleanup;
  }, [isFullscreenPreview]);

  return null;
}
