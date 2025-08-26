// About Component
// ==============

// About section with animated content and customizer integration
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

export default function About() {
  // Get customizer values from WordPress
  const aboutTitle = typeof window !== 'undefined' ? window.__ABOUT_TITLE__ || 'About Me' : 'About Me';
  const aboutSubtitle = typeof window !== 'undefined' ? window.__ABOUT_SUBTITLE__ || 'My story & experience' : 'My story & experience';

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
              <motion.div
                className="about__header section-header"
                initial={ANIMATION.FADE_IN.hidden}
                whileInView={ANIMATION.FADE_IN.show}
                viewport={{ once: true }}
                transition={{ duration: ANIMATION.TIMING.BASE, delay: ANIMATION.TIMING.DELAY_MEDIUM }}
              >
                <motion.h2
                  className="about__title section-title"
                  initial={ANIMATION.TITLE.hidden}
                  whileInView={ANIMATION.TITLE.show}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: ANIMATION.TIMING.BASE }}
                >
                  {aboutTitle}
                </motion.h2>
                <motion.p
                  className="about__subtitle section-subtitle"
                  initial={ANIMATION.TITLE.hidden}
                  whileInView={ANIMATION.TITLE.show}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: ANIMATION.TIMING.BASE, delay: ANIMATION.TIMING.DELAY_SMALL }}
                  dangerouslySetInnerHTML={{ __html: aboutSubtitle }}
                />
              </motion.div>

              <motion.div
                className="about__body section-body about__body--grid"
                initial={ANIMATION.SLIDE_UP.hidden}
                whileInView={ANIMATION.SLIDE_UP.show}
                viewport={{ once: true }}
                transition={{ duration: ANIMATION.TIMING.BASE, delay: ANIMATION.TIMING.DELAY_LARGE }}
              >
                <div className="about__text">
                  <div className="about__content-text">
                    <p>
                      Hallo! Ich bin Daniel Moehser, ein leidenschaftlicher Web Developer mit Fokus auf moderne Web-Technologien und benutzerfreundliche Lösungen. Mit über 5 Jahren Erfahrung in der Web-Entwicklung habe ich mich auf die Erstellung von performanten, skalierbaren und benutzerfreundlichen Webanwendungen spezialisiert.
                    </p>
                    <p>
                      Mein Ansatz kombiniert solide technische Grundlagen mit einem Auge für Design und Benutzererfahrung. Ich glaube an sauberen, wartbaren Code und moderne Entwicklungspraktiken. Jedes Projekt beginnt mit einer gründlichen Analyse der Anforderungen, gefolgt von einem durchdachten technischen Konzept.
                    </p>
                    <p>
                      <strong>Warum mit mir arbeiten?</strong>
                    </p>
                    <ul>
                      <li>☑ Moderne Technologien (React, Node.js, WordPress)</li>
                      <li>☑ Fokus auf Performance und SEO</li>
                      <li>☑ Responsive Design für alle Geräte</li>
                      <li>☑ Klare Kommunikation und transparente Prozesse</li>
                      <li>☑ Langfristige Wartung und Support</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        }
      </div>
    </section>
  );
}


