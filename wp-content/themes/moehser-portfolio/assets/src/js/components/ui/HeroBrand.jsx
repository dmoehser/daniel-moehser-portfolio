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
  const [isPrint, setIsPrint] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect print mode: show full brand immediately for print
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

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Type brand logo once on mount; respect prefers-reduced-motion, print, and mobile
  useEffect(() => {
    if (isPrint) { setBrandTyped(BRAND.FULL); return; }
    
    // Skip typing animation on mobile devices
    if (isMobile) {
      setBrandTyped(BRAND.FULL);
      return;
    }
    
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
  }, [isPrint, isMobile]);

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
    
    // Update URL with language-specific path
    const isGerman = window.location.pathname.includes('/de/');
    const basePath = isGerman ? '/de' : '';
    const url = id === 'hero' ? `${basePath}/#` : `${basePath}/#${id}`;
    window.history.replaceState(null, '', url);
  };

  // Handle brand link click
  const handleBrandClick = (e) => {
    e.preventDefault();
    
    // Check if we're on the imprint page
    const isImprintPage = window.location.pathname.includes('/imprint/');
    const isGerman = window.location.pathname.includes('/de/');
    
    if (isImprintPage) {
      // Redirect to main page with language-specific path
      const basePath = isGerman ? '/de' : '';
      window.location.href = `${basePath}/#`;
    } else {
      // Normal scroll behavior on main page
      scrollTo('hero');
    }
  };

  // Check if typing animation is complete
  const isTypingComplete = isPrint || brandTyped.length >= BRAND.FULL.length;

  // Get language-specific href
  const isGerman = window.location.pathname.includes('/de/');
  const brandHref = isGerman ? '/de/#' : '/#';

  return (
    <div className="hero__brand">
      <a 
        href={brandHref}
        className="hero__brand-link" 
        aria-label="danielmoehser.dev home" 
        onClick={handleBrandClick}
      >
        {isTypingComplete ? (
          <>
            <span 
              className="brand-bracket" 
              style={{ color: '#94a3b8' }}
            >
              {BRAND.BRACKETS.OPEN}
            </span>
            <span 
              className="brand-base" 
              style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
            >
              {BRAND.BASE}
            </span>
            <span 
              className="brand-accent" 
              style={{ color: isDark ? '#38bdf8' : '#38bdf8' }}
            >
              {BRAND.ACCENT}
            </span>
            <span 
              className="brand-bracket" 
              style={{ color: '#94a3b8' }}
            >
              {BRAND.BRACKETS.CLOSE}
            </span>
          </>
        ) : (
          <>
            {brandTyped}
            <span 
              className="brand-caret" 
              style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
            >
              |
            </span>
          </>
        )}
      </a>
    </div>
  );
}
