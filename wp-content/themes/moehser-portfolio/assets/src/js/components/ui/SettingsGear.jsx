// Settings Gear Component
// ======================

// Subtle settings gear with theme toggle and terminal access
// ----------------------------------------------------------

import React, { useState, useRef, useEffect } from 'react';
import gearIcon from '../../../img/settings-gear.svg';

export default function SettingsGear() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Check current theme
    const body = document.body;
    setIsDark(body.classList.contains('theme-dark'));
    
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

  useEffect(() => {
    // Close menu when clicking outside or pressing ESC
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const toggleTheme = () => {
    const body = document.body;
    body.classList.toggle('theme-dark');
    
    const isDarkTheme = body.classList.contains('theme-dark');
    setIsDark(isDarkTheme);
    
    // Save theme preference
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    setIsOpen(false); // Close menu after action
  };

  const openTerminal = () => {
    // Dispatch terminal open event
    try {
      const event = new CustomEvent('terminal:open');
      window.dispatchEvent(event);
    } catch (error) {
      console.log('Terminal not available');
    }
    setIsOpen(false); // Close menu after action
  };

  return (
    <div className="settings-gear">
      <button
        ref={buttonRef}
        className="settings-gear__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open settings"
        title="Settings"
      >
        <img src={gearIcon} alt="" aria-hidden="true" />
      </button>
      
      {isOpen && (
        <div ref={menuRef} className="settings-gear__menu">
          <button
            className="settings-gear__option"
            onClick={toggleTheme}
          >
            <span className="settings-gear__icon">
              {isDark ? '☀️' : '🌙'}
            </span>
            <span className="settings-gear__label">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          
          <button
            className="settings-gear__option"
            onClick={openTerminal}
          >
            <span className="settings-gear__icon">⌨️</span>
            <span className="settings-gear__label">Terminal</span>
          </button>
        </div>
      )}
    </div>
  );
}
