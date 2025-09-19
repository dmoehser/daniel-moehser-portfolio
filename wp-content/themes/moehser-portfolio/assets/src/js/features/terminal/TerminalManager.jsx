// Terminal Manager Component
// =========================

import { useEffect, useState } from 'react';

// Constants
// ---------
const TERMINAL_CONFIG = {
  STORAGE_KEY: 'terminal_open',
  STORAGE_VALUES: {
    OPEN: '1',
    CLOSED: '0'
  },
  GLOBAL_VAR: '__terminalOpen'
};

const TERMINAL_EVENTS = {
  OPEN: 'terminal:open',
  CLOSE: 'terminal:close',
  TOGGLE: 'terminal:toggle'
};

const EVENT_OPTIONS = {
  passive: true
};

// Utility functions
// -----------------
const isServerSideRendering = () => {
  return typeof window === 'undefined';
};

const getStoredTerminalState = () => {
  if (isServerSideRendering()) return false;
  
  try {
    return localStorage.getItem(TERMINAL_CONFIG.STORAGE_KEY) === TERMINAL_CONFIG.STORAGE_VALUES.OPEN;
  } catch (error) {
    return false;
  }
};

const saveTerminalState = (isOpen) => {
  if (isServerSideRendering()) return;
  
  try {
    const value = isOpen ? TERMINAL_CONFIG.STORAGE_VALUES.OPEN : TERMINAL_CONFIG.STORAGE_VALUES.CLOSED;
    localStorage.setItem(TERMINAL_CONFIG.STORAGE_KEY, value);
  } catch (error) {
    // Silent fail for localStorage errors
  }
};

const updateGlobalTerminalState = (isOpen) => {
  if (isServerSideRendering()) return;
  
  window[TERMINAL_CONFIG.GLOBAL_VAR] = isOpen;
};

// Terminal Manager Hook
// ---------------------
export default function TerminalManager() {
  const [showTerminal, setShowTerminal] = useState(false);

  // Initialize terminal state from localStorage
  useEffect(() => {
    const storedState = getStoredTerminalState();
    setShowTerminal(storedState);
  }, []);

  // Update terminal state with persistence and global sync
  const updateTerminalState = (isOpen) => {
    setShowTerminal(isOpen);
    saveTerminalState(isOpen);
    updateGlobalTerminalState(isOpen);
  };

  // Event handlers
  const handleTerminalOpen = () => updateTerminalState(true);
  const handleTerminalClose = () => updateTerminalState(false);
  const handleTerminalToggle = () => updateTerminalState(!showTerminal);

  // Global terminal event listeners
  useEffect(() => {
    if (isServerSideRendering()) return;

    window.addEventListener(TERMINAL_EVENTS.OPEN, handleTerminalOpen, EVENT_OPTIONS);
    window.addEventListener(TERMINAL_EVENTS.CLOSE, handleTerminalClose, EVENT_OPTIONS);
    window.addEventListener(TERMINAL_EVENTS.TOGGLE, handleTerminalToggle, EVENT_OPTIONS);

    return () => {
      window.removeEventListener(TERMINAL_EVENTS.OPEN, handleTerminalOpen);
      window.removeEventListener(TERMINAL_EVENTS.CLOSE, handleTerminalClose);
      window.removeEventListener(TERMINAL_EVENTS.TOGGLE, handleTerminalToggle);
    };
  }, [showTerminal]);

  return { showTerminal };
}
