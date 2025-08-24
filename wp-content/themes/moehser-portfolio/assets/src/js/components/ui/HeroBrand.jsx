// Hero Brand Component
// ===================

// Top-left brand logo with typing animation
// ------------------------------

import React, { useEffect, useState } from 'react';

// Animation and timing constants
// ------------------------------
const ANIMATION = {
  TYPING_SPEED: 55  // milliseconds per character
};

// Brand text constants
// ------------------------------
const BRAND = {
  FULL: '<danielmoehser.dev />',
  BASE: 'danielmoehser',
  ACCENT: '.dev',
  BRACKETS: {
    OPEN: '<',
    CLOSE: ' />'
  }
};

export default function HeroBrand() {
  const [brandTyped, setBrandTyped] = useState('');

  // Type brand logo once on mount; respect prefers-reduced-motion
  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setBrandTyped(BRAND.FULL);
      return;
    }
    
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setBrandTyped(BRAND.FULL.slice(0, i));
      if (i >= BRAND.FULL.length) clearInterval(timer);
    }, ANIMATION.TYPING_SPEED);
    
    return () => clearInterval(timer);
  }, []);

  // Scroll to hero section
  const scrollTo = (id) => {
    const container = document.getElementById('content-scroll');
    if (!container) return;
    
    const target = id === 'hero' 
      ? document.querySelector('section.hero') 
      : document.getElementById(id);
    
    if (!target) return;
    
    const targetTop = target.offsetTop;
    container.scrollTo({ 
      top: targetTop, 
      behavior: 'smooth' 
    });
    
    // Update URL without try-catch (not critical)
    const url = id === 'hero' ? '/#' : `/#${id}`;
    window.history.replaceState(null, '', url);
  };

  // Handle brand link click
  const handleBrandClick = (e) => {
    e.preventDefault();
    scrollTo('hero');
  };

  // Check if typing animation is complete
  const isTypingComplete = brandTyped.length >= BRAND.FULL.length;

  return (
    <div className="hero__brand">
      <a 
        href="/#" 
        className="hero__brand-link" 
        aria-label="danielmoehser.dev home" 
        onClick={handleBrandClick}
      >
        {isTypingComplete ? (
          <>
            <span className="brand-bracket">{BRAND.BRACKETS.OPEN}</span>
            <span className="brand-base">{BRAND.BASE}</span>
            <span className="brand-accent">{BRAND.ACCENT}</span>
            <span className="brand-bracket">{BRAND.BRACKETS.CLOSE}</span>
          </>
        ) : (
          <>
            {brandTyped}
            <span className="brand-caret">|</span>
          </>
        )}
      </a>
    </div>
  );
}
