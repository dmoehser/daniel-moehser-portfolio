// App Component
// =============

// Main App Component - Core application structure
// ------------------------------

import Hero from './components/Hero.jsx';
import Terminal from './components/Terminal.jsx';
import About from './components/About.jsx';
import Projects from './components/Projects.jsx';
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
import { AnimatePresence } from 'framer-motion';
import React, { useEffect } from 'react';

export default function App() {
  // Initialize all feature managers
  const { showTerminal } = TerminalManager();
  const { isFullscreenPreview, fullscreenProject } = FullscreenPreviewManager();
  const { projectOverlayUrl } = ProjectOverlayManager();

  // Handle hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // If no hash or empty hash, scroll to top (hero section)
        const heroElement = document.getElementById('hero');
        if (heroElement) {
          heroElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    // Handle initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

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
