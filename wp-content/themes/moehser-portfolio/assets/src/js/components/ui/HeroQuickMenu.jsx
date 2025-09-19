// Hero Quick Menu Component
// ========================

import React, { useEffect, useState } from 'react';

// Constants
// ---------
const SECTION_MAPPING = {
  HOME: 'hero',
  ABOUT: 'about',
  PROJECTS: 'projects',
  SKILLS: 'skills',
  TERMINAL: 'terminal'
};

const API_CONFIG = {
  BASE_ENDPOINT: '/wp-json/moehser/v1/menu/header_primary',
  LOCALIZED_ENDPOINT: '/de/wp-json/moehser/v1/menu/header_primary'
};

const MOBILE_BREAKPOINT = 1024; // pixels (includes tablets)

const CSS_CLASSES = {
  CONTAINER: 'hero__quick',
  BUTTON: 'hero__quick-btn'
};

const KEYWORDS = {
  TYPESCRIPT: 'typescript',
  ABOUT: ['about', 'über'],
  PROJECTS: ['project', 'projekt'],
  SKILLS: ['skill', 'fähigkeit'],
  HOME: ['home', 'start'],
  TERMINAL: ['terminal']
};

// Custom Hooks
// ------------
const useDarkModeDetection = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.body.classList.contains('theme-dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);
  
  return isDark;
};

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

const useWordPressMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  
  useEffect(() => {
    let cancelled = false;
    
    const loadMenuData = async () => {
      try {
        const isLocalized = window.location.pathname.includes('/de/');
        const apiUrl = isLocalized 
          ? API_CONFIG.LOCALIZED_ENDPOINT
          : API_CONFIG.BASE_ENDPOINT;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Menu API failed: ${response.status}`);
        }
        
        const data = await response.json();
        
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
  }, []);
  
  return menuItems;
};

export default function HeroQuickMenu() {
  // Use custom hooks for cleaner state management
  const menuItems = useWordPressMenu();
  const isDark = useDarkModeDetection();
  const isMobile = useMobileDetection();

  // Utility functions
  const resolveSectionId = (href, title) => {
    // Try URL-based resolution first
    try {
      const url = new URL(href, window.location.origin);
      if (url.hash) return url.hash.replace(/^#/, '');
      
      const pathSegment = (url.pathname || '')
        .replace(/^\/+|\/+$/g, '')
        .toLowerCase();
      
      if (pathSegment === '' || pathSegment === 'home') {
        return SECTION_MAPPING.HOME;
      }
      
      // Check path segments against keywords
      if (pathSegment.includes('about')) return SECTION_MAPPING.ABOUT;
      if (pathSegment.includes('project')) return SECTION_MAPPING.PROJECTS;
      if (pathSegment.includes('skill')) return SECTION_MAPPING.SKILLS;
    } catch {
      // URL parsing failed, continue to title-based fallback
    }
    
    // Fallback to title-based mapping with keyword arrays
    const titleLower = (title || '').toLowerCase();
    
    if (KEYWORDS.ABOUT.some(keyword => titleLower.includes(keyword))) {
      return SECTION_MAPPING.ABOUT;
    }
    if (KEYWORDS.PROJECTS.some(keyword => titleLower.includes(keyword))) {
      return SECTION_MAPPING.PROJECTS;
    }
    if (KEYWORDS.SKILLS.some(keyword => titleLower.includes(keyword))) {
      return SECTION_MAPPING.SKILLS;
    }
    if (KEYWORDS.HOME.some(keyword => titleLower.includes(keyword))) {
      return SECTION_MAPPING.HOME;
    }
    if (KEYWORDS.TERMINAL.some(keyword => titleLower.includes(keyword))) {
      return SECTION_MAPPING.TERMINAL;
    }
    
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
    
    // Update URL while preserving current path
    const currentPath = window.location.pathname;
    const newUrl = sectionId === SECTION_MAPPING.HOME 
      ? `${currentPath}#` 
      : `${currentPath}#${sectionId}`;
    window.history.replaceState(null, '', newUrl);
    
    // Notify other components about navigation
    try {
      window.dispatchEvent(new CustomEvent('nav:jump', { 
        detail: { id: sectionId } 
      }));
    } catch (error) {
      console.warn('Failed to dispatch nav:jump event:', error);
    }
  };

  const handleItemClick = (event, sectionId) => {
    if (!sectionId) return;
    
    event.preventDefault();
    scrollToSection(sectionId);
  };

  // Computed values
  const navigationItems = menuItems
    .filter(item => resolveSectionId(item.url, item.title) !== SECTION_MAPPING.TERMINAL)
    .filter(item => {
      // Hide TypeScript on mobile devices
      if (isMobile && item.title.toLowerCase().includes(KEYWORDS.TYPESCRIPT)) {
        return false;
      }
      return true;
    });

  return (
    <div className={CSS_CLASSES.CONTAINER}>
      {navigationItems.map((item) => {
        const sectionId = resolveSectionId(item.url, item.title);
        const currentPath = window.location.pathname;
        const href = `${currentPath}#${sectionId || ''}`;
        
        return (
          <a 
            key={item.id} 
            href={href} 
            className={CSS_CLASSES.BUTTON} 
            onClick={(event) => handleItemClick(event, sectionId)}
          >
            {item.title}
          </a>
        );
      })}
    </div>
  );
}
