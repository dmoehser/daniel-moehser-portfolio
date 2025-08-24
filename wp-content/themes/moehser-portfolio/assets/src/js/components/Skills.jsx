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

// Skill card data
// ---------------
const SKILL_CARDS = [
  {
    id: 1,
    title: 'Frontend',
    skills: [
      'React + Vite + TypeScript',
      'Animations with Framer Motion',
      'Accessibility & Core Web Vitals'
    ],
    tags: ['React', 'Vite', 'TypeScript', 'Framer Motion'],
    isSpecial: false
  },
  {
    id: 2,
    title: 'Backend',
    skills: [
      'Node.js / Express & PHP',
      'REST APIs, auth, caching',
      'Robust release pipelines'
    ],
    tags: ['Node.js', 'Express', 'PHP'],
    isSpecial: false
  },
  {
    id: 3,
    title: 'Database',
    skills: [
      'MySQL for WordPress & headless',
      'Clear schemas, migrations',
      'Automated backups'
    ],
    tags: ['MySQL', 'SQL'],
    isSpecial: false
  },
  {
    id: 4,
    title: 'Styling',
    description: 'Design tokens, SCSS architecture; Tailwind when it speeds things up without clutter.',
    tags: ['CSS', 'SCSS', 'Tailwind'],
    isSpecial: true
  },
  {
    id: 5,
    title: 'WordPress Templates',
    description: 'Headless or classic themes. Customizer fields, CPTs, REST endpoints — production-ready.',
    tags: ['Customizer', 'CPT', 'REST API', 'Theme Dev'],
    isSpecial: true
  }
];

// Reusable skill card component
// -----------------------------
const SkillCard = ({ card }) => (
  <motion.div
    className={`skill-card interactive enhanced skill-card--${card.isSpecial ? 'special' : 'standard'}`}
    whileHover={ANIMATION.hover}
    transition={ANIMATION.transition}
  >
    {card.isSpecial ? (
      <>
        <h3 className="skill-card__title">{card.title}</h3>
        <p className="skill-card__description">{card.description}</p>
      </>
    ) : (
      <>
        <h3 className="skill-card__title">{card.title}</h3>
        <ul className="skill-card__list">
          {card.skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </>
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
  const topRowCards = SKILL_CARDS.slice(0, 3); // Frontend, Backend, Database
  const bottomRowCards = SKILL_CARDS.slice(3, 5); // Styling, WordPress Templates

  return (
    <section className="skills" id="skills">
      <div className="skills__inner">
        <header className="skills__header">
          <h2 className="skills__title">Skills</h2>
          <p className="skills__subtitle">My technical & soft skills</p>
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


