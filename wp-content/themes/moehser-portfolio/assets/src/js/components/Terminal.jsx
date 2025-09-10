// Terminal Component
// =================

// Interactive terminal emulation with xterm.js integration
// ------------------------------

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { makeCommands, COMMAND_ORDER, buildActions } from '../features/terminal/TerminalCommands.js';
import 'xterm/css/xterm.css';

// Terminal configuration constants
// ------------------------------
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
    RESET: '\u001b[0m'
  }
};

export default function Terminal() {
  const COMMANDS = makeCommands();
  const [cmd, setCmd] = useState('help');
  const [selIdx, setSelIdx] = useState(-1); // selection in output lines (actionable)
  const data = COMMANDS[cmd] || COMMANDS.help;

  useEffect(() => {
    const saved = localStorage.getItem('terminal_cmd');
    if (saved && COMMANDS[saved]) setCmd(saved);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('terminal_cmd', cmd); } catch {}
    // reset selection when command changes
    setSelIdx(-1);
  }, [cmd]);

  // Build actions map for current command
  const actions = buildActions(cmd);
  const actionableCount = Object.keys(actions).length;

  // Keyboard navigation: Left/Right switch commands; Up/Down move selection in output; Enter triggers action if available
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        const currentIndex = COMMAND_ORDER.indexOf(cmd);
        const nextIndex = (currentIndex + 1) % COMMAND_ORDER.length;
        setCmd(COMMAND_ORDER[nextIndex]);
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = COMMAND_ORDER.indexOf(cmd);
        const prevIndex = (currentIndex - 1 + COMMAND_ORDER.length) % COMMAND_ORDER.length;
        setCmd(COMMAND_ORDER[prevIndex]);
      } else if (e.key === 'ArrowDown') {
        if (actionableCount) {
          e.preventDefault();
          const maxIdx = Math.max(...Object.keys(actions).map(Number));
          setSelIdx((v) => {
            const next = v < 0 ? 0 : Math.min(v + 1, maxIdx);
            return next;
          });
        }
      } else if (e.key === 'ArrowUp') {
        if (actionableCount) {
          e.preventDefault();
          setSelIdx((v) => Math.max(v - 1, 0));
        }
      } else if (e.key === 'Enter') {
        if (selIdx >= 0 && actions[selIdx]) actions[selIdx]();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cmd, selIdx, actionableCount]);

  // Handle Esc key to close terminal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        window.dispatchEvent(new Event('terminal:close'));
      }
    };

    // Add listener with capture to ensure it works even when terminal is focused
    document.addEventListener('keydown', handleEsc, true);
    return () => document.removeEventListener('keydown', handleEsc, true);
  }, []);

  const xtermRef = useRef(null);
  const xtermContainerRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    // Init xterm on mount
    const isDark = typeof document !== 'undefined' && document.body.classList.contains('theme-dark');
    const term = new XTerm({
      fontFamily: TERMINAL_CONFIG.FONT.FAMILY,
      fontSize: TERMINAL_CONFIG.FONT.SIZE,
      cursorBlink: true,
      cursorStyle: 'block',
      lineHeight: TERMINAL_CONFIG.FONT.LINE_HEIGHT,
      theme: TERMINAL_CONFIG.THEME,
      allowProposedApi: true,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    xtermRef.current = term;
    fitAddonRef.current = fit;
    try { term.open(xtermContainerRef.current); } catch (e) { /* avoid hard crash */ }
    
    // ensure canvas fills and paints opaque
    try {
      const viewport = xtermContainerRef.current?.querySelector('.xterm-viewport');
      const screen = xtermContainerRef.current?.querySelector('.xterm-screen');
      if (viewport) viewport.style.backgroundColor = TERMINAL_CONFIG.THEME.BACKGROUND;
      if (screen) screen.style.backgroundColor = TERMINAL_CONFIG.THEME.BACKGROUND;
    } catch {}
    fit.fit();

    const prompt = `${TERMINAL_CONFIG.COLORS.GREEN}daniel${TERMINAL_CONFIG.COLORS.RESET}${TERMINAL_CONFIG.COLORS.GRAY} [ ${TERMINAL_CONFIG.COLORS.RESET}${TERMINAL_CONFIG.COLORS.BLUE}~${TERMINAL_CONFIG.COLORS.RESET}${TERMINAL_CONFIG.COLORS.GRAY} ]$ ${TERMINAL_CONFIG.COLORS.RESET}`;
    const writePrompt = () => { term.write(`\r\n${prompt}`); };
    let buffer = '';
    const history = [];
    let histIdx = -1;

    // Welcome
    term.writeln(`${TERMINAL_CONFIG.COLORS.GREEN}╭─────────────────────────────────────────╮${TERMINAL_CONFIG.COLORS.RESET}`);
    term.writeln(`${TERMINAL_CONFIG.COLORS.GREEN}│  Welcome to daniel@portfolio shell      │${TERMINAL_CONFIG.COLORS.RESET}`);
    term.writeln(`${TERMINAL_CONFIG.COLORS.GREEN}│  Interactive Portfolio Terminal         │${TERMINAL_CONFIG.COLORS.RESET}`);
    term.writeln(`${TERMINAL_CONFIG.COLORS.GREEN}╰─────────────────────────────────────────╯${TERMINAL_CONFIG.COLORS.RESET}`);
    term.writeln('');
    term.writeln(`${TERMINAL_CONFIG.COLORS.BLUE}🚀 Quick Start:${TERMINAL_CONFIG.COLORS.RESET}`);
    term.writeln(`${TERMINAL_CONFIG.COLORS.GRAY}  • Type 'help' to see all available commands${TERMINAL_CONFIG.COLORS.RESET}`);
    term.writeln(`${TERMINAL_CONFIG.COLORS.GRAY}  • Use 'T' key to toggle terminal anytime${TERMINAL_CONFIG.COLORS.RESET}`);
    term.writeln(`${TERMINAL_CONFIG.COLORS.GRAY}  • Press 'Esc' to close terminal${TERMINAL_CONFIG.COLORS.RESET}`);
    term.writeln(`${TERMINAL_CONFIG.COLORS.GRAY}  • Navigate with arrow keys, Enter to execute${TERMINAL_CONFIG.COLORS.RESET}`);
    term.writeln('');
    term.writeln(`${TERMINAL_CONFIG.COLORS.BLUE}💡 Pro Tip:${TERMINAL_CONFIG.COLORS.RESET} Try 'home', 'skills', 'about', or 'projects' to navigate!`);
    term.writeln('');
    term.write(prompt);

    const redrawLine = () => {
      term.write("\x1b[2K\r");
      term.write(prompt + buffer);
    };

    term.onData((data) => {
      switch (data) {
        case '\r': { // Enter
          const cmdline = buffer.trim().toLowerCase();
          term.write('\r\n');
          if (cmdline.length) {
            history.push(cmdline);
            histIdx = history.length;
          }
          if (cmdline === 'clear') {
            term.clear();
          } else if (COMMANDS[cmdline]) {
            term.writeln(COMMANDS[cmdline].title);
            COMMANDS[cmdline].lines.forEach((l)=> term.writeln(l));
            
            // Execute action if available
            const actions = buildActions(cmdline);
            if (actions[0]) {
              // Execute the first action after a short delay
              setTimeout(() => {
                actions[0]();
              }, 100);
            }
          } else if (cmdline.startsWith('projects ')) {
            // Handle projects subcommands
            const subcommand = cmdline;
            if (COMMANDS[subcommand]) {
              term.writeln(COMMANDS[subcommand].title);
              COMMANDS[subcommand].lines.forEach((l)=> term.writeln(l));
              
              // Execute action if available
              const actions = buildActions(subcommand);
              if (actions[0]) {
                // Execute the first action after a short delay
                setTimeout(() => {
                  actions[0]();
                }, 100);
              }
            } else {
              term.writeln('projects subcommand not found. Try "projects grid" or "projects list"');
            }
          } else if (cmdline.length) {
            term.writeln('command not found');
          }
          buffer = '';
          term.write(prompt);
          break;
        }
        case '\u0003': { // Ctrl+C
          term.write('^C');
          buffer = '';
          writePrompt();
          break;
        }
        case '\u000c': { // Ctrl+L
          term.clear();
          buffer = '';
          writePrompt();
          break;
        }
        case '\u007F': // Backspace (DEL)
        case '\u0008': { // Backspace
          if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
            term.write('\b \b');
          }
          break;
        }
        case '\t': { // Tab: autocomplete
          const sugg = COMMAND_ORDER.find((k) => k.startsWith(buffer.toLowerCase()));
          if (sugg && sugg !== buffer) {
            const rest = sugg.slice(buffer.length);
            buffer = sugg;
            term.write(rest);
          }
          break;
        }
        default: {
          // Arrow keys and others are escape sequences
          if (data === '\x1b[A') { // Up
            if (history.length) {
              histIdx = Math.max(0, histIdx - 1);
              buffer = history[histIdx] || '';
              redrawLine();
            }
            return;
          }
          if (data === '\x1b[B') { // Down
            if (history.length) {
              histIdx = Math.min(history.length, histIdx + 1);
              buffer = history[histIdx] || '';
              redrawLine();
            }
            return;
          }
          // Printable character
          if (data >= ' ' && data <= '~') {
            buffer += data;
            term.write(data);
          }
        }
      }
    });

    // Copy on select (like Azure default)
    term.onSelectionChange(() => {
      const sel = term.getSelection();
      if (sel && sel.length > 0) {
        try { navigator.clipboard.writeText(sel); } catch {}
      }
    });

    // Ctrl+L via key handler for some browsers
    term.attachCustomKeyEventHandler((ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'l') {
        ev.preventDefault();
        term.clear();
        writePrompt();
        return false;
      }
      return true;
    });

    const onResize = () => { try { fit.fit(); } catch {} };
    window.addEventListener('resize', onResize);
    setTimeout(() => { try { term.focus(); } catch {} }, 0);
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
            onClick={() => window.dispatchEvent(new Event('terminal:close'))} 
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