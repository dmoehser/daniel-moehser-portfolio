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
          <span className="hero__name">{name}</span>
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
      {/* Quick nav buttons (top-right) - OUTSIDE section to avoid Layout Builder interference */}
      <HeroQuickMenu />

      {/* Brand (top-left) - OUTSIDE section to avoid Layout Builder interference */}
      <HeroBrand />

      <section className="hero" id="hero">
        {/* Animated background blobs */}
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

        {/* Staggered intro text */}
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
              <span className="tag">&lt;h1&gt;</span>
              <span className="type h1 hero__monospace">{h1Text}</span>
              {stage < 2 && <span className="caret">|</span>}
              <span className="tag">&lt;/h1&gt;</span>
            </div>
            <div className="hero__code">
              <span className="tag">&lt;p&gt;</span>
              <span className="type p hero__monospace">
                {renderParagraphText()}
              </span>
              {stage === 2 && pText.length < fullP.length && <span className="caret">|</span>}
              <span className="tag">&lt;/p&gt;</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
