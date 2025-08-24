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
  // Check if Customizer values are available
  if (typeof window !== 'undefined' && window.__SKILLS_CARD1__) {
    return [
      {
        id: 1,
        title: window.__SKILLS_CARD1__.title || 'Frontend Development',
        description: window.__SKILLS_CARD1__.description || 'Building responsive and interactive user interfaces with modern web technologies.',
        tags: window.__SKILLS_CARD1__.tags ? window.__SKILLS_CARD1__.tags.split(',').map(tag => tag.trim()) : ['React', 'JavaScript', 'CSS', 'HTML'],
        isSpecial: false
      },
      {
        id: 2,
        title: window.__SKILLS_CARD2__.title || 'Backend Development',
        description: window.__SKILLS_CARD2__.description || 'Creating robust server-side applications and APIs.',
        tags: window.__SKILLS_CARD2__.tags ? window.__SKILLS_CARD2__.tags.split(',').map(tag => tag.trim()) : ['Node.js', 'PHP', 'MySQL', 'WordPress'],
        isSpecial: false
      },
      {
        id: 3,
        title: window.__SKILLS_CARD3__.title || 'Design & UX',
        description: window.__SKILLS_CARD3__.description || 'Creating intuitive and beautiful user experiences.',
        tags: window.__SKILLS_CARD3__.tags ? window.__SKILLS_CARD3__.tags.split(',').map(tag => tag.trim()) : ['Figma', 'Adobe XD', 'User Research'],
        isSpecial: false
      },
      {
        id: 4,
        title: window.__SKILLS_CARD4__.title || 'DevOps & Tools',
        description: window.__SKILLS_CARD4__.description || 'Streamlining development workflows and deployment processes.',
        tags: window.__SKILLS_CARD4__.tags ? window.__SKILLS_CARD4__.tags.split(',').map(tag => tag.trim()) : ['Git', 'Docker', 'CI/CD', 'AWS'],
        isSpecial: false
      },
      {
        id: 5,
        title: window.__SKILLS_CARD5__.title || 'Mobile Development',
        description: window.__SKILLS_CARD5__.description || 'Building native and cross-platform mobile applications.',
        tags: window.__SKILLS_CARD5__.tags ? window.__SKILLS_CARD5__.tags.split(',').map(tag => tag.trim()) : ['React Native', 'Flutter', 'iOS', 'Android'],
        isSpecial: false
      }
    ];
  }
  
  // Fallback to default values (should never happen in production)
  return [
    {
      id: 1,
      title: 'Frontend Development',
      description: 'Building responsive and interactive user interfaces with modern web technologies.',
      tags: ['React', 'JavaScript', 'CSS', 'HTML'],
      isSpecial: false
    },
    {
      id: 2,
      title: 'Backend Development',
      description: 'Creating robust server-side applications and APIs.',
      tags: ['Node.js', 'PHP', 'MySQL', 'WordPress'],
      isSpecial: false
    },
    {
      id: 3,
      title: 'Design & UX',
      description: 'Creating intuitive and beautiful user experiences.',
      tags: ['Figma', 'Adobe XD', 'User Research'],
      isSpecial: false
    },
    {
      id: 4,
      title: 'DevOps & Tools',
      description: 'Streamlining development workflows and deployment processes.',
      tags: ['Git', 'Docker', 'CI/CD', 'AWS'],
      isSpecial: false
    },
    {
      id: 5,
      title: 'Mobile Development',
      description: 'Building native and cross-platform mobile applications.',
      tags: ['React Native', 'Flutter', 'iOS', 'Android'],
      isSpecial: false
    }
  ];
};

// Reusable skill card component
// -----------------------------
const SkillCard = ({ card }) => (
  <motion.div
    className="skill-card interactive enhanced skill-card--standard"
    whileHover={ANIMATION.hover}
    transition={ANIMATION.transition}
  >
    <h3 className="skill-card__title">{card.title}</h3>
    <p className="skill-card__description">{card.description}</p>
    
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

  // Get Customizer values for title and subtitle
  const title = typeof window !== 'undefined' && window.__SKILLS_TITLE__ ? window.__SKILLS_TITLE__ : 'Skills';
  const subtitle = typeof window !== 'undefined' && window.__SKILLS_SUBTITLE__ ? window.__SKILLS_SUBTITLE__ : 'My technical & soft skills';

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
              <SkillCard key={card.id} card={card} />
            ))}
          </div>

          <div className="skills__bottom-row">
            {bottomRowCards.map(card => (
              <SkillCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


