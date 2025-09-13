// About Component
// ==============

// About section with animated content and customizer integration
// ------------------------------

import React from 'react';
import { motion } from 'framer-motion';
import { getMailtoUrl } from '../utils/emailHelper.js';

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

export default function About() {
  // Get customizer values from WordPress
  const aboutTitle = typeof window !== 'undefined' ? (window.__ABOUT_TITLE__ || '') : '';
  const aboutSubtitle = typeof window !== 'undefined' ? (window.__ABOUT_SUBTITLE__ || '') : '';
  const aboutHTML = typeof window !== 'undefined' ? (window.__ABOUT_HTML__ || '') : '';
  const aboutCtaEnabled = typeof window !== 'undefined' ? (window.__ABOUT_CTA_ENABLED__ || false) : false;
  const aboutCtaText = typeof window !== 'undefined' ? (window.__ABOUT_CTA_TEXT__ || '') : '';
  const aboutCtaUrl = typeof window !== 'undefined' ? (window.__ABOUT_CTA_URL__ || '') : '';
  const aboutCtaSubject = typeof window !== 'undefined' ? (window.__ABOUT_CTA_SUBJECT__ || '') : '';

  // Helper function to get the correct URL for CTA button
  const getCtaUrl = () => {
    if (!aboutCtaUrl) return '';
    
    // If it's a mailto URL, add subject if available
    if (aboutCtaUrl.startsWith('mailto:') && aboutCtaSubject) {
      const separator = aboutCtaUrl.includes('?') ? '&' : '?';
      return `${aboutCtaUrl}${separator}subject=${encodeURIComponent(aboutCtaSubject)}`;
    }
    
    // For all other URLs, use the original URL
    return aboutCtaUrl;
  };

  // If no About content is provided, do not render the section
  if (!aboutHTML || aboutHTML.trim() === '') {
    return null;
  }

  return (
    <section className="about section-base" id="about">
      <div className="about__inner section-inner about__inner--spaced">
        {
          <motion.div
            className="about__content section-content about__content--centered"
            initial={ANIMATION.SLIDE_UP.hidden}
            whileInView={ANIMATION.SLIDE_UP.show}
            viewport={{ once: true }}
            transition={{ duration: ANIMATION.TIMING.BASE }}
          >
            <div className="about__card section-card">
              {(aboutTitle || aboutSubtitle) && (
                <motion.div
                  className="about__header section-header"
                  initial={ANIMATION.FADE_IN.hidden}
                  whileInView={ANIMATION.FADE_IN.show}
                  viewport={{ once: true }}
                  transition={{ duration: ANIMATION.TIMING.BASE, delay: ANIMATION.TIMING.DELAY_MEDIUM }}
                >
                  {aboutTitle && (
                    <motion.h2
                      className="about__title section-title"
                      initial={ANIMATION.TITLE.hidden}
                      whileInView={ANIMATION.TITLE.show}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: ANIMATION.TIMING.BASE }}
                    >
                      {aboutTitle}
                    </motion.h2>
                  )}
                  {aboutSubtitle && (
                    <motion.p
                      className="about__subtitle section-subtitle"
                      initial={ANIMATION.TITLE.hidden}
                      whileInView={ANIMATION.TITLE.show}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: ANIMATION.TIMING.BASE, delay: ANIMATION.TIMING.DELAY_SMALL }}
                      dangerouslySetInnerHTML={{ __html: aboutSubtitle }}
                    />
                  )}
                </motion.div>
              )}

              <motion.div
                className="about__body section-body about__body--grid"
                initial={ANIMATION.SLIDE_UP.hidden}
                whileInView={ANIMATION.SLIDE_UP.show}
                viewport={{ once: true }}
                transition={{ duration: ANIMATION.TIMING.BASE, delay: ANIMATION.TIMING.DELAY_LARGE }}
              >
                <div className="about__text">
                  <div className="about__content-text" dangerouslySetInnerHTML={{ __html: aboutHTML }} />
                </div>
                
                {aboutCtaEnabled && aboutCtaText && aboutCtaUrl && (
                  <motion.div
                    className="about__cta"
                    initial={ANIMATION.FADE_IN.hidden}
                    whileInView={ANIMATION.FADE_IN.show}
                    viewport={{ once: true }}
                    transition={{ duration: ANIMATION.TIMING.BASE, delay: ANIMATION.TIMING.DELAY_LARGE + 0.1 }}
                  >
                    <a 
                      href={getCtaUrl()} 
                      className="about__cta-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {aboutCtaText}
                    </a>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        }
      </div>
    </section>
  );
}


