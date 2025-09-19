// Hero Component
// =============
// Hero section with subtle motion background and staggered text

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeroQuickMenu from './ui/HeroQuickMenu.jsx';
import HeroBrand from './ui/HeroBrand.jsx';
import { useLanguage } from '../hooks/useLanguage.js';

// Configuration constants
// ----------------------
const PROFILE_NAME = 'Daniel Moehser';
const CONTENT_SCROLL_ID = 'content-scroll';
const THEME_DARK_CLASS = 'theme-dark';
const PRINT_MEDIA_QUERY = 'print';
const SCROLL_OFFSET = 4;

// Animation timing constants
// -------------------------
const TIMING = {
  CURSOR_DELAY: 2000,      // Initial cursor display time
  H1_TYPING_SPEED: 90,     // H1 typing speed in ms
  H1_PAUSE: 350,           // Pause after H1 completion
  P_TYPING_SPEED: 18       // Paragraph typing speed in ms
};

// Animation constants
// ------------------
const ANIMATION = {
  BACKGROUND_DURATION: 0.8,
  BLOB_1_DURATION: 12,
  BLOB_2_DURATION: 14,
  BLOB_1_PATH: [0, 20, -20, 0],
  BLOB_1_Y_PATH: [0, -10, 10, 0],
  BLOB_2_PATH: [0, -16, 16, 0],
  BLOB_2_Y_PATH: [0, 12, -12, 0]
};

// Helper functions
// ---------------
function getCustomizerValue(key, defaultValue = '') {
  return typeof window !== 'undefined' ? (window[key] || defaultValue) : defaultValue;
}

function getTagStyles(isDark) {
  return {
    background: isDark ? 'rgba(30,41,59,.95)' : 'rgba(15,23,42,.1)',
    color: isDark ? '#e2e8f0' : '#64748b',
    borderColor: isDark ? 'rgba(56,189,248,.3)' : 'rgba(15,23,42,.2)'
  };
}

function getTextStyles(isDark, variant = 'primary') {
  const styles = {
    primary: { color: isDark ? '#e2e8f0' : '#0f172a' },
    secondary: { color: isDark ? '#cbd5e1' : '#0f172a' },
    mobile: { color: isDark ? '#94a3b8' : '#64748b' }
  };
  return styles[variant] || styles.primary;
}

function handleHeroArrowClick() {
  const container = document.getElementById(CONTENT_SCROLL_ID);
  if (!container) return;
  
  const sections = Array.from(container.querySelectorAll('section'));
  if (sections.length === 0) return;
  
  const orderedSections = sections
    .filter(section => section.style.display !== 'none')
    .sort((a, b) => {
      const orderA = parseInt(getComputedStyle(a).order) || 0;
      const orderB = parseInt(getComputedStyle(b).order) || 0;
      return orderA - orderB;
    });
  
  if (orderedSections.length === 0) return;

  const currentScrollTop = container.scrollTop;
  let currentIndex = 0;
  
  for (let i = 0; i < orderedSections.length; i += 1) {
    if (currentScrollTop >= orderedSections[i].offsetTop - SCROLL_OFFSET) {
      currentIndex = i;
    }
  }

  const targetIndex = Math.min(currentIndex + 1, orderedSections.length - 1);
  if (targetIndex === currentIndex) return;

  const targetTop = orderedSections[targetIndex].offsetTop;
  container.scrollTo({ top: targetTop, behavior: 'smooth' });
}

export default function Hero() {
  const [stage, setStage] = useState(0); // 0: cursor, 1: typing h1, 2: paragraph
  const [h1Text, setH1Text] = useState('');
  const [pText, setPText] = useState('');
  const [isPrint, setIsPrint] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Get customizer values from WordPress
  const heroTitle = getCustomizerValue('__HERO_TITLE__');
  const heroSubtitle = getCustomizerValue('__HERO_SUBTITLE__');
  
  // Extract name from subtitle for highlighting
  const name = PROFILE_NAME;
  const fullH1 = heroTitle;
  const fullP = heroSubtitle;

  // Extract complex text rendering logic
  const renderParagraphText = () => {
    const idx = pText.indexOf(name);
    if (idx >= 0) {
      return (
        <>
          {pText.slice(0, idx)}
          <span 
            className="hero__name"
          >
            {name}
          </span>
          {pText.slice(idx + name.length)}
        </>
      );
    }
    return pText;
  };

  // Detect print mode and set full content immediately
  useEffect(() => {
    const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(PRINT_MEDIA_QUERY) : null;
    const before = () => setIsPrint(true);
    const after = () => setIsPrint(false);
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeprint', before);
      window.addEventListener('afterprint', after);
      if (mq && typeof mq.addEventListener === 'function') mq.addEventListener('change', e => setIsPrint(e.matches));
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeprint', before);
        window.removeEventListener('afterprint', after);
        if (mq && typeof mq.removeEventListener === 'function') mq.removeEventListener('change', e => setIsPrint(e.matches));
      }
    };
  }, []);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.body.classList.contains(THEME_DARK_CLASS));
    };
    
    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024); // includes tablets
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isPrint) {
      setStage(2);
      setH1Text(fullH1);
      setPText(fullP);
      return; // skip timers
    }
    
    // Skip typing animation on mobile devices and tablets
    if (isMobile) {
      setStage(2);
      setH1Text(fullH1);
      setPText(fullP);
      return;
    }
    
    // Show blinking cursor near image for initial delay, then start typing
    const t = setTimeout(() => setStage(1), TIMING.CURSOR_DELAY);
    return () => clearTimeout(t);
  }, [isPrint, isMobile]);

  useEffect(() => {
    if (isPrint || isMobile) return; // skip typing in print and mobile
    if (stage === 1 && h1Text.length < fullH1.length) {
      const t = setTimeout(() => setH1Text(fullH1.slice(0, h1Text.length + 1)), TIMING.H1_TYPING_SPEED);
      return () => clearTimeout(t);
    } else if (stage === 1 && h1Text.length === fullH1.length) {
      const t = setTimeout(() => setStage(2), TIMING.H1_PAUSE);
      return () => clearTimeout(t);
    }
  }, [stage, h1Text, isPrint, isMobile]);

  useEffect(() => {
    if (isPrint || isMobile) return; // skip typing in print and mobile
    if (stage === 2 && pText.length < fullP.length) {
      const t = setTimeout(() => setPText(fullP.slice(0, pText.length + 1)), TIMING.P_TYPING_SPEED);
      return () => clearTimeout(t);
    }
  }, [stage, pText, isPrint, isMobile]);

  return (
    <>
      <HeroQuickMenu />
      <HeroBrand />

      <section className="hero" id="hero">
        <motion.div
          className="hero__bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: ANIMATION.BACKGROUND_DURATION }}
        >
          <motion.span
            className="blob blob--1"
            animate={{ x: ANIMATION.BLOB_1_PATH, y: ANIMATION.BLOB_1_Y_PATH }}
            transition={{ duration: ANIMATION.BLOB_1_DURATION, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="blob blob--2"
            animate={{ x: ANIMATION.BLOB_2_PATH, y: ANIMATION.BLOB_2_Y_PATH }}
            transition={{ duration: ANIMATION.BLOB_2_DURATION, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <div className="hero__inner hero__grid">
          <div className="hero__photo">
            <div className="hero__avatar">
              {typeof window !== 'undefined' && window.__PROFILE_AVATAR_URL__ ? (
                <img 
                  src={window.__PROFILE_AVATAR_URL__} 
                  alt={window.__PROFILE_AVATAR_ALT__ || 'Daniel Moehser - Profile Photo'} 
                />
              ) : null}
              {stage === 0 && <span className="hero__cursor" />}
            </div>
          </div>
          <div className="hero__copy">
            <div className="hero__code">
              <span 
                className="tag" 
                style={getTagStyles(isDark)}
              >
                &lt;h1&gt;
              </span>
              <span 
                className="type h1 hero__monospace" 
                style={getTextStyles(isDark, 'primary')}
              >
                {h1Text}
              </span>
              {stage < 2 && (
                <span 
                  className="caret" 
                  style={getTextStyles(isDark, 'primary')}
                >
                  |
                </span>
              )}
              <span 
                className="tag" 
                style={getTagStyles(isDark)}
              >
                &lt;/h1&gt;
              </span>
            </div>
            <div className="hero__code">
              <span 
                className="tag" 
                style={getTagStyles(isDark)}
              >
                &lt;p&gt;
              </span>
              <span 
                className="type p hero__monospace"
                style={getTextStyles(isDark, 'secondary')}
              >
                {renderParagraphText()}
              </span>
              {stage === 2 && pText.length < fullP.length && (
                <span 
                  className="caret" 
                  style={getTextStyles(isDark, 'primary')}
                >
                  |
                </span>
              )}
              <span 
                className="tag" 
                style={getTagStyles(isDark)}
              >
                &lt;/p&gt;
              </span>
            </div>
            
            <div className="hero__mobile-text">
              <h1 style={getTextStyles(isDark, 'primary')}>{fullH1}</h1>
              <p style={getTextStyles(isDark, 'mobile')}>
                {renderParagraphText()}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="hero-arrow" 
          onClick={handleHeroArrowClick}
        >
          <div className="hero-arrow__container">
            <svg 
              className="hero-arrow__icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M7 13l3 3 3-3" />
              <path d="M7 6l3 3 3-3" />
            </svg>
          </div>
        </div>
      </section>
    </>
  );
}
