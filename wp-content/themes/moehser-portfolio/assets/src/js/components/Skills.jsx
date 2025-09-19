// Skills Component
// ===============
// Skills section with animated skill cards
// ------------------------------

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Import icons
import codeIcon from '../../img/code.svg';
import mysqlIcon from '../../img/mysql.svg';
import settingsGearIcon from '../../img/settings-gear.svg';
import paletteIcon from '../../img/palette.svg';
import wordpressIcon from '../../img/wordpress.svg';

// Constants
// ---------
const ANIMATION = {
  hover: { scale: 1.02 },
  transition: { duration: 0.2 }
};

const SKILL_CARDS_LIMIT = 3;
const TOP_ROW_CARDS_COUNT = 3;
const BOTTOM_ROW_CARDS_COUNT = 2;
const DEFAULT_LAYOUT_MODE = 'fixed_grid';
const SCROLL_THRESHOLD = 1;

// Helper function to decode HTML entities
// -------------------------------------
const decodeHtmlEntities = (text) => {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Helper function to parse bold text syntax
// -----------------------------------------
const parseBoldText = (text) => {
  if (!text) return '';

  // Replace **text** with <strong>text</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

// Helper function to create skill card from window data
// ----------------------------------------------------
const createSkillCard = (cardData, id) => ({
  id,
  title: decodeHtmlEntities(cardData.title),
  description: decodeHtmlEntities(cardData.description),
  skills_list: decodeHtmlEntities(cardData.skills_list),
  tags: cardData.tags ? cardData.tags.split(',').map(tag => decodeHtmlEntities(tag.trim())) : [],
  isSpecial: false
});

// Skill card data from Customizer
// --------------------------------
const getSkillCards = () => {
  if (typeof window === 'undefined' || !window.__SKILLS_CARD1__) {
    return [];
  }

  const cardData = [
    window.__SKILLS_CARD1__,
    window.__SKILLS_CARD2__,
    window.__SKILLS_CARD3__,
    window.__SKILLS_CARD4__,
    window.__SKILLS_CARD5__
  ];

  return cardData
    .filter(card => card) // Remove undefined cards
    .map((card, index) => createSkillCard(card, index + 1));
};

// Icon mapping configuration
// ---------------------------
const ICON_MAPPING = [
  { keywords: ['frontend'], icon: codeIcon },
  { keywords: ['backend'], icon: mysqlIcon },
  { keywords: ['database'], icon: settingsGearIcon },
  { keywords: ['styling', 'css', 'design'], icon: paletteIcon },
  { keywords: ['wordpress'], icon: wordpressIcon }
];

// Helper function to get icon for card
// ------------------------------------
const getCardIcon = (cardTitle) => {
  const title = cardTitle.toLowerCase().trim();
  
  const mapping = ICON_MAPPING.find(({ keywords }) => 
    keywords.some(keyword => title.includes(keyword))
  );
  
  return mapping ? mapping.icon : codeIcon;
};

// Helper function to get limited items for display
// ------------------------------------------------
const getLimitedItems = (items, isAdaptive) => 
  isAdaptive ? items : items.slice(0, SKILL_CARDS_LIMIT);

// Reusable skill card component
// -----------------------------
const SkillCard = ({ card, isSpecial = false, isAdaptive = false }) => {
  const skillsList = card.skills_list ? card.skills_list.split(',') : [];
  const displaySkills = getLimitedItems(skillsList, isAdaptive);
  const displayTags = getLimitedItems(card.tags, isAdaptive);

  return (
    <motion.div
      className={`skill-card interactive enhanced skill-card--${isSpecial ? 'special' : 'standard'}`}
      whileHover={ANIMATION.hover}
      transition={ANIMATION.transition}
    >
      <h3 className="skill-card__title">
        <img src={getCardIcon(card.title)} alt="" className="ico" />
        {card.title}
      </h3>
      
      {/* Top row (cards 1-3): Show skills list only */}
      {!isSpecial && skillsList.length > 0 && (
        <ul className="skill-card__list">
          {displaySkills.map((skill, index) => (
            <li key={index}>{skill.trim()}</li>
          ))}
        </ul>
      )}
      
      {/* Bottom row (cards 4-5): Show description only */}
      {isSpecial && card.description && (
        <p
          className="skill-card__description"
          dangerouslySetInnerHTML={{ __html: parseBoldText(card.description) }}
        />
      )}
      
      <div className="tags">
        {displayTags.map((tag, index) => (
          <span key={index} className="animated-border">{tag}</span>
        ))}
      </div>
    </motion.div>
  );
};

// Helper function to get window data safely
// ----------------------------------------
const getWindowData = (key, defaultValue = '') => {
  if (typeof window === 'undefined') return defaultValue;
  return window[key] ? decodeHtmlEntities(window[key]) : defaultValue;
};

// Helper function to get enabled cards map
// ----------------------------------------
const getEnabledCardsMap = () => {
  if (typeof window === 'undefined') {
    return { c1: true, c2: true, c3: true, c4: true, c5: true };
  }
  return window.__SKILLS_CARDS_ENABLED__ || { c1: true, c2: true, c3: true, c4: true, c5: true };
};

// Main Skills component
// --------------------
export default function Skills() {
  const skillCards = getSkillCards();
  const topRowCards = skillCards.slice(0, TOP_ROW_CARDS_COUNT);
  const bottomRowCards = skillCards.slice(TOP_ROW_CARDS_COUNT, TOP_ROW_CARDS_COUNT + BOTTOM_ROW_CARDS_COUNT);

  const title = getWindowData('__SKILLS_TITLE__');
  const subtitle = getWindowData('__SKILLS_SUBTITLE__');
  const layoutMode = getWindowData('__SKILLS_LAYOUT_MODE__', DEFAULT_LAYOUT_MODE);
  const isAdaptiveLayout = layoutMode === 'adaptive_grid';
  const enabledMap = getEnabledCardsMap();
  
  const contentRef = useRef(null);
  const scrollbarRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Custom external scrollbar: sync values via CSS variables
  useEffect(() => {
    const el = contentRef.current;
    const bar = scrollbarRef.current;
    if (!el || !bar || !isAdaptiveLayout) return;
    
    const updateScrollbar = () => {
      const hasOverflow = el.scrollHeight > el.clientHeight + SCROLL_THRESHOLD;
      setHasOverflow(hasOverflow);
      
      if (!hasOverflow) {
        bar.classList.remove('show');
        bar.style.removeProperty('--sb-fill');
        bar.style.removeProperty('--sb-top');
        bar.style.removeProperty('--sb-thumb');
        return;
      }
      
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const scrolledNorm = scrollHeight > 0 ? (el.scrollTop / scrollHeight) : 0;
      const coloredPct = Math.min(100, Math.max(0, scrolledNorm * 100));
      
      bar.style.setProperty('--sb-thumb', `${coloredPct}%`);
      bar.style.setProperty('--sb-top', '0%');
      bar.style.setProperty('--sb-fill', '0%');
      bar.classList.add('show');
    };
    
    updateScrollbar();
    el.addEventListener('scroll', updateScrollbar, { passive: true });
    window.addEventListener('resize', updateScrollbar);
    const ro = new ResizeObserver(updateScrollbar);
    ro.observe(el);
    
    return () => {
      el.removeEventListener('scroll', updateScrollbar);
      window.removeEventListener('resize', updateScrollbar);
      ro.disconnect();
    };
  }, [isAdaptiveLayout]);

  // Helper function to check if card is enabled
  // -------------------------------------------
  const isCardEnabled = (cardId) => {
    const cardKey = `c${cardId}`;
    return !!enabledMap[cardKey];
  };

  // Compute cards to render depending on mode
  const cardsForFixed = { top: topRowCards, bottom: bottomRowCards };
  const cardsForAdaptive = skillCards.filter(card => isCardEnabled(card.id));

  // Sync with Layout Builder: hide/show skills section dynamically in adaptive mode
  useEffect(() => {
    if (typeof window === 'undefined' || !isAdaptiveLayout) return;
    
    const api = window.MoehserLayoutBuilder;
    if (!api) return;
    
    const hasCards = cardsForAdaptive.length > 0;
    const action = hasCards ? 'showSection' : 'hideSection';
    
    if (typeof api[action] === 'function') {
      api[action]('skills');
    }
  }, [isAdaptiveLayout, cardsForAdaptive.length]);

  // Early return if no cards in adaptive mode
  if (isAdaptiveLayout && cardsForAdaptive.length === 0) {
    return null;
  }

  // Helper function to get section classes
  const getSectionClasses = () => {
    const baseClasses = 'skills';
    const layoutClass = isAdaptiveLayout ? 'skills--adaptive' : 'skills--fixed';
    const countClass = isAdaptiveLayout ? `count-${cardsForAdaptive.length}` : '';
    return [baseClasses, layoutClass, countClass].filter(Boolean).join(' ');
  };

  // Helper function to render cards
  const renderCards = () => {
    if (isAdaptiveLayout) {
      return (
        <div className="skills__top-row">
          {cardsForAdaptive.map(card => (
            <SkillCard 
              key={card.id} 
              card={card} 
              isSpecial={card.id >= 4} 
              isAdaptive={true} 
            />
          ))}
        </div>
      );
    }

    return (
      <>
        <div className="skills__top-row">
          {cardsForFixed.top.map(card => (
            <SkillCard 
              key={card.id} 
              card={card} 
              isSpecial={false} 
              isAdaptive={false} 
            />
          ))}
        </div>
        <div className="skills__bottom-row">
          {cardsForFixed.bottom.map(card => (
            <SkillCard 
              key={card.id} 
              card={card} 
              isSpecial={true} 
              isAdaptive={false} 
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <section className={getSectionClasses()} id="skills">
      <div className="skills__inner">
        <header className="skills__header">
          <h2 className="skills__title">{title}</h2>
          <p className="skills__subtitle">{subtitle}</p>
        </header>

        <div className="skills__content">
          {isAdaptiveLayout && (
            <div className="skills__scrollbar" ref={scrollbarRef} aria-hidden="true">
              <div className="skills__scrollbar-fill" />
              <div className="skills__scrollbar-thumb" />
            </div>
          )}
          <div className={`skills__viewport ${isAdaptiveLayout ? 'is-adaptive' : ''}`} ref={contentRef}>
            {renderCards()}
          </div>
        </div>
      </div>
    </section>
  );
}
