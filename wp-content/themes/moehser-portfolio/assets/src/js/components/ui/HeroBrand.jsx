// Hero Brand Component
// ===================

import React, { useEffect, useState } from 'react';

// Constants
// ---------
const ANIMATION_CONFIG = {
  TYPING_SPEED: 55  // milliseconds per character
};

const BRAND_TEXT = {
  FULL: '<danielmoehser.dev />',
  BASE: 'danielmoehser',
  ACCENT: '.dev',
  BRACKETS: {
    OPEN: '<',
    CLOSE: ' />'
  }
};

const CSS_CLASSES = {
  CONTAINER: 'hero__brand',
  LINK: 'hero__brand-link',
  BRACKET: 'brand-bracket',
  BASE: 'brand-base',
  ACCENT: 'brand-accent',
  CARET: 'brand-caret'
};

const ARIA_LABELS = {
  HOME_LINK: 'danielmoehser.dev home'
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
      setIsMobile(window.innerWidth <= 1024); // includes tablets
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Type brand logo once on mount; respect prefers-reduced-motion, print, and mobile
  useEffect(() => {
    if (isPrint) { setBrandTyped(BRAND_TEXT.FULL); return; }
    
    // Skip typing animation on mobile devices
    if (isMobile) {
      setBrandTyped(BRAND_TEXT.FULL);
      return;
    }
    
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setBrandTyped(BRAND_TEXT.FULL);
      return;
    }
    
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setBrandTyped(BRAND_TEXT.FULL.slice(0, i));
      if (i >= BRAND_TEXT.FULL.length) clearInterval(timer);
    }, ANIMATION_CONFIG.TYPING_SPEED);
    
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

  // Check if typing animation is complete
  const isTypingComplete = isPrint || brandTyped.length >= BRAND_TEXT.FULL.length;

  // Get language-specific href
  const isGerman = window.location.pathname.includes('/de/');
  const brandHref = isGerman ? '/de/#' : '/#';

  // Handle brand link click
  const handleBrandClick = (e) => {
    e.preventDefault();
    
    // Check if we're on the imprint page
    const isImprintPage = window.location.pathname.includes('/imprint/');
    
    if (isImprintPage) {
      // Redirect to main page with language-specific path
      const basePath = isGerman ? '/de' : '';
      window.location.href = `${basePath}/#`;
    } else {
      // Normal scroll behavior on main page
      scrollTo('hero');
    }
  };

  return (
    <div className={CSS_CLASSES.CONTAINER}>
      <a 
        href={brandHref}
        className={CSS_CLASSES.LINK} 
        aria-label={ARIA_LABELS.HOME_LINK}
        onClick={handleBrandClick}
      >
        {isTypingComplete ? (
          <>
            <span 
              className={CSS_CLASSES.BRACKET} 
              style={{ color: '#94a3b8' }}
            >
              {BRAND_TEXT.BRACKETS.OPEN}
            </span>
            <span 
              className={CSS_CLASSES.BASE} 
              style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
            >
              {BRAND_TEXT.BASE}
            </span>
            <span 
              className={CSS_CLASSES.ACCENT} 
              style={{ color: isDark ? '#38bdf8' : '#38bdf8' }}
            >
              {BRAND_TEXT.ACCENT}
            </span>
            <span 
              className={CSS_CLASSES.BRACKET} 
              style={{ color: '#94a3b8' }}
            >
              {BRAND_TEXT.BRACKETS.CLOSE}
            </span>
          </>
        ) : (
          <>
            {brandTyped}
            <span 
              className={CSS_CLASSES.CARET} 
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
