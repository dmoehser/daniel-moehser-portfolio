// Terminal Commands
// =================

// All available terminal commands and their logic
// ------------------------------

// Helper function to safely get social media URLs
const getSocialUrl = (type) => {
  if (typeof window !== 'undefined' && window[`__SOCIAL_${type}__`]) {
    return window[`__SOCIAL_${type}__`];
  }
  return '—';
};

// Helper function to safely get email
const getEmail = () => {
  if (typeof window !== 'undefined' && window.__SOCIAL_EMAIL__) {
    return window.__SOCIAL_EMAIL__;
  }
  return '';
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
      window.location.href = '/imprint';
    }, 100);
  }
};

export const makeCommands = () => ({
  help: {
    title: 'Available commands',
    lines: [
      'help        - list all commands',
      'stack       - show core technologies',
      'experience  - show what I deliver',
      'contact     - get in touch',
      'projects    - where to find my work',
      'socials     - GitHub & LinkedIn',
      '',
      'Navigation:',
      'home        - go to hero section',
      'skills      - go to skills section',
      'about       - go to about section',
      'projects    - go to projects section',
      'imprint     - open imprint page',
      '',
      'Social Media:',
      'github      - open GitHub profile',
      'linkedin    - open LinkedIn profile',
      'email       - open email client',
    ],
  },
  stack: {
    title: 'Core technologies',
    lines: [
      'Frontend : React, TypeScript, Vite, Sass/Tailwind',
      'Backend  : Node.js, Express, PHP, WordPress (REST)',
      'Database : MySQL',
      'Tooling  : Docker, GitHub Actions, Playwright',
    ],
  },
  experience: {
    title: 'What I deliver',
    lines: [
      '• Core Web Vitals in green (LCP < 2s, CLS ~0)',
      '• Headless WP + React: fast publishing flows',
      '• Accessibility: keyboard and screenreader friendly',
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
});

export const COMMAND_ORDER = [
  'help',
  'home',
  'skills', 
  'about',
  'work',
  'imprint',
  'github',
  'linkedin',
  'email',
  'stack', 
  'experience', 
  'contact', 
  'projects', 
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
    if (email) {
      map[0] = () => {
        window.location.href = `mailto:${email}`;
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
    if (email) {
      map[0] = () => {
        window.location.href = `mailto:${email}`;
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
