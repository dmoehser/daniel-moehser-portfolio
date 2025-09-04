// Hero Quick Menu Component
// ========================

// Top-right navigation pills with WordPress menu integration
// ------------------------------

import React, { useEffect, useState } from 'react';

// Section mapping constants
// ------------------------------
const SECTION_MAPPING = {
  HOME: 'hero',
  ABOUT: 'about',
  PROJECTS: 'projects',
  SKILLS: 'skills',
  TERMINAL: 'terminal'
};

export default function HeroQuickMenu() {
  const [menuItems, setMenuItems] = useState([]);

  // Load WordPress menu for quick navigation pills
  useEffect(() => {
    let cancelled = false;
    
    async function loadMenu() {
      try {
        // Primary API endpoint
        let res = await fetch('/wp-json/moehser/v1/menu/header_primary');
        let data;
        const contentType = res.headers.get('content-type') || '';
        
        if (res.ok && contentType.includes('application/json')) {
          data = await res.json();
        } else {
          // Fallback endpoint
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
    
    // Fallback to title-based mapping
    const titleLower = (title || '').toLowerCase();
    if (titleLower.includes('about')) return SECTION_MAPPING.ABOUT;
    if (titleLower.includes('project')) return SECTION_MAPPING.PROJECTS;
    if (titleLower.includes('skill')) return SECTION_MAPPING.SKILLS;
    if (titleLower.includes('home')) return SECTION_MAPPING.HOME;
    if (titleLower.includes('terminal')) return SECTION_MAPPING.TERMINAL;
    
    return null;
  };

  // Scroll to section with smooth behavior
  const scrollTo = (id) => {
    const container = document.getElementById('content-scroll');
    if (!container) return;
    
    const target = id === SECTION_MAPPING.HOME 
      ? document.querySelector('section.hero') 
      : document.getElementById(id);
    
    if (!target) return;
    
    // Use same scroll behavior as arrow keys
    // Calculate exact position for scroll-snap
    const targetTop = target.offsetTop;
    container.scrollTo({ 
      top: targetTop, 
      behavior: 'smooth' 
    });
    
    // Update URL without try-catch (not critical)
    const url = id === SECTION_MAPPING.HOME ? '/#' : `/#${id}`;
    window.history.replaceState(null, '', url);
    
    // Notify global listeners (e.g., ScrollArrow) about jump target
    try {
      window.dispatchEvent(new CustomEvent('nav:jump', { 
        detail: { id } 
      }));
    } catch {}
  };

  // Handle navigation item click
  const handleItemClick = (e, id) => {
    if (!id) return;
    e.preventDefault();
    scrollTo(id);
  };

  // Filter out terminal items (rendered separately)
  const pillItems = menuItems.filter((item) => 
    resolveSectionId(item.url, item.title) !== SECTION_MAPPING.TERMINAL
  );

  return (
    <div className="hero__quick">
      {pillItems.map((item) => {
        const id = resolveSectionId(item.url, item.title);
        const label = item.title;
        
        return (
          <a 
            key={item.id} 
            href={`/#${id || ''}`} 
            className="hero__quick-btn" 
            onClick={(e) => handleItemClick(e, id)}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
