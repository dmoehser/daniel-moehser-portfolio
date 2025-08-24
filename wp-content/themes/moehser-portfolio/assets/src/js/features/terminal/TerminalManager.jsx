// Terminal Manager Component
// =========================

// Manages terminal state and event listeners
// ------------------------------

import { useEffect, useState } from 'react';

export default function TerminalManager() {
  const [showTerminal, setShowTerminal] = useState(false);

  // Load initial terminal state from localStorage
  useEffect(() => {
    const isOpen = localStorage.getItem('terminal_open') === '1';
    setShowTerminal(isOpen);
  }, []);

  // Helper function to update terminal state
  const updateTerminalState = (isOpen) => {
    setShowTerminal(isOpen);
    localStorage.setItem('terminal_open', isOpen ? '1' : '0');
    
    if (typeof window !== 'undefined') {
      window.__terminalOpen = isOpen;
    }
  };

  // Listen for global terminal toggle/open/close events
  useEffect(() => {
    const open = () => updateTerminalState(true);
    const close = () => updateTerminalState(false);
    const toggle = () => updateTerminalState(!showTerminal);

    window.addEventListener('terminal:open', open);
    window.addEventListener('terminal:close', close);
    window.addEventListener('terminal:toggle', toggle);

    return () => {
      window.removeEventListener('terminal:open', open);
      window.removeEventListener('terminal:close', close);
      window.removeEventListener('terminal:toggle', toggle);
    };
  }, [showTerminal]);

  return { showTerminal };
}
