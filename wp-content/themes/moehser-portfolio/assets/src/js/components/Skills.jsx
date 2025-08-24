// Skills Component
// ===============
// Skills section with animated skill cards
// ------------------------------

import React from 'react';
import { motion } from 'framer-motion';

// Animation constants
// ------------------
const ANIMATION = {
  hover: { scale: 1.02 },
  transition: { duration: 0.2 }
};

// Skill card data from Customizer
// --------------------------------
const getSkillCards = () => {
  if (typeof window !== 'undefined' && window.__SKILLS_CARD1__) {
    return [
      {
        id: 1,
        title: window.__SKILLS_CARD1__.title,
        description: window.__SKILLS_CARD1__.description,
        skills_list: window.__SKILLS_CARD1__.skills_list,
        tags: window.__SKILLS_CARD1__.tags ? window.__SKILLS_CARD1__.tags.split(',').map(tag => tag.trim()) : [],
        isSpecial: false
      },
      {
        id: 2,
        title: window.__SKILLS_CARD2__.title,
        description: window.__SKILLS_CARD2__.description,
        skills_list: window.__SKILLS_CARD2__.skills_list,
        tags: window.__SKILLS_CARD2__.tags ? window.__SKILLS_CARD2__.tags.split(',').map(tag => tag.trim()) : [],
        isSpecial: false
      },
      {
        id: 3,
        title: window.__SKILLS_CARD3__.title,
        description: window.__SKILLS_CARD3__.description,
        skills_list: window.__SKILLS_CARD3__.skills_list,
        tags: window.__SKILLS_CARD3__.tags ? window.__SKILLS_CARD3__.tags.split(',').map(tag => tag.trim()) : [],
        isSpecial: false
      },
      {
        id: 4,
        title: window.__SKILLS_CARD4__.title,
        description: window.__SKILLS_CARD4__.description,
        skills_list: window.__SKILLS_CARD4__.skills_list,
        tags: window.__SKILLS_CARD4__.tags ? window.__SKILLS_CARD4__.tags.split(',').map(tag => tag.trim()) : [],
        isSpecial: false
      },
      {
        id: 5,
        title: window.__SKILLS_CARD5__.title,
        description: window.__SKILLS_CARD5__.description,
        skills_list: window.__SKILLS_CARD5__.skills_list,
        tags: window.__SKILLS_CARD5__.tags ? window.__SKILLS_CARD5__.tags.split(',').map(tag => tag.trim()) : [],
        isSpecial: false
      }
    ];
  }
  
  return [];
};

// Reusable skill card component
// -----------------------------
const SkillCard = ({ card, isSpecial = false }) => (
  <motion.div
    className={`skill-card interactive enhanced skill-card--${isSpecial ? 'special' : 'standard'}`}
    whileHover={ANIMATION.hover}
    transition={ANIMATION.transition}
  >
    <h3 className="skill-card__title">{card.title}</h3>
    
    {/* Show description if available */}
    {card.description && (
      <p className="skill-card__description">{card.description}</p>
    )}
    
    {/* Show skills list if available */}
    {card.skills_list && (
      <ul className="skill-card__list">
        {card.skills_list.split(',').map((skill, index) => (
          <li key={index}>{skill.trim()}</li>
        ))}
      </ul>
    )}
    
    <div className="tags">
      {card.tags.map((tag, index) => (
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

  const title = typeof window !== 'undefined' && window.__SKILLS_TITLE__ ? window.__SKILLS_TITLE__ : '';
  const subtitle = typeof window !== 'undefined' && window.__SKILLS_SUBTITLE__ ? window.__SKILLS_SUBTITLE__ : '';

  return (
    <section className="skills" id="skills">
      <div className="skills__inner">
        <header className="skills__header">
          <h2 className="skills__title">{title}</h2>
          <p className="skills__subtitle">{subtitle}</p>
        </header>

        <div className="skills__content">
          <div className="skills__top-row">
            {topRowCards.map(card => (
              <SkillCard key={card.id} card={card} isSpecial={false} />
            ))}
          </div>

          <div className="skills__bottom-row">
            {bottomRowCards.map(card => (
              <SkillCard key={card.id} card={card} isSpecial={true} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


