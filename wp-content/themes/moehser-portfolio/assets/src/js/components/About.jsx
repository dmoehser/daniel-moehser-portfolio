// About Component
// ==============
// About section with animated content and customizer integration

import React from 'react';
import { motion } from 'framer-motion';
import { getMailtoUrl } from '../utils/emailHelper.js';

// Configuration constants
// ----------------------
const MAILTO_PREFIX = 'mailto:';
const URL_SEPARATORS = {
  QUERY: '?',
  PARAM: '&'
};
const SUBJECT_PARAM = 'subject=';
const VIEWPORT_AMOUNT = 0.3;

// Animation constants for consistent motion
// ----------------------------------------
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
    DELAY_LARGE: 0.2,
    CTA_EXTRA_DELAY: 0.1
  }
};

// Helper functions
// ---------------
function getCustomizerValue(key, defaultValue = '') {
  return typeof window !== 'undefined' ? (window[key] || defaultValue) : defaultValue;
}

function getCtaUrl(url, subject) {
  if (!url) return '';
  
  // If it's a mailto URL, add subject if available
  if (url.startsWith(MAILTO_PREFIX) && subject) {
    const separator = url.includes(URL_SEPARATORS.QUERY) ? URL_SEPARATORS.PARAM : URL_SEPARATORS.QUERY;
    return `${url}${separator}${SUBJECT_PARAM}${encodeURIComponent(subject)}`;
  }
  
  // For all other URLs, use the original URL
  return url;
}

export default function About() {
  // Get customizer values from WordPress
  const aboutTitle = getCustomizerValue('__ABOUT_TITLE__');
  const aboutSubtitle = getCustomizerValue('__ABOUT_SUBTITLE__');
  const aboutHTML = getCustomizerValue('__ABOUT_HTML__');
  const aboutCtaEnabled = getCustomizerValue('__ABOUT_CTA_ENABLED__', false);
  const aboutCtaText = getCustomizerValue('__ABOUT_CTA_TEXT__');
  const aboutCtaUrl = getCustomizerValue('__ABOUT_CTA_URL__');
  const aboutCtaSubject = getCustomizerValue('__ABOUT_CTA_SUBJECT__');

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
                    <motion.h1
                      className="about__title section-title"
                      initial={ANIMATION.TITLE.hidden}
                      whileInView={ANIMATION.TITLE.show}
                      viewport={{ once: true, amount: VIEWPORT_AMOUNT }}
                      transition={{ duration: ANIMATION.TIMING.BASE }}
                    >
                      {aboutTitle}
                      </motion.h1>
                  )}
                  {aboutSubtitle && (
                    <motion.p
                      className="about__subtitle section-subtitle"
                      initial={ANIMATION.TITLE.hidden}
                      whileInView={ANIMATION.TITLE.show}
                      viewport={{ once: true, amount: VIEWPORT_AMOUNT }}
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
                    transition={{ duration: ANIMATION.TIMING.BASE, delay: ANIMATION.TIMING.DELAY_LARGE + ANIMATION.TIMING.CTA_EXTRA_DELAY }}
                  >
                    <a 
                      href={getCtaUrl(aboutCtaUrl, aboutCtaSubject)} 
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
