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

export const makeCommands = () => ({
  help: {
    title: 'Available commands',
    lines: [
      'help        - list commands',
      'stack       - show core technologies',
      'experience  - show what I deliver',
      'contact     - get in touch',
      'projects    - where to find my work',
      'socials     - GitHub & LinkedIn',
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
});

export const COMMAND_ORDER = [
  'stack', 
  'experience', 
  'contact', 
  'projects', 
  'socials', 
  'help'
];

export const buildActions = (cmd) => {
  const map = {};
  
  if (cmd === 'contact') {
    map[0] = () => {
      const email = getEmail();
      if (email) {
        window.location.href = `mailto:${email}`;
      }
    };
  }
  
  if (cmd === 'projects') {
    map[0] = () => { 
      window.location.href = '/projects'; 
    };
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
