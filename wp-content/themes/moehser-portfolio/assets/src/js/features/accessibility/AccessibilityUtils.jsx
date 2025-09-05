import React, { useEffect, useRef, useState } from 'react';

// ARIA Roles
export const ARIA_ROLES = {
  BUTTON: 'button',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  DIALOG: 'dialog',
  ALERT: 'alert',
  STATUS: 'status',
  LIVE: 'region',
  CAROUSEL: 'region',
  SLIDE: 'group',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  COMPLEMENTARY: 'complementary'
};

// ARIA Labels
export const ARIA_LABELS = {
  CLOSE: 'Close',
  OPEN: 'Open',
  PREVIOUS: 'Previous',
  NEXT: 'Next',
  PLAY: 'Play',
  PAUSE: 'Pause',
  LOADING: 'Loading',
  ERROR: 'Error',
  SUCCESS: 'Success',
  INFO: 'Information',
  WARNING: 'Warning'
};

// Keyboard Keys
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
};

// Utility Functions
export const createAriaLabel = (label, context = '') => {
  return context ? `${label}, ${context}` : label;
};

export const createCarouselAriaProps = (currentIndex, totalSlides, label = 'Carousel') => ({
  role: ARIA_ROLES.CAROUSEL,
  'aria-label': label,
  'aria-live': 'polite',
  'aria-atomic': 'true'
});

export const createSlideAriaProps = (index, currentIndex, totalSlides) => ({
  role: ARIA_ROLES.SLIDE,
  'aria-label': `Slide ${index + 1} of ${totalSlides}`,
  'aria-hidden': index !== currentIndex,
  'aria-selected': index === currentIndex
});

export const createNavigationAriaProps = (direction, disabled = false) => ({
  'aria-label': direction === 'prev' ? ARIA_LABELS.PREVIOUS : ARIA_LABELS.NEXT,
  'aria-disabled': disabled,
  'aria-controls': 'carousel-slides'
});

export const createButtonAriaProps = (label, pressed = false, expanded = false) => ({
  'aria-label': label,
  'aria-pressed': pressed ? 'true' : 'false',
  'aria-expanded': expanded ? 'true' : 'false'
});

export const createImageAriaProps = (alt, decorative = false) => ({
  'alt': decorative ? '' : alt,
  'role': decorative ? 'presentation' : 'img',
  'aria-hidden': decorative ? 'true' : 'false'
});

export const createLinkAriaProps = (href, label, external = false) => ({
  'aria-label': createAriaLabel(label, external ? 'External link' : ''),
  'aria-describedby': external ? 'external-link-description' : undefined,
  'target': external ? '_blank' : undefined,
  'rel': external ? 'noopener noreferrer' : undefined
});

export const createMenuAriaProps = (label, expanded = false) => ({
  role: ARIA_ROLES.MENU,
  'aria-label': label,
  'aria-expanded': expanded ? 'true' : 'false'
});

export const createMenuItemAriaProps = (label, context = '') => ({
  role: ARIA_ROLES.MENUITEM,
  'aria-label': createAriaLabel(label, context)
});

// Media Query Hooks
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Accessibility Preferences
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const shouldAnimate = () => {
  return !prefersReducedMotion();
};

export const prefersHighContrast = () => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

export const prefersDarkMode = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Focus Management Hook
export const useFocusManagement = () => {
  const focusableElements = useRef([]);
  const currentIndex = useRef(0);

  const getFocusableElements = (container) => {
    if (!container) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  };

  const trapFocus = (container) => {
    if (!container) return;

    focusableElements.current = getFocusableElements(container);
    currentIndex.current = 0;

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        
        if (e.shiftKey) {
          currentIndex.current = currentIndex.current > 0 
            ? currentIndex.current - 1 
            : focusableElements.current.length - 1;
        } else {
          currentIndex.current = currentIndex.current < focusableElements.current.length - 1 
            ? currentIndex.current + 1 
            : 0;
        }

        focusableElements.current[currentIndex.current]?.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  };

  const restoreFocus = (element) => {
    if (element) {
      element.focus();
    }
  };

  const setInitialFocus = (container) => {
    if (container) {
      const firstFocusable = getFocusableElements(container)[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  };

  return {
    trapFocus,
    restoreFocus,
    setInitialFocus,
    getFocusableElements
  };
};

// Keyboard Navigation Hook
export const useKeyboardNavigation = (onKeyDown) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      onKeyDown(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onKeyDown]);
};

// ARIA Live Region Hook
export const useAriaLiveRegion = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message, priority = 'polite') => {
    setAnnouncement('');
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  };

  const LiveRegion = () => (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {announcement}
    </div>
  );

  return { announce, LiveRegion };
};

// Announcement Component
export const Announcement = ({ message, priority = 'polite' }) => (
  <div
    aria-live={priority}
    aria-atomic="true"
    className="sr-only"
    role="status"
  >
    {message}
  </div>
);

// Skip Link Component
export const SkipLink = ({ href, children }) => (
  <a
    href={href}
    className="skip-link"
    style={{
      position: 'absolute',
      top: '-40px',
      left: '6px',
      background: '#000',
      color: '#fff',
      padding: '8px',
      textDecoration: 'none',
      zIndex: 10000,
      transition: 'top 0.3s'
    }}
    onFocus={(e) => {
      e.target.style.top = '6px';
    }}
    onBlur={(e) => {
      e.target.style.top = '-40px';
    }}
  >
    {children}
  </a>
);

// Screen Reader Only Class
export const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0'
};

export default {
  ARIA_ROLES,
  ARIA_LABELS,
  KEYBOARD_KEYS,
  createAriaLabel,
  createCarouselAriaProps,
  createSlideAriaProps,
  createNavigationAriaProps,
  createButtonAriaProps,
  createImageAriaProps,
  createLinkAriaProps,
  createMenuAriaProps,
  createMenuItemAriaProps,
  useMediaQuery,
  prefersReducedMotion,
  shouldAnimate,
  prefersHighContrast,
  prefersDarkMode,
  useFocusManagement,
  useKeyboardNavigation,
  useAriaLiveRegion,
  Announcement,
  SkipLink,
  srOnly
};
