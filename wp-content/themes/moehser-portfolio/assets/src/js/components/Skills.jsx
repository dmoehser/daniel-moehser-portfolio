// Skills Component
// ===============
// Skills section with animated skill cards
// ------------------------------

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

// Animation constants
// ------------------
const ANIMATION = {
  hover: { scale: 1.02 },
  transition: { duration: 0.2 }
};

// Helper function to decode HTML entities
// -------------------------------------
const decodeHtmlEntities = (text) => {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Skill card data from Customizer
// --------------------------------
const getSkillCards = () => {
  if (typeof window !== 'undefined' && window.__SKILLS_CARD1__) {
    return [
      {
        id: 1,
        title: decodeHtmlEntities(window.__SKILLS_CARD1__.title),
        description: decodeHtmlEntities(window.__SKILLS_CARD1__.description),
        skills_list: decodeHtmlEntities(window.__SKILLS_CARD1__.skills_list),
        tags: window.__SKILLS_CARD1__.tags ? window.__SKILLS_CARD1__.tags.split(',').map(tag => decodeHtmlEntities(tag.trim())) : [],
        isSpecial: false
      },
      {
        id: 2,
        title: decodeHtmlEntities(window.__SKILLS_CARD2__.title),
        description: decodeHtmlEntities(window.__SKILLS_CARD2__.description),
        skills_list: decodeHtmlEntities(window.__SKILLS_CARD2__.skills_list),
        tags: window.__SKILLS_CARD2__.tags ? window.__SKILLS_CARD2__.tags.split(',').map(tag => decodeHtmlEntities(tag.trim())) : [],
        isSpecial: false
      },
      {
        id: 3,
        title: decodeHtmlEntities(window.__SKILLS_CARD3__.title),
        description: decodeHtmlEntities(window.__SKILLS_CARD3__.description),
        skills_list: decodeHtmlEntities(window.__SKILLS_CARD3__.skills_list),
        tags: window.__SKILLS_CARD3__.tags ? window.__SKILLS_CARD3__.tags.split(',').map(tag => decodeHtmlEntities(tag.trim())) : [],
        isSpecial: false
      },
      {
        id: 4,
        title: decodeHtmlEntities(window.__SKILLS_CARD4__.title),
        description: decodeHtmlEntities(window.__SKILLS_CARD4__.description),
        skills_list: decodeHtmlEntities(window.__SKILLS_CARD4__.skills_list),
        tags: window.__SKILLS_CARD4__.tags ? window.__SKILLS_CARD4__.tags.split(',').map(tag => decodeHtmlEntities(tag.trim())) : [],
        isSpecial: false
      },
      {
        id: 5,
        title: decodeHtmlEntities(window.__SKILLS_CARD5__.title),
        description: decodeHtmlEntities(window.__SKILLS_CARD5__.description),
        skills_list: decodeHtmlEntities(window.__SKILLS_CARD5__.skills_list),
        tags: window.__SKILLS_CARD5__.tags ? window.__SKILLS_CARD5__.tags.split(',').map(tag => decodeHtmlEntities(tag.trim())) : [],
        isSpecial: false
      }
    ];
  }
  
  return [];
};

// Reusable skill card component
// -----------------------------
const SkillCard = ({ card, isSpecial = false, isAdaptive = false }) => (
  <motion.div
    className={`skill-card interactive enhanced skill-card--${isSpecial ? 'special' : 'standard'}`}
    whileHover={ANIMATION.hover}
    transition={ANIMATION.transition}
  >
    <h3 className="skill-card__title">{card.title}</h3>
    
    {/* Top row (cards 1-3): Show skills list only - max 3 items */}
    {!isSpecial && card.skills_list && (
      <ul className="skill-card__list">
        {(isAdaptive
          ? card.skills_list.split(',')
          : card.skills_list.split(',').slice(0, 3)
        ).map((skill, index) => (
          <li key={index}>{skill.trim()}</li>
        ))}
      </ul>
    )}
    
    {/* Bottom row (cards 4-5): Show description only */}
    {isSpecial && card.description && (
      <p className="skill-card__description">{card.description}</p>
    )}
    
    <div className="tags">
      {(isAdaptive ? card.tags : card.tags.slice(0, 3)).map((tag, index) => (
        <span key={index} className="animated-border">{tag}</span>
      ))}
    </div>
  </motion.div>
);

// Main Skills component
// --------------------
export default function Skills() {
  const skillCards = getSkillCards();
  const topRowCards = skillCards.slice(0, 3);
  const bottomRowCards = skillCards.slice(3, 5);

  const title = typeof window !== 'undefined' && window.__SKILLS_TITLE__ ? decodeHtmlEntities(window.__SKILLS_TITLE__) : '';
  const subtitle = typeof window !== 'undefined' && window.__SKILLS_SUBTITLE__ ? decodeHtmlEntities(window.__SKILLS_SUBTITLE__) : '';
  // Determine layout mode from Customizer (defaults to fixed grid)
  const layoutMode = typeof window !== 'undefined' && window.__SKILLS_LAYOUT_MODE__ ? window.__SKILLS_LAYOUT_MODE__ : 'fixed_grid';
  const isAdaptiveLayout = layoutMode === 'adaptive_grid';
  const enabledMap = typeof window !== 'undefined' && window.__SKILLS_CARDS_ENABLED__ ? window.__SKILLS_CARDS_ENABLED__ : { c1: true, c2: true, c3: true, c4: true, c5: true };

  // Compute cards to render depending on mode
  const cardsForFixed = { top: topRowCards, bottom: bottomRowCards };
  const cardsForAdaptive = skillCards.filter((c) => {
    if (c.id === 1) return !!enabledMap.c1;
    if (c.id === 2) return !!enabledMap.c2;
    if (c.id === 3) return !!enabledMap.c3;
    if (c.id === 4) return !!enabledMap.c4;
    if (c.id === 5) return !!enabledMap.c5;
    return true;
  });

  // Sync with Layout Builder: hide/show skills section dynamically in adaptive mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const api = window.MoehserLayoutBuilder;
    if (!api) return;
    if (isAdaptiveLayout) {
      if (cardsForAdaptive.length === 0) {
        if (typeof api.hideSection === 'function') api.hideSection('skills');
      } else {
        if (typeof api.showSection === 'function') api.showSection('skills');
      }
    }
  }, [isAdaptiveLayout, cardsForAdaptive.length]);

  // In adaptive mode, if no cards are enabled, do not render the section at all
  if (isAdaptiveLayout && cardsForAdaptive.length === 0) {
    return null;
  }

  // Count for adaptive layout tweaks
  const activeCount = isAdaptiveLayout ? cardsForAdaptive.length : (cardsForFixed.top.length + cardsForFixed.bottom.length);

  return (
    <section className={`skills ${isAdaptiveLayout ? 'skills--adaptive' : 'skills--fixed'} ${isAdaptiveLayout ? `count-${activeCount}` : ''}`} id="skills">
      <div className="skills__inner">
        <header className="skills__header">
          <h2 className="skills__title">{title}</h2>
          <p className="skills__subtitle">{subtitle}</p>
        </header>

        <div className="skills__content">
          {isAdaptiveLayout ? (
            <div className="skills__top-row">
              {cardsForAdaptive.map(card => (
                <SkillCard key={card.id} card={card} isSpecial={card.id >= 4} isAdaptive={true} />
              ))}
            </div>
          ) : (
            <>
              <div className="skills__top-row">
                {cardsForFixed.top.map(card => (
                  <SkillCard key={card.id} card={card} isSpecial={false} isAdaptive={false} />
                ))}
              </div>
              <div className="skills__bottom-row">
                {cardsForFixed.bottom.map(card => (
                  <SkillCard key={card.id} card={card} isSpecial={true} isAdaptive={false} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}


