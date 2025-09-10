// Imprint Component
// ================

// Imprint page with WordPress integration and back navigation
// ------------------------------

import React from 'react';
import { motion } from 'framer-motion';

// Animation constants for consistent motion
// ------------------------------
const ANIMATION = {
  FADE_IN: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  },
  SLIDE_UP: {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  },
  TITLE: {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 }
  },
  TIMING: {
    BASE: 0.6,
    DELAY_SMALL: 0.05,
    DELAY_MEDIUM: 0.1,
    DELAY_LARGE: 0.2
  }
};

export default function Imprint() {
  // Get page content from WordPress
  const imprintTitle = typeof window !== 'undefined' ? (window.__IMPRINT_TITLE__ || 'Impressum') : 'Impressum';
  const imprintHTML = typeof window !== 'undefined' ? (window.__IMPRINT_HTML__ || '') : '';

  // If no content is provided, show empty string
  const contentToShow = imprintHTML || '';

  // Back to home function
  const goBack = () => {
    window.location.href = '/';
  };

  return (
    <div className="imprint-page">
      {/* Header with logo and back button */}
      <header className="imprint-header">
        <div className="imprint-header__inner">
          <div className="imprint-header__logo">
            <a href="/" onClick={(e) => { e.preventDefault(); goBack(); }}>
              <span className="imprint-header__logo-text">Daniel Moehser</span>
            </a>
          </div>
          <button 
            className="imprint-header__back-btn"
            onClick={goBack}
            aria-label="Zurück zur Hauptseite"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Zurück
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="imprint-main">
        <section className="imprint section-base">
          <div className="imprint__inner section-inner imprint__inner--spaced">
            <motion.div
              className="imprint__content section-content imprint__content--centered"
              initial={ANIMATION.SLIDE_UP.hidden}
              animate={ANIMATION.SLIDE_UP.show}
              transition={{ duration: ANIMATION.TIMING.BASE }}
            >
              <div className="imprint__card section-card">
                <motion.div
                  className="imprint__header section-header"
                  initial={ANIMATION.FADE_IN.hidden}
                  animate={ANIMATION.FADE_IN.show}
                  transition={{ duration: ANIMATION.TIMING.BASE, delay: ANIMATION.TIMING.DELAY_MEDIUM }}
                >
                  <motion.h1
                    className="imprint__title section-title"
                    initial={ANIMATION.TITLE.hidden}
                    animate={ANIMATION.TITLE.show}
                    transition={{ duration: ANIMATION.TIMING.BASE }}
                  >
                    {imprintTitle}
                  </motion.h1>
                </motion.div>

                {contentToShow && (
                  <motion.div
                    className="imprint__body section-body"
                    initial={ANIMATION.SLIDE_UP.hidden}
                    animate={ANIMATION.SLIDE_UP.show}
                    transition={{ duration: ANIMATION.TIMING.BASE, delay: ANIMATION.TIMING.DELAY_LARGE }}
                  >
                    <div className="imprint__text">
                      <div 
                        className="imprint__content-text" 
                        dangerouslySetInnerHTML={{ __html: contentToShow }} 
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
