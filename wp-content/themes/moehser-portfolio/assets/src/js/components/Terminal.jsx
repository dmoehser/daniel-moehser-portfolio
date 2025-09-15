// Terminal Component
// =================

// Interactive terminal emulation with xterm.js integration
// ------------------------------

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { makeCommands, COMMAND_ORDER, buildActions } from '../features/terminal/TerminalCommands.js';
import { useLanguage } from '../hooks/useLanguage.js';
import 'xterm/css/xterm.css';

// Constants
// =========

// Terminal configuration
const TERMINAL_CONFIG = {
  FONT: {
    FAMILY: 'JetBrains Mono, monospace',
    SIZE: 13,
    LINE_HEIGHT: 1.15
  },
  THEME: {
    BACKGROUND: '#000000',
    FOREGROUND: '#e5e7eb',
    CURSOR: '#00ff7b'
  },
  ANIMATION: {
    STIFFNESS: 180,
    DAMPING: 24
  },
  COLORS: {
    GREEN: '\u001b[38;2;0;255;123m',
    GRAY: '\u001b[38;2;209;213;219m',
    BLUE: '\u001b[38;2;96;165;250m',
    YELLOW: '\u001b[38;2;251;191;36m',
    RESET: '\u001b[0m'
  }
};

// Terminal behavior constants
const TERMINAL_BEHAVIOR = {
  DEFAULT_COMMAND: 'help',
  STORAGE_KEY: 'terminal_cmd',
  ACTION_DELAY: 100,
  FOCUS_DELAY: 0,
  CLEAR_DELAY: 0
};

// Keyboard constants
const KEYBOARD = {
  ENTER: '\r',
  BACKSPACE: '\u007F',
  BACKSPACE_ALT: '\u0008',
  CTRL_C: '\u0003',
  CTRL_L: '\u000c',
  TAB: '\t',
  ESC_UP: '\x1b[A',
  ESC_DOWN: '\x1b[B',
  PRINTABLE_START: ' ',
  PRINTABLE_END: '~'
};

// Terminal commands
const COMMANDS = {
  CLEAR: 'clear',
  HELP: 'help'
};

// Helper Functions
// ================

// Helper function to get terminal prompt
const getTerminalPrompt = () => {
  const { GREEN, BLUE, YELLOW, RESET } = TERMINAL_CONFIG.COLORS;
  return `${GREEN}daniel${RESET}@${BLUE}portfolio${RESET}:${YELLOW}~${RESET}$ `;
};

// Helper function to write prompt to terminal
const writePrompt = (term) => {
  term.write(`\r\n${getTerminalPrompt()}`);
};

// Helper function to check if character is printable
const isPrintableChar = (char) => {
  return char >= KEYBOARD.PRINTABLE_START && char <= KEYBOARD.PRINTABLE_END;
};

// Helper function to handle terminal resize
const createResizeHandler = (fitAddon) => {
  return () => {
    try { 
      fitAddon.fit(); 
    } catch (error) {
      // Silent fail for resize errors
    }
  };
};

// Helper function to setup terminal styling
const setupTerminalStyling = (container) => {
  try {
    const viewport = container?.querySelector('.xterm-viewport');
    const screen = container?.querySelector('.xterm-screen');
    if (viewport) viewport.style.backgroundColor = TERMINAL_CONFIG.THEME.BACKGROUND;
    if (screen) screen.style.backgroundColor = TERMINAL_CONFIG.THEME.BACKGROUND;
  } catch (error) {
    // Silent fail for styling errors
  }
};

// Helper function to create terminal instance
const createTerminalInstance = () => {
  return new XTerm({
    fontFamily: TERMINAL_CONFIG.FONT.FAMILY,
    fontSize: TERMINAL_CONFIG.FONT.SIZE,
    cursorBlink: true,
    cursorStyle: 'block',
    lineHeight: TERMINAL_CONFIG.FONT.LINE_HEIGHT,
    theme: TERMINAL_CONFIG.THEME,
    allowProposedApi: true,
  });
};

export default function Terminal() {
  const { isGerman } = useLanguage();
  const terminalCommands = makeCommands();
  const [cmd, setCmd] = useState(TERMINAL_BEHAVIOR.DEFAULT_COMMAND);
  const [selIdx, setSelIdx] = useState(-1);
  const data = terminalCommands[cmd] || terminalCommands.help;

  // Refs
  const xtermRef = useRef(null);
  const xtermContainerRef = useRef(null);
  const fitAddonRef = useRef(null);

  // Load saved command from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(TERMINAL_BEHAVIOR.STORAGE_KEY);
    if (saved && terminalCommands[saved]) {
      setCmd(saved);
    }
  }, [terminalCommands]);

  // Save command to localStorage and reset selection
  useEffect(() => {
    try { 
      localStorage.setItem(TERMINAL_BEHAVIOR.STORAGE_KEY, cmd); 
    } catch (error) {
      // Silent fail for localStorage errors
    }
    setSelIdx(-1);
  }, [cmd]);

  // Build actions map for current command
  const actions = buildActions(cmd);
  const actionableCount = Object.keys(actions).length;

  // Helper function to navigate to next command
  const navigateToNextCommand = () => {
    const currentIndex = COMMAND_ORDER.indexOf(cmd);
    const nextIndex = (currentIndex + 1) % COMMAND_ORDER.length;
    setCmd(COMMAND_ORDER[nextIndex]);
  };

  // Helper function to navigate to previous command
  const navigateToPreviousCommand = () => {
    const currentIndex = COMMAND_ORDER.indexOf(cmd);
    const prevIndex = (currentIndex - 1 + COMMAND_ORDER.length) % COMMAND_ORDER.length;
    setCmd(COMMAND_ORDER[prevIndex]);
  };

  // Helper function to move selection down
  const moveSelectionDown = () => {
    if (actionableCount) {
      const maxIdx = Math.max(...Object.keys(actions).map(Number));
      setSelIdx((v) => {
        const next = v < 0 ? 0 : Math.min(v + 1, maxIdx);
        return next;
      });
    }
  };

  // Helper function to move selection up
  const moveSelectionUp = () => {
    if (actionableCount) {
      setSelIdx((v) => Math.max(v - 1, 0));
    }
  };

  // Helper function to execute selected action
  const executeSelectedAction = () => {
    if (selIdx >= 0 && actions[selIdx]) {
      actions[selIdx]();
    }
  };

  // Keyboard navigation handler
  const handleKeyboardNavigation = (e) => {
    switch (e.key) {
      case 'ArrowRight':
        navigateToNextCommand();
        break;
      case 'ArrowLeft':
        navigateToPreviousCommand();
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveSelectionDown();
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveSelectionUp();
        break;
      case 'Enter':
        executeSelectedAction();
        break;
      default:
        break;
    }
  };

  // Keyboard navigation: Left/Right switch commands; Up/Down move selection in output; Enter triggers action if available
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [cmd, selIdx, actionableCount]);

  // Helper function to close terminal
  const closeTerminal = () => {
    window.dispatchEvent(new Event('terminal:close'));
  };

  // Handle Esc key to close terminal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeTerminal();
      }
    };

    // Add listener with capture to ensure it works even when terminal is focused
    document.addEventListener('keydown', handleEsc, true);
    return () => document.removeEventListener('keydown', handleEsc, true);
  }, []);

  // Helper function to display welcome message
  const displayWelcomeMessage = (term, useGerman) => {
    const { GREEN, BLUE, GRAY, RESET } = TERMINAL_CONFIG.COLORS;
    
    if (useGerman) {
      term.writeln(`${GREEN}╭─────────────────────────────────────────╮${RESET}`);
      term.writeln(`${GREEN}│  Willkommen bei daniel@portfolio shell  │${RESET}`);
      term.writeln(`${GREEN}│  Interaktives Portfolio Terminal         │${RESET}`);
      term.writeln(`${GREEN}╰─────────────────────────────────────────╯${RESET}`);
      term.writeln('');
      term.writeln(`${BLUE}🚀 Schnellstart:${RESET}`);
      term.writeln(`${GRAY}  • Tippe 'hilfe' für alle verfügbaren Befehle${RESET}`);
      term.writeln(`${GRAY}  • 'T' Taste zum Ein-/Ausblenden des Terminals${RESET}`);
      term.writeln(`${GRAY}  • 'Esc' zum Schließen des Terminals${RESET}`);
      term.writeln(`${GRAY}  • Pfeiltasten zur Navigation, Enter zum Ausführen${RESET}`);
      term.writeln('');
      term.writeln(`${BLUE}💡 Pro-Tipp:${RESET} Probiere 'home', 'skills', 'about' oder 'projects'!`);
    } else {
      term.writeln(`${GREEN}╭─────────────────────────────────────────╮${RESET}`);
      term.writeln(`${GREEN}│  Welcome to daniel@portfolio shell      │${RESET}`);
      term.writeln(`${GREEN}│  Interactive Portfolio Terminal         │${RESET}`);
      term.writeln(`${GREEN}╰─────────────────────────────────────────╯${RESET}`);
      term.writeln('');
      term.writeln(`${BLUE}🚀 Quick Start:${RESET}`);
      term.writeln(`${GRAY}  • Type 'help' to see all available commands${RESET}`);
      term.writeln(`${GRAY}  • Use 'T' key to toggle terminal anytime${RESET}`);
      term.writeln(`${GRAY}  • Press 'Esc' to close terminal${RESET}`);
      term.writeln(`${GRAY}  • Navigate with arrow keys, Enter to execute${RESET}`);
      term.writeln('');
      term.writeln(`${BLUE}💡 Pro Tip:${RESET} Try 'home', 'skills', 'about', or 'projects' to navigate!`);
    }
  };

  // Helper function to initialize terminal
  const initializeTerminal = () => {
    const term = createTerminalInstance();
    const fit = new FitAddon();
    
    term.loadAddon(fit);
    xtermRef.current = term;
    fitAddonRef.current = fit;
    
    try { 
      term.open(xtermContainerRef.current); 
    } catch (error) {
      // Silent fail for terminal open errors
    }
    
    setupTerminalStyling(xtermContainerRef.current);
    fit.fit();
    
    return { term, fit };
  };

  useEffect(() => {
    const { term, fit } = initializeTerminal();
    const prompt = getTerminalPrompt();
    const writePromptToTerminal = () => writePrompt(term);
    let buffer = '';
    const history = [];
    let histIdx = -1;

    // Welcome - language specific (fallback to direct URL check)
    const isGermanDirect = window.location.pathname.includes('/de/');
    const useGerman = isGerman || isGermanDirect;
    
    displayWelcomeMessage(term, useGerman);
    term.writeln('');
    term.write(prompt);

    // Helper function to redraw current line
    const redrawLine = () => {
      term.write("\x1b[2K\r");
      term.write(prompt + buffer);
    };

    // Helper function to handle Enter key
    const handleEnterKey = () => {
      const cmdline = buffer.trim().toLowerCase();
      term.write('\r\n');
      
      if (cmdline.length) {
        history.push(cmdline);
        histIdx = history.length;
      }
      
      if (cmdline === COMMANDS.CLEAR) {
        term.clear();
      } else if (terminalCommands[cmdline]) {
        term.writeln(terminalCommands[cmdline].title);
        terminalCommands[cmdline].lines.forEach((line) => term.writeln(line));
        
        // Execute action if available
        const actions = buildActions(cmdline);
        if (actions[0]) {
          setTimeout(() => {
            actions[0]();
          }, TERMINAL_BEHAVIOR.ACTION_DELAY);
        }
      } else if (cmdline.length) {
        term.writeln('command not found');
      }
      
      buffer = '';
      term.write(prompt);
    };

    // Helper function to handle Ctrl+C
    const handleCtrlC = () => {
      term.write('^C');
      buffer = '';
      writePromptToTerminal();
    };

    // Helper function to handle Ctrl+L
    const handleCtrlL = () => {
      term.clear();
      buffer = '';
      writePromptToTerminal();
    };

    // Helper function to handle Backspace
    const handleBackspace = () => {
      if (buffer.length > 0) {
        buffer = buffer.slice(0, -1);
        term.write('\b \b');
      }
    };

    // Helper function to handle Tab autocomplete
    const handleTabAutocomplete = () => {
      const suggestion = COMMAND_ORDER.find((key) => key.startsWith(buffer.toLowerCase()));
      if (suggestion && suggestion !== buffer) {
        const rest = suggestion.slice(buffer.length);
        buffer = suggestion;
        term.write(rest);
      }
    };

    // Helper function to handle history navigation
    const handleHistoryUp = () => {
      if (history.length) {
        histIdx = Math.max(0, histIdx - 1);
        buffer = history[histIdx] || '';
        redrawLine();
      }
    };

    // Helper function to handle history navigation down
    const handleHistoryDown = () => {
      if (history.length) {
        histIdx = Math.min(history.length, histIdx + 1);
        buffer = history[histIdx] || '';
        redrawLine();
      }
    };

    // Helper function to handle printable characters
    const handlePrintableChar = (char) => {
      if (isPrintableChar(char)) {
        buffer += char;
        term.write(char);
      }
    };

    // Main terminal data handler
    const handleTerminalData = (data) => {
      switch (data) {
        case KEYBOARD.ENTER:
          handleEnterKey();
          break;
        case KEYBOARD.CTRL_C:
          handleCtrlC();
          break;
        case KEYBOARD.CTRL_L:
          handleCtrlL();
          break;
        case KEYBOARD.BACKSPACE:
        case KEYBOARD.BACKSPACE_ALT:
          handleBackspace();
          break;
        case KEYBOARD.TAB:
          handleTabAutocomplete();
          break;
        case KEYBOARD.ESC_UP:
          handleHistoryUp();
          return;
        case KEYBOARD.ESC_DOWN:
          handleHistoryDown();
          return;
        default:
          handlePrintableChar(data);
          break;
      }
    };

    term.onData(handleTerminalData);

    // Copy on select (like Azure default)
    term.onSelectionChange(() => {
      const selection = term.getSelection();
      if (selection && selection.length > 0) {
        try { 
          navigator.clipboard.writeText(selection); 
        } catch (error) {
          // Silent fail for clipboard errors
        }
      }
    });

    // Ctrl+L via key handler for some browsers
    term.attachCustomKeyEventHandler((event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        term.clear();
        writePromptToTerminal();
        return false;
      }
      return true;
    });

    const onResize = createResizeHandler(fit);
    window.addEventListener('resize', onResize);
    
    setTimeout(() => { 
      try { 
        term.focus(); 
      } catch (error) {
        // Silent fail for focus errors
      }
    }, TERMINAL_BEHAVIOR.FOCUS_DELAY);
    
    return () => {
      window.removeEventListener('resize', onResize);
      term.dispose();
    };
  }, []);

  return (
    <motion.div
      className={`terminal ${'terminal--dock'}`}
      id="terminal"
      role="region"
      aria-labelledby="terminal-title"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ 
        type: 'spring', 
        stiffness: TERMINAL_CONFIG.ANIMATION.STIFFNESS, 
        damping: TERMINAL_CONFIG.ANIMATION.DAMPING 
      }}
    >
      <div className="terminal__dockwrap">
        <div className="terminal__shellbar" role="toolbar" aria-label="Terminal bar">
          <div className="shellbar__title">daniel@portfolio:~</div>
          <div className="shellbar__spacer" />
          <button 
            className="shellbar__btn shellbar__btn--icon" 
            type="button" 
            onClick={closeTerminal} 
            aria-label="Close terminal" 
            title="Close"
          >
            <svg className="icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path 
                d="M3.5 3.5 L12.5 12.5 M12.5 3.5 L3.5 12.5" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
              />
            </svg>
          </button>
        </div>
        <div className="terminal__inner" role="dialog" aria-modal="true">
          <div className="terminal__body">
            <div className="terminal__xterm" ref={xtermContainerRef} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}