// App Component
// =============

// Main App Component - Core application structure
// ------------------------------

import Hero from './components/Hero.jsx';
import Terminal from './components/Terminal.jsx';
import About from './components/About.jsx';
import Projects from './components/Projects.jsx';
import Imprint from './components/Imprint.jsx';
import SocialDock from './components/ui/SocialDock.jsx';
import Skills from './components/Skills.jsx';
import ScrollProgress from './components/ui/ScrollProgress.jsx';
import SettingsGear from './components/ui/SettingsGear.jsx';
import MobileMenu from './components/ui/MobileMenu.jsx';
import ResourcePreloader from './components/ui/ResourcePreloader.jsx';
import BackToProjectsButton from './components/ui/BackToProjectsButton.jsx';
import ArrowNavigation from './components/ui/ArrowNavigation.jsx';
import TerminalManager from './features/terminal/TerminalManager.jsx';
import FullscreenPreviewManager from './features/fullscreen-preview/FullscreenPreviewManager.jsx';
import ProjectOverlayManager from './features/project-overlay/ProjectOverlayManager.jsx';
import ProjectOverlay from './components/ui/ProjectOverlay.jsx';
import FullscreenPreview from './components/ui/FullscreenPreview.jsx';
import Footer from './components/ui/Footer.jsx';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect } from 'react';

export default function App() {
  // Check if we're on the imprint page - check immediately, not in useEffect
  const isImprintPage = typeof window !== 'undefined' ? 
    (window.location.pathname.includes('/imprint') || 
     window.location.pathname.includes('/de/imprint') ||
     document.body.classList.contains('page-template-page-imprint')) : false;
  
  // Initialize all feature managers
  const { showTerminal } = TerminalManager();
  const { isFullscreenPreview, fullscreenProject } = FullscreenPreviewManager();
  const { projectOverlayUrl } = ProjectOverlayManager();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Terminal shortcut: T key (works on all pages)
      if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only trigger if not typing in an input field
        const activeElement = document.activeElement;
        const isInputField = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.contentEditable === 'true'
        );
        
        if (!isInputField) {
          e.preventDefault();
          window.dispatchEvent(new Event('terminal:toggle'));
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close terminal on page navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      window.dispatchEvent(new Event('terminal:close'));
    };

    const handlePopState = () => {
      window.dispatchEvent(new Event('terminal:close'));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Detect Safari and disable scroll-snap completely
  useEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari) {
      // Wait for DOM to be ready
      const disableScrollSnap = () => {
        const scrollContainer = document.querySelector('.page-scroll');
        if (scrollContainer) {
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
      };
      
      // Try immediately and also after a delay
      disableScrollSnap();
      setTimeout(disableScrollSnap, 100);
      setTimeout(disableScrollSnap, 500);
    }
  }, []);

  // Handle hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        // Wait for element to be available with retry mechanism
        const findElement = (retries = 0) => {
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
              }, 1000);
            } else {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          } else if (retries < 20) {
            // Retry after a delay if element not found - longer delay for initial load
            const delay = retries < 5 ? 200 : 100; // Longer delay for first few attempts
            setTimeout(() => findElement(retries + 1), delay);
          } else {
            console.warn(`Element with id "${hash}" not found after ${retries} retries`);
          }
        };
        findElement();
      } else {
        // If no hash or empty hash, scroll to top (hero section)
        const heroElement = document.getElementById('hero');
        if (heroElement) {
          heroElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    // Handle initial hash - wait for both DOM and React to be ready
    const handleInitialHash = () => {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          // Additional delay for React components to render
          setTimeout(handleHashChange, 500);
        });
      } else {
        // DOM is already ready, but wait for React components
        setTimeout(handleHashChange, 500);
      }
    };
    
    handleInitialHash();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Render imprint page if on imprint route
  if (isImprintPage) {
    return (
      <>
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
      {/* Background navigation service */}
      <ArrowNavigation 
        projectOverlayUrl={projectOverlayUrl} 
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
        {showTerminal && <Terminal key="terminal-overlay" />}
      </AnimatePresence>

      {/* Project demo overlay */}
      <AnimatePresence>
        {projectOverlayUrl && (
          <ProjectOverlay 
            key="project-overlay"
            projectOverlayUrl={projectOverlayUrl}
          />
        )}
      </AnimatePresence>
      
      {/* Fullscreen project preview */}
      <AnimatePresence>
        {isFullscreenPreview && fullscreenProject && (
          <FullscreenPreview
            key="fullscreen-preview"
            isFullscreenPreview={isFullscreenPreview}
            fullscreenProject={fullscreenProject}
          />
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
