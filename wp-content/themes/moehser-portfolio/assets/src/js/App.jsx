// App Component
// =============
// Main App Component - Core application structure

import React, { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';

// Main components
import Hero from './components/Hero.jsx';
// Terminal Component - Lazy loaded for better performance
const Terminal = lazy(() => import('./components/Terminal.jsx'));
import About from './components/About.jsx';
import Projects from './components/Projects.jsx';
import Imprint from './components/Imprint.jsx';
import Skills from './components/Skills.jsx';

// UI components
import SocialDock from './components/ui/SocialDock.jsx';
import ScrollProgress from './components/ui/ScrollProgress.jsx';
import SettingsGear from './components/ui/SettingsGear.jsx';
import MobileMenu from './components/ui/MobileMenu.jsx';
import ResourcePreloader from './components/ui/ResourcePreloader.jsx';
import BackToProjectsButton from './components/ui/BackToProjectsButton.jsx';
import ArrowNavigation from './components/ui/ArrowNavigation.jsx';
// Fullscreen Preview - Lazy loaded for better performance
const FullscreenPreview = lazy(() => import('./components/ui/FullscreenPreview.jsx'));
import Footer from './components/ui/Footer.jsx';

// Feature managers
import TerminalManager from './features/terminal/TerminalManager.jsx';
import FullscreenPreviewManager from './features/fullscreen-preview/FullscreenPreviewManager.jsx';

// Utilities
import { SkipLink } from './features/accessibility/AccessibilityUtils.jsx';

// Configuration constants
// ----------------------
const TERMINAL_KEY = 't';
const TERMINAL_TOGGLE_EVENT = 'terminal:toggle';
const TERMINAL_CLOSE_EVENT = 'terminal:close';
const HASH_RETRY_LIMIT = 20;
const HASH_RETRY_DELAY_FAST = 200;
const HASH_RETRY_DELAY_SLOW = 100;
const HASH_RETRY_THRESHOLD = 5;
const SCROLL_SNAP_DISABLE_DELAY = 1000;
const REACT_RENDER_DELAY = 500;
const SAFARI_DETECTION_DELAYS = [100, 500];

// Helper functions
// ---------------
function isInputField(element) {
  return element && (
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.contentEditable === 'true'
  );
}

function disableScrollSnap() {
  const scrollContainer = document.querySelector('.page-scroll');
  if (!scrollContainer) return;
  
  // Disable scroll-snap completely
  scrollContainer.style.scrollSnapType = 'none';
  scrollContainer.style.webkitScrollSnapType = 'none';
  
  // Disable for all sections
  const sections = scrollContainer.querySelectorAll('section');
  sections.forEach(section => {
    section.style.scrollSnapAlign = 'none';
    section.style.scrollSnapStop = 'normal';
    section.style.webkitScrollSnapAlign = 'none';
    section.style.webkitScrollSnapStop = 'normal';
  });
}

function scrollToElementWithRetry(hash, retries = 0) {
  const element = document.getElementById(hash);
  if (element) {
    // Temporarily disable scroll-snap for programmatic scrolling
    const scrollContainer = document.querySelector('.page-scroll');
    if (scrollContainer) {
      const originalSnapType = scrollContainer.style.scrollSnapType;
      scrollContainer.style.scrollSnapType = 'none';
      
      element.scrollIntoView({ behavior: 'smooth' });
      
      // Re-enable scroll-snap after scrolling is complete
      setTimeout(() => {
        scrollContainer.style.scrollSnapType = originalSnapType || '';
      }, SCROLL_SNAP_DISABLE_DELAY);
    } else {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  } else if (retries < HASH_RETRY_LIMIT) {
    // Retry after a delay if element not found
    const delay = retries < HASH_RETRY_THRESHOLD ? HASH_RETRY_DELAY_FAST : HASH_RETRY_DELAY_SLOW;
    setTimeout(() => scrollToElementWithRetry(hash, retries + 1), delay);
  } else {
    console.warn(`Element with id "${hash}" not found after ${retries} retries`);
  }
}

function handleHashNavigation() {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    scrollToElementWithRetry(hash);
  } else {
    // If no hash or empty hash, scroll to top (hero section)
    const heroElement = document.getElementById('hero');
    if (heroElement) {
      heroElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

export default function App() {
  // Check if we're on the imprint page - check immediately, not in useEffect
  const isImprintPage = typeof window !== 'undefined' ? 
    (window.location.pathname.includes('/imprint') || 
     window.location.pathname.includes('/de/imprint') ||
     document.body.classList.contains('page-template-page-imprint')) : false;
  
  // Initialize all feature managers
  const { showTerminal } = TerminalManager();
  const { isFullscreenPreview, fullscreenProject } = FullscreenPreviewManager();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Terminal shortcut: T key (works on all pages)
      if (e.key.toLowerCase() === TERMINAL_KEY && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only trigger if not typing in an input field
        if (!isInputField(document.activeElement)) {
          e.preventDefault();
          window.dispatchEvent(new Event(TERMINAL_TOGGLE_EVENT));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close terminal on page navigation
  useEffect(() => {
    const closeTerminal = () => {
      window.dispatchEvent(new Event(TERMINAL_CLOSE_EVENT));
    };

    window.addEventListener('beforeunload', closeTerminal);
    window.addEventListener('popstate', closeTerminal);
    
    return () => {
      window.removeEventListener('beforeunload', closeTerminal);
      window.removeEventListener('popstate', closeTerminal);
    };
  }, []);

  // Detect Safari and disable scroll-snap completely
  useEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari) {
      // Try immediately and also after delays
      disableScrollSnap();
      SAFARI_DETECTION_DELAYS.forEach(delay => {
        setTimeout(disableScrollSnap, delay);
      });
    }
  }, []);

  // Handle hash navigation
  useEffect(() => {
    // Handle initial hash - wait for both DOM and React to be ready
    const handleInitialHash = () => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(handleHashNavigation, REACT_RENDER_DELAY);
        });
      } else {
        setTimeout(handleHashNavigation, REACT_RENDER_DELAY);
      }
    };
    
    handleInitialHash();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);

  // Render imprint page if on imprint route
  if (isImprintPage) {
    return (
      <>
        {/* Skip Links for Imprint Page */}
        <SkipLink href="#imprint-content">Skip to main content</SkipLink>
        <SkipLink href="#imprint-navigation">Skip to navigation</SkipLink>
        
        <Imprint />
        <SocialDock />
        <SettingsGear />
        <MobileMenu />
        
        {/* Terminal overlay with smooth animations */}
        <AnimatePresence>
          {showTerminal && <Terminal key="terminal-overlay" />}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      {/* Skip Links for Main Page */}
      <SkipLink href="#hero">Skip to hero section</SkipLink>
      <SkipLink href="#skills">Skip to skills section</SkipLink>
      <SkipLink href="#about">Skip to about section</SkipLink>
      <SkipLink href="#projects">Skip to projects section</SkipLink>
      
      {/* Background navigation service */}
      <ArrowNavigation 
        isFullscreenPreview={isFullscreenPreview} 
      />
      
      {/* Main content sections with scroll snap */}
      <div id="content-scroll" className="page-scroll">
        <Hero />
        <Skills />
        <About />
        <Projects />
      </div>

      {/* Terminal overlay with smooth animations */}
      <AnimatePresence>
        {showTerminal && (
          <Suspense fallback={null}>
            <Terminal key="terminal-overlay" />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Fullscreen project preview */}
      <AnimatePresence>
        {isFullscreenPreview && fullscreenProject && (
          <Suspense fallback={null}>
            <FullscreenPreview
              key="fullscreen-preview"
              isFullscreenPreview={isFullscreenPreview}
              fullscreenProject={fullscreenProject}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Global UI components */}
      <ResourcePreloader />
      <SocialDock />
      <ScrollProgress />
      <SettingsGear />
      <MobileMenu />
    </>
  );
}
