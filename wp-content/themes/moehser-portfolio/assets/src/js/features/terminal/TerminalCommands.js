// Terminal Commands
// =================

// All available terminal commands and their logic
// ------------------------------

import { getEmail, getEmailSubject, generateMailtoUrl } from '../../utils/emailHelper.js';

// Helper function to safely get social media URLs
const getSocialUrl = (type) => {
  if (typeof window !== 'undefined' && window[`__SOCIAL_${type}__`]) {
    return window[`__SOCIAL_${type}__`];
  }
  return '—';
};

// Helper function to get skills from cards
// ----------------------------------------
const getSkillsFromCards = () => {
  if (typeof window === 'undefined') {
    return ['Skills data not available'];
  }

  const skills = [];
  
  // Check each skill card (1-5)
  for (let i = 1; i <= 5; i++) {
    const cardData = window[`__SKILLS_CARD${i}__`];
    if (cardData && cardData.title) {
      // Decode HTML entities
      const title = cardData.title.replace(/&[^;]+;/g, (entity) => {
        const entities = {
          '&amp;': '&',
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&#39;': "'",
          '&nbsp;': ' '
        };
        return entities[entity] || entity;
      });
      
      skills.push(`┌─ ${title}`);
      
      // Check if there's a skills list
      if (cardData.skills_list && cardData.skills_list.trim()) {
        const skillsList = cardData.skills_list.replace(/&[^;]+;/g, (entity) => {
          const entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&nbsp;': ' '
          };
          return entities[entity] || entity;
        });
        
        // Split skills list by line breaks and add each skill
        const skillItems = skillsList.split('\n').filter(item => item.trim());
        skillItems.forEach((skill, index) => {
          const isLast = index === skillItems.length - 1;
          const prefix = isLast ? '└──' : '├──';
          skills.push(`│  ${prefix} ${skill.trim()}`);
        });
      } else {
        // If no skills list, show description first, then tags
        if (cardData.description && cardData.description.trim()) {
          const description = cardData.description.replace(/&[^;]+;/g, (entity) => {
            const entities = {
              '&amp;': '&',
              '&lt;': '<',
              '&gt;': '>',
              '&quot;': '"',
              '&#39;': "'",
              '&nbsp;': ' '
            };
            return entities[entity] || entity;
          });
          
          // Remove markdown formatting and show clean description
          const cleanDescription = description.replace(/\*\*(.*?)\*\*/g, '$1');
          skills.push(`│  └── ${cleanDescription}`);
        } else if (cardData.tags && cardData.tags.trim()) {
          // If no description, show tags
          const tags = cardData.tags.replace(/&[^;]+;/g, (entity) => {
            const entities = {
              '&amp;': '&',
              '&lt;': '<',
              '&gt;': '>',
              '&quot;': '"',
              '&#39;': "'",
              '&nbsp;': ' '
            };
            return entities[entity] || entity;
          });
          
          const tagItems = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          tagItems.forEach((tag, index) => {
            const isLast = index === tagItems.length - 1;
            const prefix = isLast ? '└──' : '├──';
            skills.push(`│  ${prefix} ${tag}`);
          });
        }
      }
      skills.push(''); // Empty line between cards
    }
  }
  
  // Remove last empty line if present
  if (skills[skills.length - 1] === '') {
    skills.pop();
  }
  
  return skills.length > 0 ? skills : ['No skills data available'];
};

// Helper function to scroll to section smoothly
const scrollToSection = (sectionId) => {
  if (typeof window !== 'undefined') {
    // Use the existing hash navigation system by changing the URL hash
    // This triggers the existing hash change handler in App.jsx
    const currentHash = window.location.hash;
    const newHash = `#${sectionId}`;
    
    if (currentHash !== newHash) {
      window.location.hash = newHash;
      
      // Close terminal after navigation
      setTimeout(() => {
        window.dispatchEvent(new Event('terminal:close'));
      }, 500);
    } else {
      // If already at the section, just close the terminal
      window.dispatchEvent(new Event('terminal:close'));
    }
  }
};

// Helper function to open imprint page
const openImprint = () => {
  if (typeof window !== 'undefined') {
    // Close terminal before navigation
    window.dispatchEvent(new Event('terminal:close'));
    // Small delay to allow terminal to close before navigation
    setTimeout(() => {
      // Navigate to appropriate imprint page based on current language
      const isGermanPath = window.location.pathname.includes('/de/');
      const imprintUrl = isGermanPath ? '/de/imprint/' : '/imprint/';
      window.location.href = imprintUrl;
    }, 100);
  }
};

// Helper function to detect German language
const isGerman = () => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.includes('/de/');
};

// Helper function to switch language
const switchLanguage = (targetLang) => {
  if (typeof window === 'undefined') return;
  
  const currentPath = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;
  
  let newPath;
  if (targetLang === 'de') {
    // Switch to German
    if (currentPath.startsWith('/de/')) {
      // Already German, do nothing
      return;
    }
    newPath = currentPath === '/' ? '/de/' : `/de${currentPath}`;
  } else {
    // Switch to English
    if (!currentPath.startsWith('/de/')) {
      // Already English, do nothing
      return;
    }
    // Remove /de prefix and ensure we have a valid path
    const pathWithoutDe = currentPath.replace('/de', '');
    newPath = pathWithoutDe === '' ? '/' : pathWithoutDe;
  }
  
  // Save user's manual language preference to localStorage
  localStorage.setItem('user_language_preference', targetLang);
  
  // Close terminal before navigation
  window.dispatchEvent(new Event('terminal:close'));
  
  // Small delay to allow terminal to close before navigation
  setTimeout(() => {
    window.location.href = newPath + search + hash;
  }, 100);
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
