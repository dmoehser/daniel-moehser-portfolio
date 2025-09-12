// Hero Component
// =============

// Hero section with subtle motion background and staggered text
// ------------------------------

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeroQuickMenu from './ui/HeroQuickMenu.jsx';
import HeroBrand from './ui/HeroBrand.jsx';

// Animation timing constants
// ------------------------------
const TIMING = {
  CURSOR_DELAY: 2000,      // Initial cursor display time
  H1_TYPING_SPEED: 90,     // H1 typing speed in ms
  H1_PAUSE: 350,           // Pause after H1 completion
  P_TYPING_SPEED: 18       // Paragraph typing speed in ms
};

export default function Hero() {
  const [stage, setStage] = useState(0); // 0: cursor, 1: typing h1, 2: paragraph
  const [h1Text, setH1Text] = useState('');
  const [pText, setPText] = useState('');
  const [isPrint, setIsPrint] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const fullH1 = 'Hello!';
  const name = 'Daniel Moehser';
  const fullP = `I'm ${name} — full‑stack web developer crafting reliable and elegant web experiences.`;

  // Extract complex text rendering logic
  const renderParagraphText = () => {
    const idx = pText.indexOf(name);
    if (idx >= 0) {
      return (
        <>
          {pText.slice(0, idx)}
          <span 
            className="hero__name" 
            style={{ color: isDark ? '#38bdf8' : '#38bdf8' }}
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
    const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('print') : null;
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
      setIsDark(document.body.classList.contains('theme-dark'));
    };
    
    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isPrint) {
      setStage(2);
      setH1Text(fullH1);
      setPText(fullP);
      return; // skip timers
    }
    // Show blinking cursor near image for initial delay, then start typing
    const t = setTimeout(() => setStage(1), TIMING.CURSOR_DELAY);
    return () => clearTimeout(t);
  }, [isPrint]);

  useEffect(() => {
    if (isPrint) return; // skip typing in print
    if (stage === 1 && h1Text.length < fullH1.length) {
      const t = setTimeout(() => setH1Text(fullH1.slice(0, h1Text.length + 1)), TIMING.H1_TYPING_SPEED);
      return () => clearTimeout(t);
    } else if (stage === 1 && h1Text.length === fullH1.length) {
      const t = setTimeout(() => setStage(2), TIMING.H1_PAUSE);
      return () => clearTimeout(t);
    }
  }, [stage, h1Text, isPrint]);

  useEffect(() => {
    if (isPrint) return; // skip typing in print
    if (stage === 2 && pText.length < fullP.length) {
      const t = setTimeout(() => setPText(fullP.slice(0, pText.length + 1)), TIMING.P_TYPING_SPEED);
      return () => clearTimeout(t);
    }
  }, [stage, pText, isPrint]);

  return (
    <>
      <HeroQuickMenu />
      <HeroBrand />

      <section className="hero" id="hero">
        <motion.div
          className="hero__bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="blob blob--1"
            animate={{ x: [0, 20, -20, 0], y: [0, -10, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="blob blob--2"
            animate={{ x: [0, -16, 16, 0], y: [0, 12, -12, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <div className="hero__inner hero__grid">
          <div className="hero__photo">
            <div className="hero__avatar">
              {typeof window !== 'undefined' && window.__PROFILE_AVATAR_URL__ ? (
                <img src={window.__PROFILE_AVATAR_URL__} alt="Profile" />
              ) : null}
              {stage === 0 && <span className="hero__cursor" />}
            </div>
          </div>
          <div className="hero__copy">
            <div className="hero__code">
              <span 
                className="tag" 
                style={{ 
                  background: isDark ? 'rgba(30,41,59,.95)' : 'rgba(15,23,42,.1)',
                  color: isDark ? '#e2e8f0' : '#64748b',
                  borderColor: isDark ? 'rgba(56,189,248,.3)' : 'rgba(15,23,42,.2)'
                }}
              >
                &lt;h1&gt;
              </span>
              <span 
                className="type h1 hero__monospace" 
                style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
              >
                {h1Text}
              </span>
              {stage < 2 && (
                <span 
                  className="caret" 
                  style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
                >
                  |
                </span>
              )}
              <span 
                className="tag" 
                style={{ 
                  background: isDark ? 'rgba(30,41,59,.95)' : 'rgba(15,23,42,.1)',
                  color: isDark ? '#e2e8f0' : '#64748b',
                  borderColor: isDark ? 'rgba(56,189,248,.3)' : 'rgba(15,23,42,.2)'
                }}
              >
                &lt;/h1&gt;
              </span>
            </div>
            <div className="hero__code">
              <span 
                className="tag" 
                style={{ 
                  background: isDark ? 'rgba(30,41,59,.95)' : 'rgba(15,23,42,.1)',
                  color: isDark ? '#e2e8f0' : '#64748b',
                  borderColor: isDark ? 'rgba(56,189,248,.3)' : 'rgba(15,23,42,.2)'
                }}
              >
                &lt;p&gt;
              </span>
              <span 
                className="type p hero__monospace"
                style={{ color: isDark ? '#cbd5e1' : '#0f172a' }}
              >
                {renderParagraphText()}
              </span>
              {stage === 2 && pText.length < fullP.length && (
                <span 
                  className="caret" 
                  style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
                >
                  |
                </span>
              )}
              <span 
                className="tag" 
                style={{ 
                  background: isDark ? 'rgba(30,41,59,.95)' : 'rgba(15,23,42,.1)',
                  color: isDark ? '#e2e8f0' : '#64748b',
                  borderColor: isDark ? 'rgba(56,189,248,.3)' : 'rgba(15,23,42,.2)'
                }}
              >
                &lt;/p&gt;
              </span>
            </div>
            
            <div className="hero__mobile-text">
              <h1 style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>Hello!</h1>
              <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                I'm <span 
                  className="hero__name" 
                  style={{ color: isDark ? '#38bdf8' : '#38bdf8' }}
                >
                  Daniel Moehser
                </span> — full‑stack web developer crafting reliable and elegant web experiences.
              </p>
            </div>
          </div>
        </div>

        <div 
          className="hero-arrow" 
          onClick={() => {
            const container = document.getElementById('content-scroll');
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
              if (currentScrollTop >= orderedSections[i].offsetTop - 4) {
                currentIndex = i;
              }
            }

            const targetIndex = Math.min(currentIndex + 1, orderedSections.length - 1);
            if (targetIndex === currentIndex) return;

            const targetTop = orderedSections[targetIndex].offsetTop;
            container.scrollTo({ top: targetTop, behavior: 'smooth' });
          }}
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
