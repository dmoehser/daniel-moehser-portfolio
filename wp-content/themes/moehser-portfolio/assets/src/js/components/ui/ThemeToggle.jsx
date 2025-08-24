// Theme Toggle Component
// =====================

// Light/dark theme switcher with system preference detection
// ------------------------------

import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const body = document.body;
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      body.classList.add('theme-dark');
    }
    
    // Use system preference if no saved theme
    if (!savedTheme) {
      const prefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        body.classList.add('theme-dark');
      }
    }
    
    setIsDark(body.classList.contains('theme-dark'));
  }, []);

  const toggleTheme = () => {
    const body = document.body;
    body.classList.toggle('theme-dark');
    
    const isDarkTheme = body.classList.contains('theme-dark');
    setIsDark(isDarkTheme);
    
    // Save theme preference without try-catch (localStorage is reliable)
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  };

  return (
    <button
      className="theme-toggle__btn theme-toggle__btn--hero"
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light' : 'Switch to dark'}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? '☀' : '☾'}
    </button>
  );
}
