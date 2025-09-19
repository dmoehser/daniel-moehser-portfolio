// Mobile Menu Component
// ====================

import React, { useState, useEffect, useRef } from 'react';
import { getMailtoUrl } from '../../utils/emailHelper.js';
import { useLanguage } from '../../hooks/useLanguage.js';

// Constants
// ---------
const SECTION_MAPPING = {
  HOME: 'hero',
  ABOUT: 'about',
  PROJECTS: 'projects',
  SKILLS: 'skills'
};

const API_CONFIG = {
  BASE_ENDPOINT: '/wp-json/moehser/v1/menu/header_primary',
  LOCALIZED_ENDPOINT: '/de/wp-json/moehser/v1/menu/header_primary',
  FALLBACK_BASE: '/index.php?rest_route=/moehser/v1/menu/header_primary',
  FALLBACK_LOCALIZED: '/de/index.php?rest_route=/moehser/v1/menu/header_primary'
};

const MOBILE_BREAKPOINT = 1024; // pixels (includes tablets)

const CSS_CLASSES = {
  CONTAINER: 'mobile-menu',
  TOGGLE: 'mobile-menu__toggle',
  TOGGLE_OPEN: 'mobile-menu__toggle--open',
  HAMBURGER: 'mobile-menu__hamburger',
  LINE: 'mobile-menu__line',
  OVERLAY: 'mobile-menu__overlay',
  OVERLAY_OPEN: 'mobile-menu__overlay--open',
  CLOSE: 'mobile-menu__close',
  CLOSE_ICON: 'mobile-menu__close-icon',
  NAV: 'mobile-menu__nav',
  LINK: 'mobile-menu__link',
  DIVIDER: 'mobile-menu__divider',
  SECTION: 'mobile-menu__section',
  SECTION_TITLE: 'mobile-menu__section-title',
  ACTION: 'mobile-menu__action',
  ACTION_ICON: 'mobile-menu__action-icon',
  ACTION_LABEL: 'mobile-menu__action-label'
};

const ARIA_LABELS = {
  OPEN_MENU: 'Open mobile navigation menu',
  CLOSE_MENU: 'Close mobile navigation menu',
  NAVIGATION: 'Mobile navigation menu',
  NAVIGATE_TO: (section) => `Navigate to ${section} section`
};

const SOCIAL_LINKS = [
  {
    type: 'email',
    label: 'Email',
    href: () => getMailtoUrl(),
    icon: '📧'
  },
  {
    type: 'github',
    label: 'GitHub',
    href: () => typeof window !== 'undefined' && window.__SOCIAL_GITHUB__ 
      ? window.__SOCIAL_GITHUB__ 
      : 'https://github.com/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="18" height="18">
        <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38C13.71 14.53 16 11.54 16 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    ),
    external: true
  },
  {
    type: 'linkedin',
    label: 'LinkedIn',
    href: () => typeof window !== 'undefined' && window.__SOCIAL_LINKEDIN__ 
      ? window.__SOCIAL_LINKEDIN__ 
      : 'https://linkedin.com/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.028-3.037-1.852-3.037-1.853 0-2.136 1.447-2.136 2.942v5.664H9.352V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.368-1.85 3.602 0 4.267 2.371 4.267 5.455v6.286zM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126zM7.115 20.452H3.558V9h3.557v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    external: true
  }
];

const THEME_ICONS = {
  LIGHT: '🌙',
  DARK: '☀️'
};

const LANGUAGE_CONFIG = {
  FLAGS: {
    GERMAN_TO_ENGLISH: '🇬🇧',
    ENGLISH_TO_GERMAN: '🇩🇪'
  },
  LABELS: {
    GERMAN_TO_ENGLISH: 'English',
    ENGLISH_TO_GERMAN: 'German'
  }
};

// Custom Hooks
// ------------
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

const useThemeState = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDark(isDarkMode);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.classList.toggle('theme-dark', newTheme === 'dark');
  };
  
  return { isDark, toggleTheme };
};

const useMobileMenu = (isGerman) => {
  const [menuItems, setMenuItems] = useState([]);
  
  useEffect(() => {
    let cancelled = false;
    
    const loadMenuData = async () => {
      try {
        const primaryUrl = isGerman ? API_CONFIG.LOCALIZED_ENDPOINT : API_CONFIG.BASE_ENDPOINT;
        let response = await fetch(primaryUrl);
        let data;
        
        const contentType = response.headers.get('content-type') || '';
        
        if (response.ok && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Fallback to index.php route
          const fallbackUrl = isGerman ? API_CONFIG.FALLBACK_LOCALIZED : API_CONFIG.FALLBACK_BASE;
          response = await fetch(fallbackUrl);
          if (!response.ok) throw new Error(`Menu API failed: ${response.status}`);
          data = await response.json();
        }
        
        if (!cancelled) {
          const topLevelItems = Array.isArray(data) 
            ? data.filter(item => !item.parent) 
            : [];
          setMenuItems(topLevelItems);
        }
      } catch (error) {
        console.error('Menu loading error:', error);
        if (!cancelled) setMenuItems([]);
      }
    };
    
    loadMenuData();
    return () => { cancelled = true; };
  }, [isGerman]);
  
  return menuItems;
};

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Use custom hooks and language hook
  const { isGerman, switchLanguage } = useLanguage();
  const isMobile = useMobileDetection();
  const { isDark, toggleTheme } = useThemeState();
  const menuItems = useMobileMenu(isGerman);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on ESC key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);


  // Utility functions
  const resolveSectionId = (href, title) => {
    try {
      const url = new URL(href, window.location.origin);
      if (url.hash) return url.hash.replace(/^#/, '');
      
      const pathSegment = (url.pathname || '')
        .replace(/^\/+|\/+$/g, '')
        .toLowerCase();
      
      if (pathSegment === '' || pathSegment === 'home') {
        return SECTION_MAPPING.HOME;
      }
      if (pathSegment.includes('about')) return SECTION_MAPPING.ABOUT;
      if (pathSegment.includes('project')) return SECTION_MAPPING.PROJECTS;
      if (pathSegment.includes('skill')) return SECTION_MAPPING.SKILLS;
    } catch {
      // URL parsing failed, continue to title-based fallback
    }
    
    const titleLower = (title || '').toLowerCase();
    if (titleLower.includes('about')) return SECTION_MAPPING.ABOUT;
    if (titleLower.includes('project')) return SECTION_MAPPING.PROJECTS;
    if (titleLower.includes('skill')) return SECTION_MAPPING.SKILLS;
    if (titleLower.includes('home')) return SECTION_MAPPING.HOME;
    
    return null;
  };

  const scrollToSection = (sectionId) => {
    const container = document.getElementById('content-scroll');
    if (!container) return;
    
    const target = sectionId === SECTION_MAPPING.HOME 
      ? document.querySelector('section.hero') 
      : document.getElementById(sectionId);
    
    if (!target) return;
    
    container.scrollTo({ 
      top: target.offsetTop, 
      behavior: 'smooth' 
    });
    
    const basePath = isGerman ? '/de' : '';
    const newUrl = sectionId === SECTION_MAPPING.HOME 
      ? `${basePath}/#` 
      : `${basePath}/#${sectionId}`;
    window.history.replaceState(null, '', newUrl);
    
    try {
      window.dispatchEvent(new CustomEvent('nav:jump', { 
        detail: { id: sectionId } 
      }));
    } catch (error) {
      console.warn('Failed to dispatch nav:jump event:', error);
    }
    
    setIsOpen(false);
  };

  const handleItemClick = (event, sectionId) => {
    if (!sectionId) return;
    event.preventDefault();
    
    const isImprintPage = window.location.pathname.includes('/imprint/');
    
    if (isImprintPage) {
      const basePath = isGerman ? '/de' : '';
      const redirectUrl = sectionId === SECTION_MAPPING.HOME 
        ? `${basePath}/#` 
        : `${basePath}/#${sectionId}`;
      window.location.href = redirectUrl;
    } else {
      scrollToSection(sectionId);
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setIsOpen(false);
  };

  const handleLanguageSwitch = () => {
    switchLanguage();
    setIsOpen(false);
  };

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  // Computed values
  const toggleClasses = `${CSS_CLASSES.TOGGLE} ${isOpen ? CSS_CLASSES.TOGGLE_OPEN : ''}`;
  const overlayClasses = `${CSS_CLASSES.OVERLAY} ${isOpen ? CSS_CLASSES.OVERLAY_OPEN : ''}`;
  const currentThemeIcon = isDark ? THEME_ICONS.DARK : THEME_ICONS.LIGHT;
  const currentLanguageFlag = isGerman ? LANGUAGE_CONFIG.FLAGS.GERMAN_TO_ENGLISH : LANGUAGE_CONFIG.FLAGS.ENGLISH_TO_GERMAN;
  const currentLanguageLabel = isGerman ? LANGUAGE_CONFIG.LABELS.GERMAN_TO_ENGLISH : LANGUAGE_CONFIG.LABELS.ENGLISH_TO_GERMAN;

  return (
    <div className={CSS_CLASSES.CONTAINER}>
      <button
        ref={buttonRef}
        className={toggleClasses}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? ARIA_LABELS.CLOSE_MENU : ARIA_LABELS.OPEN_MENU}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-content"
      >
        <span className={CSS_CLASSES.HAMBURGER} aria-hidden="true">
          <span className={CSS_CLASSES.LINE}></span>
          <span className={CSS_CLASSES.LINE}></span>
          <span className={CSS_CLASSES.LINE}></span>
        </span>
      </button>
      
      {isOpen && (
        <div 
          ref={menuRef}
          id="mobile-menu-content"
          className={overlayClasses}
          role="navigation"
          aria-label={ARIA_LABELS.NAVIGATION}
        >
        <button
          className={CSS_CLASSES.CLOSE}
          onClick={() => setIsOpen(false)}
          aria-label={ARIA_LABELS.CLOSE_MENU}
        >
          <span className={CSS_CLASSES.CLOSE_ICON} aria-hidden="true">×</span>
        </button>
        
        <nav className={CSS_CLASSES.NAV}>
          {/* Navigation Links */}
          {menuItems.map((item) => {
            const sectionId = resolveSectionId(item.url, item.title);
            const basePath = isGerman ? '/de' : '';
            const href = `${basePath}/#${sectionId || ''}`;
            
            return (
              <a 
                key={item.id} 
                href={href} 
                className={CSS_CLASSES.LINK} 
                aria-label={ARIA_LABELS.NAVIGATE_TO(item.title)}
                onClick={(event) => handleItemClick(event, sectionId)}
              >
                {item.title}
              </a>
            );
          })}
          
          {/* Settings Section */}
          <div className={CSS_CLASSES.DIVIDER}></div>
          <div className={CSS_CLASSES.SECTION}>
            <h3 className={CSS_CLASSES.SECTION_TITLE}>
              {isGerman ? 'Einstellungen' : 'Settings'}
            </h3>
            <button
              className={CSS_CLASSES.ACTION}
              onClick={handleThemeToggle}
            >
              <span className={CSS_CLASSES.ACTION_ICON}>
                {currentThemeIcon}
              </span>
              <span className={CSS_CLASSES.ACTION_LABEL}>
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            <button
              className={CSS_CLASSES.ACTION}
              onClick={handleLanguageSwitch}
            >
              <span className={CSS_CLASSES.ACTION_ICON}>
                {currentLanguageFlag}
              </span>
              <span className={CSS_CLASSES.ACTION_LABEL}>
                {currentLanguageLabel}
              </span>
            </button>
          </div>
          
          {/* Social Links Section */}
          <div className={CSS_CLASSES.DIVIDER}></div>
          <div className={CSS_CLASSES.SECTION}>
            <h3 className={CSS_CLASSES.SECTION_TITLE}>Connect</h3>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.type}
                href={social.href()}
                className={CSS_CLASSES.ACTION}
                {...(social.external && {
                  target: "_blank",
                  rel: "noreferrer"
                })}
              >
                <span className={CSS_CLASSES.ACTION_ICON}>
                  {social.icon}
                </span>
                <span className={CSS_CLASSES.ACTION_LABEL}>
                  {social.label}
                </span>
              </a>
            ))}
          </div>
          
          {/* Legal Section */}
          <div className={CSS_CLASSES.DIVIDER}></div>
          <div className={CSS_CLASSES.SECTION}>
            <h3 className={CSS_CLASSES.SECTION_TITLE}>
              {isGerman ? 'Rechtliches' : 'Legal'}
            </h3>
            <a
              href={isGerman ? "/de/imprint/" : "/imprint/"}
              className={CSS_CLASSES.ACTION}
              onClick={() => setIsOpen(false)}
            >
              <span className={CSS_CLASSES.ACTION_ICON}>📄</span>
              <span className={CSS_CLASSES.ACTION_LABEL}>
                {isGerman ? 'Impressum' : 'Imprint'}
              </span>
            </a>
          </div>
        </nav>
        </div>
      )}
    </div>
  );
}
