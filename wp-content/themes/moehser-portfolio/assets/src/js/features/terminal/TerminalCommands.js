// Terminal Commands
// =================

import { getEmail, getEmailSubject, generateMailtoUrl } from '../../utils/emailHelper.js';

// Constants
// ---------
const TERMINAL_CONFIG = {
  TIMING: {
    NAVIGATION_DELAY: 500,      // milliseconds
    CLOSE_DELAY: 300,           // milliseconds
    IMPRINT_DELAY: 100,         // milliseconds
    LANGUAGE_SWITCH_DELAY: 100  // milliseconds
  },
  FALLBACK_VALUES: {
    SOCIAL_URL: '—',
    NO_SKILLS: ['No skills data available'],
    NO_DATA: ['Skills data not available']
  }
};

const GLOBAL_VARS = {
  SOCIAL_PREFIX: '__SOCIAL_',
  SOCIAL_SUFFIX: '__',
  SKILLS_CARD_PREFIX: '__SKILLS_CARD',
  SKILLS_CARD_SUFFIX: '__'
};

const HTML_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' '
};

const EVENTS = {
  TERMINAL_CLOSE: 'terminal:close',
  PROJECTS_LAYOUT: 'projects:layout'
};

const THEME_CLASSES = {
  DARK: 'theme-dark',
  LIGHT: 'theme-light'
};

const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE_PREFERENCE: 'user_language_preference'
};

const URL_PATTERNS = {
  GERMAN_PATH: '/de/',
  IMPRINT_PATH: '/imprint',
  ROOT_PATH: '/'
};

// Utility functions
// -----------------
const isServerSideRendering = () => {
  return typeof window === 'undefined';
};

const getSocialUrl = (type) => {
  if (isServerSideRendering()) return TERMINAL_CONFIG.FALLBACK_VALUES.SOCIAL_URL;
  
  const globalVar = GLOBAL_VARS.SOCIAL_PREFIX + type + GLOBAL_VARS.SOCIAL_SUFFIX;
  return window[globalVar] || TERMINAL_CONFIG.FALLBACK_VALUES.SOCIAL_URL;
};

const decodeHtmlEntities = (text) => {
  if (!text) return '';
  
  return text.replace(/&[^;]+;/g, (entity) => {
    return HTML_ENTITIES[entity] || entity;
  });
};

const getSkillsCardData = (cardIndex) => {
  if (isServerSideRendering()) return null;
  
  const globalVar = GLOBAL_VARS.SKILLS_CARD_PREFIX + cardIndex + GLOBAL_VARS.SKILLS_CARD_SUFFIX;
  return window[globalVar] || null;
};

const cleanMarkdownText = (text) => {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '$1');
};

const parseSkillsList = (skillsList) => {
  if (!skillsList || !skillsList.trim()) return [];
  
  const decodedList = decodeHtmlEntities(skillsList);
  return decodedList.split('\n').filter(item => item.trim()).map(item => item.trim());
};

const parseTagsList = (tags) => {
  if (!tags || !tags.trim()) return [];
  
  const decodedTags = decodeHtmlEntities(tags);
  return decodedTags.split(',').map(tag => tag.trim()).filter(tag => tag);
};

const formatSkillsTree = (items, isLastCard = false) => {
  if (!items || items.length === 0) return [];
  
  return items.map((item, index) => {
    const isLast = index === items.length - 1;
    const prefix = isLast ? '└──' : '├──';
    return `│  ${prefix} ${item}`;
  });
};

const processSkillsCard = (cardIndex) => {
  const cardData = getSkillsCardData(cardIndex);
  if (!cardData || !cardData.title) return [];
  
  const skills = [];
  const decodedTitle = decodeHtmlEntities(cardData.title);
  skills.push(`┌─ ${decodedTitle}`);
  
  // Priority: skills_list > description > tags
  if (cardData.skills_list && cardData.skills_list.trim()) {
    const skillItems = parseSkillsList(cardData.skills_list);
    skills.push(...formatSkillsTree(skillItems));
  } else if (cardData.description && cardData.description.trim()) {
    const cleanDescription = cleanMarkdownText(decodeHtmlEntities(cardData.description));
    skills.push(`│  └── ${cleanDescription}`);
  } else if (cardData.tags && cardData.tags.trim()) {
    const tagItems = parseTagsList(cardData.tags);
    skills.push(...formatSkillsTree(tagItems));
  }
  
  skills.push(''); // Empty line between cards
  return skills;
};

// Skills data extraction
// ----------------------
const getSkillsFromCards = () => {
  if (isServerSideRendering()) {
    return TERMINAL_CONFIG.FALLBACK_VALUES.NO_DATA;
  }

  const allSkills = [];
  
  // Process each skill card (1-5)
  for (let i = 1; i <= 5; i++) {
    const cardSkills = processSkillsCard(i);
    allSkills.push(...cardSkills);
  }
  
  // Remove last empty line if present
  if (allSkills.length > 0 && allSkills[allSkills.length - 1] === '') {
    allSkills.pop();
  }
  
  return allSkills.length > 0 ? allSkills : TERMINAL_CONFIG.FALLBACK_VALUES.NO_SKILLS;
};

// Navigation utilities
// --------------------
const dispatchTerminalClose = () => {
  if (isServerSideRendering()) return;
  window.dispatchEvent(new Event(EVENTS.TERMINAL_CLOSE));
};

const scrollToSection = (sectionId) => {
  if (isServerSideRendering()) return;
  
  const currentHash = window.location.hash;
  const newHash = `#${sectionId}`;
  
  if (currentHash !== newHash) {
    window.location.hash = newHash;
    setTimeout(dispatchTerminalClose, TERMINAL_CONFIG.TIMING.NAVIGATION_DELAY);
  } else {
    dispatchTerminalClose();
  }
};

const isGermanPath = () => {
  if (isServerSideRendering()) return false;
  return window.location.pathname.includes(URL_PATTERNS.GERMAN_PATH);
};

const getImprintUrl = () => {
  const isGerman = isGermanPath();
  return isGerman ? '/de/imprint/' : '/imprint/';
};

const openImprint = () => {
  if (isServerSideRendering()) return;
  
  dispatchTerminalClose();
  setTimeout(() => {
    window.location.href = getImprintUrl();
  }, TERMINAL_CONFIG.TIMING.IMPRINT_DELAY);
};

// Language utilities
// ------------------
const isGerman = () => {
  return isGermanPath();
};

const generateNewLanguagePath = (targetLang, currentPath) => {
  if (targetLang === 'de') {
    if (currentPath.startsWith(URL_PATTERNS.GERMAN_PATH)) return null;
    return currentPath === URL_PATTERNS.ROOT_PATH ? URL_PATTERNS.GERMAN_PATH : `/de${currentPath}`;
  } else {
    if (!currentPath.startsWith(URL_PATTERNS.GERMAN_PATH)) return null;
    const pathWithoutDe = currentPath.replace('/de', '');
    return pathWithoutDe === '' ? URL_PATTERNS.ROOT_PATH : pathWithoutDe;
  }
};

const switchLanguage = (targetLang) => {
  if (isServerSideRendering()) return;
  
  const currentPath = window.location.pathname;
  const newPath = generateNewLanguagePath(targetLang, currentPath);
  
  if (!newPath) return; // Already on target language
  
  const search = window.location.search;
  const hash = window.location.hash;
  
  localStorage.setItem(STORAGE_KEYS.LANGUAGE_PREFERENCE, targetLang);
  dispatchTerminalClose();
  
  setTimeout(() => {
    window.location.href = newPath + search + hash;
  }, TERMINAL_CONFIG.TIMING.LANGUAGE_SWITCH_DELAY);
};

export const makeCommands = () => {
  const german = isGerman();
  
  const baseCommands = {
    help: german ? {
      title: 'moehser-portfolio/',
      lines: [
        '├── 🧭 Navigation',
        '│   ├── home        → zur Startseite',
        '│   ├── skills      → zu den Fähigkeiten', 
        '│   ├── about       → zum Über-Mich Bereich',
        '│   ├── projects    → zu den Projekten',
        '│   └── impressum   → Impressum öffnen',
        '',
        '├── 🌍 Sprache',
        '│   ├── de          → zu Deutsch wechseln',
        '│   └── en          → zu English wechseln',
        '',
        '├── 📋 Projekt-Layout',
        '│   ├── grid        → Raster-Ansicht',
        '│   └── list        → Listen-Ansicht',
        '',
        '├── 🎨 Theme-Steuerung',
        '│   ├── light       → Hell-Modus',
        '│   └── dark        → Dunkel-Modus',
        '',
        '├── 🌐 Social Media',
        '│   ├── github      → GitHub-Profil öffnen',
        '│   ├── linkedin    → LinkedIn-Profil öffnen',
        '│   └── email       → E-Mail-Client öffnen',
        '',
        '├── 💼 Professionelle Infos',
        '│   ├── stack       → Kern-Technologien anzeigen',
        '│   ├── experience  → Was ich biete',
        '│   └── contact     → Kontakt aufnehmen',
        '',
        '└── 🎯 Schnellaktionen',
        '    ├── help        → dieses Menü anzeigen',
        '    ├── clear       → Terminal leeren',
        '    └── ESC         → Terminal schließen',
        '',
        '💡 Pfeiltasten zur Navigation, Enter zum Ausführen!',
      ],
    } : {
      title: 'moehser-portfolio/',
      lines: [
        '├── 🧭 Navigation',
        '│   ├── home        → go to hero section',
        '│   ├── skills      → go to skills section', 
        '│   ├── about       → go to about section',
        '│   ├── projects    → go to projects section',
        '│   └── imprint     → open imprint page',
        '',
        '├── 🌍 Language',
        '│   ├── de          → switch to German',
        '│   └── en          → switch to English',
        '',
        '├── 📋 Project Layout',
        '│   ├── grid        → switch to grid view',
        '│   └── list        → switch to list view',
        '',
        '├── 🎨 Theme Control',
        '│   ├── light       → switch to light mode',
        '│   └── dark        → switch to dark mode',
        '',
        '├── 🌐 Social Media',
        '│   ├── github      → open GitHub profile',
        '│   ├── linkedin    → open LinkedIn profile',
        '│   └── email       → open email client',
        '',
        '├── 💼 Professional Info',
        '│   ├── stack       → show core technologies',
        '│   ├── experience  → show what I deliver',
        '│   └── contact     → get in touch',
        '',
        '└── 🎯 Quick Actions',
        '    ├── help        → show this menu',
        '    ├── clear       → clear terminal',
        '    └── ESC         → close terminal',
        '',
        '💡 Use arrow keys to navigate, Enter to execute!',
      ],
    },
  stack: {
    title: 'Tech Stack & Skills',
    lines: getSkillsFromCards(),
  },
  experience: {
    title: 'What I deliver',
    lines: [
      '• Performance-optimized websites',
      '• Modern headless WordPress solutions',
      '• Inclusive, accessible user experiences',
    ],
  },
  contact: {
    title: 'Contact',
    lines: [
      'Email: ' + getEmail(),
      'GitHub/LinkedIn: see buttons in the corner',
      'Tip: press Copy to copy my email',
    ],
  },
  projects: {
    title: 'Projects',
    lines: [
      'Open the Projects page from the top menu to view case studies.',
      'Includes landing pages, dashboards and headless WordPress.',
    ],
  },
  socials: {
    title: 'Socials',
    lines: [
      `GitHub  : ${getSocialUrl('GITHUB')}`,
      `LinkedIn: ${getSocialUrl('LINKEDIN')}`,
    ],
  },
  // Navigation commands
  home: {
    title: 'Navigating to Hero section',
    lines: [
      'Scrolling to top of page...',
    ],
  },
  skills: {
    title: 'Navigating to Skills section',
    lines: [
      'Scrolling to skills section...',
    ],
  },
  about: {
    title: 'Navigating to About section',
    lines: [
      'Scrolling to about section...',
    ],
  },
  work: {
    title: 'Navigating to Projects section',
    lines: [
      'Scrolling to projects section...',
    ],
  },
  imprint: {
    title: 'Opening Imprint page',
    lines: [
      'Redirecting to imprint page...',
    ],
  },
  // Social media commands
  github: {
    title: 'Opening GitHub',
    lines: [
      `Opening GitHub profile: ${getSocialUrl('GITHUB')}`,
    ],
  },
  linkedin: {
    title: 'Opening LinkedIn',
    lines: [
      `Opening LinkedIn profile: ${getSocialUrl('LINKEDIN')}`,
    ],
  },
  email: {
    title: 'Opening Email Client',
    lines: [
      `Opening email client for: ${getEmail()}`,
    ],
  },
  // Additional helpful commands
  clear: {
    title: 'Terminal cleared',
    lines: [
      'Terminal cleared. Type "help" to see available commands.',
    ],
  },
  whoami: {
    title: 'User Information',
    lines: [
      'daniel@portfolio',
      'Full-stack Developer & UI/UX Designer',
      'Specializing in React, WordPress, and modern web technologies',
      '',
      '📍 Location: Hamburg, Germany',
      '💼 Available for freelance projects',
      '🎯 Focus: Performance, Accessibility, User Experience',
    ],
  },
  ls: {
    title: 'Directory Listing',
    lines: [
      'moehser-portfolio/',
      '├── assets/          # Static assets & compiled files',
      '├── inc/             # WordPress includes & custom functions',
      '├── wp-content/      # WordPress content & uploads',
      '├── functions.php    # Main theme functions',
      '├── style.css        # Theme stylesheet',
      '└── index.php        # Main template file',
      '',
      '💡 Use "help" to see available commands',
    ],
  },
  grid: {
    title: 'Switching to Grid View',
    lines: [
      'Changing projects layout to grid view...',
      'This will show projects in a card-based grid format.',
    ],
  },
  list: {
    title: 'Switching to List View',
    lines: [
      'Changing projects layout to list view...',
      'This will show projects in a compact list format.',
    ],
  },
  light: {
    title: 'Switching to Light Mode',
    lines: [
      'Changing theme to light mode...',
      'This will switch the entire portfolio to light theme.',
    ],
  },
  dark: {
    title: 'Switching to Dark Mode',
    lines: [
      'Changing theme to dark mode...',
      'This will switch the entire portfolio to dark theme.',
    ],
  }
  };
  
  // Add German command aliases if German is detected
  if (german) {
    // Keep main help command as German
    baseCommands.hilfe = baseCommands.help;
    
    // German aliases for navigation (skills, about, projects remain as main commands)
    baseCommands.fähigkeiten = baseCommands.skills;  // Alias for skills
    baseCommands['über-mich'] = baseCommands.about;  // Alias for about
    baseCommands.projekte = baseCommands.projects;   // Alias for projects
    
    // German-specific commands
    baseCommands.start = { title: 'Navigating to Start', lines: ['Going to hero section...'] };
    baseCommands.impressum = { title: 'Opening Imprint', lines: ['Opening imprint page...'] };
    baseCommands.hell = { title: 'Switching to Light Mode', lines: ['Changing theme to light mode...'] };
    baseCommands.dunkel = { title: 'Switching to Dark Mode', lines: ['Changing theme to dark mode...'] };
    baseCommands.erfahrung = { title: 'Professional Experience', lines: ['Showing professional experience...'] };
    baseCommands.kontakt = { title: 'Contact Information', lines: ['Showing contact information...'] };
    baseCommands.löschen = { title: 'Terminal Cleared', lines: ['Terminal geleert. Tippe "hilfe" für verfügbare Befehle.'] };
  }
  
  // Language switching commands (available on both languages)
  baseCommands.de = { title: 'Switching to German', lines: ['Switching to German language...'] };
  baseCommands.en = { title: 'Switching to English', lines: ['Switching to English language...'] };
  
  return baseCommands;
};

export const COMMAND_ORDER = [
  'help',
  'home',
  'skills', 
  'about',
  'projects',
  'grid',
  'list',
  'light',
  'dark',
  'imprint',
  'github',
  'linkedin',
  'email',
  'whoami',
  'ls',
  'stack', 
  'experience', 
  'contact', 
  'socials'
];

export const buildActions = (cmd) => {
  const map = {};
  
  // Navigation actions
  if (cmd === 'home') {
    map[0] = () => {
      // Navigate to home page and then to hero section
      if (window.location.pathname.includes('/imprint')) {
        // If on imprint page, navigate to home page first
        window.location.href = '/';
      } else {
        // If on main page, navigate to root hash (empty hash)
        window.location.hash = '';
      }
    };
  }
  
  if (cmd === 'skills') {
    map[0] = () => {
      if (window.location.pathname.includes('/imprint')) {
        window.location.href = '/#skills';
      } else {
        scrollToSection('skills');
      }
    };
  }
  
  if (cmd === 'about') {
    map[0] = () => {
      if (window.location.pathname.includes('/imprint')) {
        window.location.href = '/#about';
      } else {
        scrollToSection('about');
      }
    };
  }
  
  if (cmd === 'projects') {
    map[0] = () => {
      if (window.location.pathname.includes('/imprint')) {
        window.location.href = '/#projects';
      } else {
        scrollToSection('projects');
      }
    };
  }
  
  if (cmd === 'imprint') {
    map[0] = () => openImprint();
  }
  
  if (cmd === 'impressum') {
    map[0] = () => openImprint();
  }
  
  if (cmd === 'de') {
    map[0] = () => switchLanguage('de');
  }
  
  if (cmd === 'en') {
    map[0] = () => switchLanguage('en');
  }
  
  // Project layout commands
  if (cmd === 'grid') {
    map[0] = () => {
      // First navigate to projects section
      if (window.location.pathname.includes('/imprint')) {
        window.location.href = '/#projects';
      } else {
        scrollToSection('projects');
      }
      // Then trigger grid layout change
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('projects:layout', { detail: { layout: 'grid' } }));
        // Close terminal after layout change
        setTimeout(() => {
          window.dispatchEvent(new Event('terminal:close'));
        }, 300);
      }, 500);
    };
  }
  
  if (cmd === 'list') {
    map[0] = () => {
      // First navigate to projects section
      if (window.location.pathname.includes('/imprint')) {
        window.location.href = '/#projects';
      } else {
        scrollToSection('projects');
      }
      // Then trigger list layout change
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('projects:layout', { detail: { layout: 'list' } }));
        // Close terminal after layout change
        setTimeout(() => {
          window.dispatchEvent(new Event('terminal:close'));
        }, 300);
      }, 500);
    };
  }
  
  // Theme switching commands
  if (cmd === 'light') {
    map[0] = () => {
      // Switch to light mode
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      // Save preference
      localStorage.setItem('theme', 'light');
      // Close terminal after theme change
      setTimeout(() => {
        window.dispatchEvent(new Event('terminal:close'));
      }, 300);
    };
  }
  
  if (cmd === 'dark') {
    map[0] = () => {
      // Switch to dark mode
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      // Save preference
      localStorage.setItem('theme', 'dark');
      // Close terminal after theme change
      setTimeout(() => {
        window.dispatchEvent(new Event('terminal:close'));
      }, 300);
    };
  }
  
  // Social media actions
  if (cmd === 'github') {
    const githubUrl = getSocialUrl('GITHUB');
    if (githubUrl !== '—') {
      map[0] = () => {
        window.open(githubUrl, '_blank');
        // Close terminal after opening social link
        setTimeout(() => {
          window.dispatchEvent(new Event('terminal:close'));
        }, 300);
      };
    }
  }
  
  if (cmd === 'linkedin') {
    const linkedinUrl = getSocialUrl('LINKEDIN');
    if (linkedinUrl !== '—') {
      map[0] = () => {
        window.open(linkedinUrl, '_blank');
        // Close terminal after opening social link
        setTimeout(() => {
          window.dispatchEvent(new Event('terminal:close'));
        }, 300);
      };
    }
  }
  
  if (cmd === 'email') {
    const email = getEmail();
    const subject = getEmailSubject();
    if (email) {
      map[0] = () => {
        const mailtoUrl = generateMailtoUrl(email, subject);
        window.open(mailtoUrl, '_blank');
        // Close terminal after opening email client
        setTimeout(() => {
          window.dispatchEvent(new Event('terminal:close'));
        }, 300);
      };
    }
  }
  
  // Legacy actions
  if (cmd === 'contact') {
    const email = getEmail();
    const subject = getEmailSubject();
    if (email) {
      map[0] = () => {
        const mailtoUrl = generateMailtoUrl(email, subject);
        window.open(mailtoUrl, '_blank');
        // Close terminal after opening email client
        setTimeout(() => {
          window.dispatchEvent(new Event('terminal:close'));
        }, 300);
      };
    }
  }
  
  
  if (cmd === 'socials') {
    const githubUrl = getSocialUrl('GITHUB');
    const linkedinUrl = getSocialUrl('LINKEDIN');
    
    if (githubUrl !== '—') {
      map[0] = () => window.open(githubUrl, '_blank');
    }
    if (linkedinUrl !== '—') {
      map[1] = () => window.open(linkedinUrl, '_blank');
    }
  }
  
  return map;
};
