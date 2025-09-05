// Mobile Menu Component
// ====================

// Responsive hamburger menu for mobile navigation
// ------------------------------------------------

import React, { useState, useEffect, useRef } from 'react';

// Section mapping constants
// ------------------------------
const SECTION_MAPPING = {
  HOME: 'hero',
  ABOUT: 'about',
  PROJECTS: 'projects',
  SKILLS: 'skills',
  TERMINAL: 'terminal'
};

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

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
        let res = await fetch('/wp-json/moehser/v1/menu/header_primary');
        let data;
        const contentType = res.headers.get('content-type') || '';
        
        if (res.ok && contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const fallbackUrl = '/index.php?rest_route=/moehser/v1/menu/header_primary';
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
  }, []);

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
      href: () => `mailto:${window.__SOCIAL_EMAIL__ || ''}`,
      icon: '📧'
    },
    {
      type: 'github',
      label: 'GitHub',
      href: () => typeof window !== 'undefined' && window.__SOCIAL_GITHUB__ 
        ? window.__SOCIAL_GITHUB__ 
        : 'https://github.com/',
      icon: '🐙',
      external: true
    },
    {
      type: 'linkedin',
      label: 'LinkedIn',
      href: () => typeof window !== 'undefined' && window.__SOCIAL_LINKEDIN__ 
        ? window.__SOCIAL_LINKEDIN__ 
        : 'https://linkedin.com/',
      icon: '💼',
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
  };

  // Terminal toggle function
  const openTerminal = () => {
    window.dispatchEvent(new Event('terminal:toggle'));
    setIsOpen(false);
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
    if (titleLower.includes('terminal')) return SECTION_MAPPING.TERMINAL;
    
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
    
    const url = id === SECTION_MAPPING.HOME ? '/#' : `/#${id}`;
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
    scrollTo(id);
  };

  // Filter out terminal items
  const pillItems = menuItems.filter((item) => 
    resolveSectionId(item.url, item.title) !== SECTION_MAPPING.TERMINAL
  );

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
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <span className="mobile-menu__hamburger">
          <span className="mobile-menu__line"></span>
          <span className="mobile-menu__line"></span>
          <span className="mobile-menu__line"></span>
        </span>
      </button>
      
      <div 
        ref={menuRef}
        className={`mobile-menu__overlay ${isOpen ? 'mobile-menu__overlay--open' : ''}`}
        aria-hidden={!isOpen}
      >
        <button
          className="mobile-menu__close"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <span className="mobile-menu__close-icon">×</span>
        </button>
        
        <nav className="mobile-menu__nav">
          {/* Navigation Links */}
          {pillItems.map((item) => {
            const id = resolveSectionId(item.url, item.title);
            const label = item.title;
            
            return (
              <a 
                key={item.id} 
                href={`/#${id || ''}`} 
                className="mobile-menu__link" 
                onClick={(e) => handleItemClick(e, id)}
              >
                {label}
              </a>
            );
          })}
          
          {/* Settings Section */}
          <div className="mobile-menu__divider"></div>
          <div className="mobile-menu__section">
            <h3 className="mobile-menu__section-title">Settings</h3>
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
              onClick={openTerminal}
            >
              <span className="mobile-menu__action-icon">⌨️</span>
              <span className="mobile-menu__action-label">Terminal</span>
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
                <span className="mobile-menu__action-icon">{social.icon}</span>
                <span className="mobile-menu__action-label">{social.label}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
