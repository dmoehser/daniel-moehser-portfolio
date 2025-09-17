// Accessibility Utils
// ==================

import React, { useEffect, useState } from 'react';

// Constants
// ---------
const SKIP_LINK_TRANSITION = '0.3s';

const MEDIA_QUERIES = {
  REDUCED_MOTION: '(prefers-reduced-motion: reduce)',
  HIGH_CONTRAST: '(prefers-contrast: high)',
  DARK_MODE: '(prefers-color-scheme: dark)'
};

// Skip Link Styles
// ----------------
const SKIP_LINK_STYLES = {
  position: 'absolute',
  top: '-40px',
  left: '6px',
  background: '#000',
  color: '#fff',
  padding: '8px',
  textDecoration: 'none',
  zIndex: 10000,
  transition: `top ${SKIP_LINK_TRANSITION}`
};

const SKIP_LINK_FOCUS_STYLES = {
  ...SKIP_LINK_STYLES,
  top: '6px'
};

// Screen Reader Only Styles
// -------------------------
export const SR_ONLY_STYLES = {
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

// ARIA Roles (commonly used)
// ---------------------------
export const ARIA_ROLES = {
  BUTTON: 'button',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  STATUS: 'status',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  PRESENTATION: 'presentation'
};

// ARIA Labels (commonly used)
// ----------------------------
export const ARIA_LABELS = {
  CLOSE: 'Close',
  OPEN: 'Open',
  LOADING: 'Loading'
};

// Keyboard Keys (commonly used)
// ------------------------------
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab'
};

// Utility Functions
// -----------------
export const createAriaLabel = (label, context = '') => {
  if (!label) return '';
  return context ? `${label}, ${context}` : label;
};

// Media Query Hook
// ----------------
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    return window.matchMedia ? window.matchMedia(query).matches : false;
  });

  useEffect(() => {
    if (!window.matchMedia) return;

    const matcher = window.matchMedia(query);
    setMatches(matcher.matches);

    const handleChange = (event) => setMatches(event.matches);
    matcher.addEventListener('change', handleChange);
    
    return () => matcher.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

// Accessibility Preferences
// --------------------------
export const prefersDarkMode = () => {
  return window.matchMedia ? window.matchMedia(MEDIA_QUERIES.DARK_MODE).matches : false;
};

// Skip Link Component
// -------------------
export const SkipLink = ({ 
  href, 
  children, 
  className = 'skip-link',
  style = {}
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const combinedStyles = {
    ...(isFocused ? SKIP_LINK_FOCUS_STYLES : SKIP_LINK_STYLES),
    ...style
  };

  return (
    <a
      href={href}
      className={className}
      style={combinedStyles}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </a>
  );
};

// Screen Reader Only utilities
export const srOnly = SR_ONLY_STYLES;

// Default Export
// --------------
export default {
  // Constants
  ARIA_ROLES,
  ARIA_LABELS,
  KEYBOARD_KEYS,
  SR_ONLY_STYLES,
  
  // Utility Functions
  createAriaLabel,
  
  // Media Query Functions
  useMediaQuery,
  prefersDarkMode,
  
  // Components
  SkipLink,
  
  // Legacy
  srOnly: SR_ONLY_STYLES
};
