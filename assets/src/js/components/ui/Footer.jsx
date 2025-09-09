// Footer Component
// ===============

// Elegant footer with imprint link and WordPress menu integration
// ------------------------------

import React, { useEffect, useState } from 'react';

export default function Footer() {
  const [footerMenuItems, setFooterMenuItems] = useState([]);
  const [isInProjectsSection, setIsInProjectsSection] = useState(false);

  // Load WordPress footer menu
  useEffect(() => {
    let cancelled = false;
    
    async function loadFooterMenu() {
      try {
        // Use wp_nav_menu_objects() via custom endpoint
        const res = await fetch('/wp-json/moehser/v1/menu/footer');
        if (!res.ok) {
          // Fallback: try to get menu by location
          const fallbackRes = await fetch('/wp-json/wp/v2/menus?per_page=100');
          if (fallbackRes.ok) {
            const menus = await fallbackRes.json();
            const footerMenu = menus.find(menu => 
              menu.locations && menu.locations.includes('footer')
            );
            
            if (footerMenu) {
              console.log('Footer menu found via fallback:', footerMenu);
              // Create a simple menu item for testing
              const testItem = {
                id: 1,
                title: 'Imprint',
                url: '/imprint/',
                parent: 0
              };
              if (!cancelled) {
                setFooterMenuItems([testItem]);
              }
            }
          }
          return;
        }
        
        const data = await res.json();
        console.log('Footer menu data:', data);
        
        if (!cancelled) {
          const filteredItems = Array.isArray(data) 
            ? data.filter(item => !item.parent) 
            : [];
          console.log('Filtered footer items:', filteredItems);
          setFooterMenuItems(filteredItems);
        }
      } catch (error) {
        console.log('Footer menu error, using fallback:', error);
        // Fallback: create a simple imprint link
        if (!cancelled) {
          const fallbackItem = {
            id: 1,
            title: 'Imprint',
            url: '/imprint/',
            parent: 0
          };
          setFooterMenuItems([fallbackItem]);
        }
      }
    }
    
    loadFooterMenu();
    return () => { cancelled = true; };
  }, []);


  // Check if we're in the Projects section
  useEffect(() => {
    const checkProjectsSection = () => {
      const projectsSection = document.getElementById('projects');
      if (!projectsSection) {
        console.log('Projects section not found');
        setIsInProjectsSection(false);
        return;
      }
      
      const rect = projectsSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Show footer only when Projects section is significantly visible
      // (at least 50% of the section should be in viewport)
      const sectionHeight = rect.bottom - rect.top;
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const isVisible = visibleHeight > (sectionHeight * 0.5);
      
      console.log('Footer visibility check:', {
        projectsTop: rect.top,
        projectsBottom: rect.bottom,
        windowHeight,
        sectionHeight,
        visibleHeight,
        isVisible
      });
      
      setIsInProjectsSection(isVisible);
    };
    
    // Check on scroll and resize
    window.addEventListener('scroll', checkProjectsSection);
    window.addEventListener('resize', checkProjectsSection);
    checkProjectsSection(); // Initial check
    
    return () => {
      window.removeEventListener('scroll', checkProjectsSection);
      window.removeEventListener('resize', checkProjectsSection);
    };
  }, []);

  // Handle menu item click
  const handleMenuItemClick = (e, url) => {
    e.preventDefault();
    window.location.href = url;
  };

  // Don't render footer if not in Projects section
  if (!isInProjectsSection) {
    return null;
  }
  
  // Always show footer in Projects section, even without menu items
  // (fallback will provide at least an Imprint link)

  return (
    <footer className="site-footer" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'red',
      color: 'white',
      padding: '20px',
      zIndex: 9999,
      fontSize: '18px',
      fontWeight: 'bold'
    }}>
      <div className="site-footer__inner">
        <div className="site-footer__content">
          <div className="site-footer__brand">
            <span className="site-footer__brand-text">
              Daniel Moehser - FOOTER IST DA! 🎉
            </span>
          </div>
          
          <nav className="site-footer__nav">
            {footerMenuItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                className="site-footer__link"
                onClick={(e) => handleMenuItemClick(e, item.url)}
                style={{ color: 'white', marginLeft: '20px' }}
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
