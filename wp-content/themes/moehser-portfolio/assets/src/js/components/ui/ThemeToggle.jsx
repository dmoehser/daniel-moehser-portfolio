// Theme Toggle Component
// =====================

import React, { useEffect, useState } from 'react';

// Constants
// ---------
const THEME_CONFIG = {
  DARK_CLASS: 'theme-dark',
  STORAGE_KEY: 'theme',
  VALUES: {
    DARK: 'dark',
    LIGHT: 'light'
  }
};

const CSS_CLASSES = {
  BUTTON: 'theme-toggle__btn theme-toggle__btn--hero'
};

const ICONS = {
  LIGHT_MODE: '☀', // Sun icon for switching to light mode (shown when dark)
  DARK_MODE: '☾'   // Moon icon for switching to dark mode (shown when light)
};

const ACCESSIBILITY_LABELS = {
  SWITCH_TO_LIGHT: 'Switch to light',
  SWITCH_TO_DARK: 'Switch to dark',
  SWITCH_TO_LIGHT_THEME: 'Switch to light theme',
  SWITCH_TO_DARK_THEME: 'Switch to dark theme'
};

const MEDIA_QUERIES = {
  PREFERS_DARK: '(prefers-color-scheme: dark)'
};

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Utility functions
  // -----------------
  const getSystemThemePreference = () => {
    return window.matchMedia && 
           window.matchMedia(MEDIA_QUERIES.PREFERS_DARK).matches;
  };

  const applyTheme = (isDarkTheme) => {
    const body = document.body;
    if (isDarkTheme) {
      body.classList.add(THEME_CONFIG.DARK_CLASS);
    } else {
      body.classList.remove(THEME_CONFIG.DARK_CLASS);
    }
    return body.classList.contains(THEME_CONFIG.DARK_CLASS);
  };

  const getSavedTheme = () => {
    return localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
  };

  const saveThemePreference = (isDarkTheme) => {
    const themeValue = isDarkTheme ? THEME_CONFIG.VALUES.DARK : THEME_CONFIG.VALUES.LIGHT;
    localStorage.setItem(THEME_CONFIG.STORAGE_KEY, themeValue);
  };

  const initializeTheme = () => {
    const savedTheme = getSavedTheme();
    
    if (savedTheme === THEME_CONFIG.VALUES.DARK) {
      return applyTheme(true);
    } else if (savedTheme === THEME_CONFIG.VALUES.LIGHT) {
      return applyTheme(false);
    } else {
      // Use system preference if no saved theme
      const prefersDark = getSystemThemePreference();
      return applyTheme(prefersDark);
    }
  };

  const getButtonTitle = () => {
    return isDark ? ACCESSIBILITY_LABELS.SWITCH_TO_LIGHT : ACCESSIBILITY_LABELS.SWITCH_TO_DARK;
  };

  const getButtonAriaLabel = () => {
    return isDark ? ACCESSIBILITY_LABELS.SWITCH_TO_LIGHT_THEME : ACCESSIBILITY_LABELS.SWITCH_TO_DARK_THEME;
  };

  const getButtonIcon = () => {
    return isDark ? ICONS.LIGHT_MODE : ICONS.DARK_MODE;
  };

  // Theme initialization effect
  // ---------------------------
  useEffect(() => {
    const isDarkTheme = initializeTheme();
    setIsDark(isDarkTheme);
  }, []);

  // Event handlers
  // --------------
  const handleToggleTheme = () => {
    const body = document.body;
    body.classList.toggle(THEME_CONFIG.DARK_CLASS);
    
    const isDarkTheme = body.classList.contains(THEME_CONFIG.DARK_CLASS);
    setIsDark(isDarkTheme);
    
    saveThemePreference(isDarkTheme);
  };

  return (
    <button
      className={CSS_CLASSES.BUTTON}
      type="button"
      onClick={handleToggleTheme}
      title={getButtonTitle()}
      aria-label={getButtonAriaLabel()}
    >
      {getButtonIcon()}
    </button>
  );
}
