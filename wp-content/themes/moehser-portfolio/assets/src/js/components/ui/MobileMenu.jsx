// Mobile Menu Component
// ====================

// Responsive hamburger menu for mobile navigation
// ------------------------------------------------

import React, { useState, useEffect, useRef } from 'react';
import { getMailtoUrl } from '../../utils/emailHelper.js';
import { useLanguage } from '../../hooks/useLanguage.js';

// Section mapping constants
// ------------------------------
const SECTION_MAPPING = {
  HOME: 'hero',
  ABOUT: 'about',
  PROJECTS: 'projects',
  SKILLS: 'skills'
};

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const { isGerman, switchLanguage } = useLanguage();

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize theme state
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDark(isDarkMode);
  }, []);

  // Load WordPress menu
  useEffect(() => {
    let cancelled = false;
    
    async function loadMenu() {
      try {
        // Use language-specific API URL
        const apiUrl = isGerman ? '/de/wp-json/moehser/v1/menu/header_primary' : '/wp-json/moehser/v1/menu/header_primary';
        let res = await fetch(apiUrl);
        let data;
        const contentType = res.headers.get('content-type') || '';
        
        if (res.ok && contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const fallbackUrl = isGerman ? '/de/index.php?rest_route=/moehser/v1/menu/header_primary' : '/index.php?rest_route=/moehser/v1/menu/header_primary';
          res = await fetch(fallbackUrl);
          if (!res.ok) throw new Error('Menu REST API failed');
          data = await res.json();
        }
        
        if (!cancelled) {
          const filteredItems = Array.isArray(data) 
            ? data.filter(item => !item.parent) 
            : [];
          setMenuItems(filteredItems);
        }
      } catch {
        if (!cancelled) setMenuItems([]);
      }
    }
    
    loadMenu();
    return () => { cancelled = true; };
  }, [isGerman]);

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

  // Social links configuration
  const socialLinks = [
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

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.classList.toggle('theme-dark', newTheme === 'dark');
    setIsOpen(false); // Close menu after theme change
  };


  // Resolve section ID from href/title
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
    } catch {}
    
    const titleLower = (title || '').toLowerCase();
    if (titleLower.includes('about')) return SECTION_MAPPING.ABOUT;
    if (titleLower.includes('project')) return SECTION_MAPPING.PROJECTS;
    if (titleLower.includes('skill')) return SECTION_MAPPING.SKILLS;
    if (titleLower.includes('home')) return SECTION_MAPPING.HOME;
    
    return null;
  };

  // Scroll to section
  const scrollTo = (id) => {
    const container = document.getElementById('content-scroll');
    if (!container) return;
    
    const target = id === SECTION_MAPPING.HOME 
      ? document.querySelector('section.hero') 
      : document.getElementById(id);
    
    if (!target) return;
    
    const targetTop = target.offsetTop;
    container.scrollTo({ 
      top: targetTop, 
      behavior: 'smooth' 
    });
    
    const basePath = isGerman ? '/de' : '';
    const url = id === SECTION_MAPPING.HOME ? `${basePath}/#` : `${basePath}/#${id}`;
    window.history.replaceState(null, '', url);
    
    try {
      window.dispatchEvent(new CustomEvent('nav:jump', { 
        detail: { id } 
      }));
    } catch {}
    
    setIsOpen(false); // Close menu after navigation
  };

  // Handle navigation item click
  const handleItemClick = (e, id) => {
    if (!id) return;
    e.preventDefault();
    
    // Check if we're on the imprint page
    const isImprintPage = window.location.pathname.includes('/imprint/');
    
    if (isImprintPage) {
      // Redirect to main page with section hash
      const basePath = isGerman ? '/de' : '';
      const url = id === SECTION_MAPPING.HOME ? `${basePath}/#` : `${basePath}/#${id}`;
      window.location.href = url;
    } else {
      // Normal scroll behavior on main page
      scrollTo(id);
    }
  };

  // Use all menu items (no terminal filtering needed)
  const pillItems = menuItems;

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <div className="mobile-menu">
      <button
        ref={buttonRef}
        className={`mobile-menu__toggle ${isOpen ? 'mobile-menu__toggle--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close mobile navigation menu' : 'Open mobile navigation menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-content"
      >
        <span className="mobile-menu__hamburger" aria-hidden="true">
          <span className="mobile-menu__line"></span>
          <span className="mobile-menu__line"></span>
          <span className="mobile-menu__line"></span>
        </span>
      </button>
      
      <div 
        ref={menuRef}
        id="mobile-menu-content"
        className={`mobile-menu__overlay ${isOpen ? 'mobile-menu__overlay--open' : ''}`}
        aria-hidden={!isOpen}
        role="navigation"
        aria-label="Mobile navigation menu"
      >
        <button
          className="mobile-menu__close"
          onClick={() => setIsOpen(false)}
          aria-label="Close mobile navigation menu"
        >
          <span className="mobile-menu__close-icon" aria-hidden="true">×</span>
        </button>
        
        <nav className="mobile-menu__nav">
          {/* Navigation Links */}
          {pillItems.map((item) => {
            const id = resolveSectionId(item.url, item.title);
            const label = item.title;
            
            return (
              <a 
                key={item.id} 
                href={`${isGerman ? '/de' : ''}/#${id || ''}`} 
                className="mobile-menu__link" 
                aria-label={`Navigate to ${label} section`}
                onClick={(e) => {
                  e.preventDefault();
                  // Close mobile menu first
                  handleItemClick(e, id);
                  // Clean URL and navigate without page reload
                  const basePath = isGerman ? '/de' : '';
                  const cleanUrl = window.location.origin + `${basePath}/#${id || ''}`;
                  window.history.replaceState({}, '', cleanUrl);
                }}
              >
                {label}
              </a>
            );
          })}
          
          {/* Settings Section */}
          <div className="mobile-menu__divider"></div>
          <div className="mobile-menu__section">
            <h3 className="mobile-menu__section-title">{isGerman ? 'Einstellungen' : 'Settings'}</h3>
            <button
              className="mobile-menu__action"
              onClick={toggleTheme}
            >
              <span className="mobile-menu__action-icon">
                {isDark ? '☀️' : '🌙'}
              </span>
              <span className="mobile-menu__action-label">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            <button
              className="mobile-menu__action"
              onClick={() => {
                switchLanguage();
                setIsOpen(false);
              }}
            >
              <span className="mobile-menu__action-icon">
                {isGerman ? '🇬🇧' : '🇩🇪'}
              </span>
              <span className="mobile-menu__action-label">
                {isGerman ? 'English' : 'German'}
              </span>
            </button>
          </div>
          
          {/* Social Links Section */}
          <div className="mobile-menu__divider"></div>
          <div className="mobile-menu__section">
            <h3 className="mobile-menu__section-title">Connect</h3>
            {socialLinks.map((social) => (
              <a
                key={social.type}
                href={social.href()}
                className="mobile-menu__action"
                {...(social.external && {
                  target: "_blank",
                  rel: "noreferrer"
                })}
              >
                <span className="mobile-menu__action-icon">
                  {social.icon}
                </span>
                <span className="mobile-menu__action-label">{social.label}</span>
              </a>
            ))}
          </div>
          
          {/* Legal Section */}
          <div className="mobile-menu__divider"></div>
          <div className="mobile-menu__section">
            <h3 className="mobile-menu__section-title">{isGerman ? 'Rechtliches' : 'Legal'}</h3>
            <a
              href={isGerman ? "/de/imprint/" : "/imprint/"}
              className="mobile-menu__action"
              onClick={() => setIsOpen(false)}
            >
              <span className="mobile-menu__action-icon">📄</span>
              <span className="mobile-menu__action-label">{isGerman ? 'Impressum' : 'Imprint'}</span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
