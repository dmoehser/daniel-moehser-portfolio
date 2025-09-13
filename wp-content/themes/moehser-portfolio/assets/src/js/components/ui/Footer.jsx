// Footer Component
// ===============

import React, { useEffect, useState } from 'react';

export default function Footer({ show = false }) {
  const [footerMenuItems, setFooterMenuItems] = useState([]);

  // Detect language
  const isGerman = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/de/') || 
     document.querySelector('.imprint__content-text')?.innerHTML.includes('Kontakt'));

  // Load WordPress footer menu
  useEffect(() => {
    let cancelled = false;
    
    async function loadFooterMenu() {
      try {
        // Use different API URLs for different languages (like header)
        const isLocalized = window.location.pathname.includes('/de/');
        const apiUrl = isLocalized 
          ? '/de/wp-json/moehser/v1/menu/footer'
          : '/wp-json/moehser/v1/menu/footer';
        
        
        const res = await fetch(apiUrl);
        if (!res.ok) {
          // Fallback: create language-specific imprint link
          if (!cancelled) {
            const fallbackItem = {
              id: 1,
              title: isGerman ? 'Impressum' : 'Imprint',
              url: isGerman ? '/de/imprint/' : '/imprint/',
              parent: 0
            };
            setFooterMenuItems([fallbackItem]);
          }
          return;
        }
        
        const data = await res.json();
        
        if (!cancelled) {
          const filteredItems = Array.isArray(data) 
            ? data.filter(item => !item.parent) 
            : [];
          setFooterMenuItems(filteredItems);
        }
      } catch (error) {
        // Fallback: create language-specific imprint link
        if (!cancelled) {
          const fallbackItem = {
            id: 1,
            title: isGerman ? 'Impressum' : 'Imprint',
            url: isGerman ? '/de/imprint/' : '/imprint/',
            parent: 0
          };
          setFooterMenuItems([fallbackItem]);
        }
      }
    }
    
    loadFooterMenu();
    return () => { cancelled = true; };
  }, [isGerman]);


  // Handle menu item click
  const handleMenuItemClick = (e, url) => {
    e.preventDefault();
    window.location.href = url;
  };

  // Always render footer - simple and clean

  // Get fallback items if no menu items are loaded
  const displayItems = footerMenuItems.length > 0 ? footerMenuItems : [{
    id: 1,
    title: isGerman ? 'Impressum' : 'Imprint',
    url: isGerman ? '/de/imprint/' : '/imprint/',
    parent: 0
  }];

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__content">
          <nav className="site-footer__nav">
            {displayItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                className="site-footer__link"
                onClick={(e) => handleMenuItemClick(e, item.url)}
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
