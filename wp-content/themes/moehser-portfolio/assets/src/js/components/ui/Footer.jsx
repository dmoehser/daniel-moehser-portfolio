// Footer Component
// ===============

import React, { useEffect, useState } from 'react';

// Constants
// =========

const API_ENDPOINTS = {
  FOOTER_MENU: {
    DEFAULT: '/wp-json/moehser/v1/menu/footer',
    LOCALIZED: '/de/wp-json/moehser/v1/menu/footer'
  }
};

const MENU_ITEM = {
  ID: 1,
  PARENT: 0
};

const ROUTES = {
  IMPRINT: {
    DEFAULT: '/imprint/',
    LOCALIZED: '/de/imprint/'
  }
};

const TEXTS = {
  IMPRINT: {
    EN: 'Imprint',
    DE: 'Impressum'
  }
};

const LANGUAGE_DETECTION = {
  GERMAN_PATH: '/de/',
  GERMAN_INDICATOR: 'Kontakt'
};

// Helper Functions
// ===============

const detectLanguage = () => {
  if (typeof window === 'undefined') return false;
  
  const hasGermanPath = window.location.pathname.includes(LANGUAGE_DETECTION.GERMAN_PATH);
  const hasGermanContent = document.querySelector('.imprint__content-text')?.innerHTML.includes(LANGUAGE_DETECTION.GERMAN_INDICATOR);
  
  return hasGermanPath || hasGermanContent;
};

const getApiUrl = (isLocalized) => {
  return isLocalized ? API_ENDPOINTS.FOOTER_MENU.LOCALIZED : API_ENDPOINTS.FOOTER_MENU.DEFAULT;
};

const createFallbackItem = (isGerman) => ({
  id: MENU_ITEM.ID,
  title: isGerman ? TEXTS.IMPRINT.DE : TEXTS.IMPRINT.EN,
  url: isGerman ? ROUTES.IMPRINT.LOCALIZED : ROUTES.IMPRINT.DEFAULT,
  parent: MENU_ITEM.PARENT
});

const filterMenuItems = (data) => {
  return Array.isArray(data) ? data.filter(item => !item.parent) : [];
};

const handleMenuItemClick = (e, url) => {
  e.preventDefault();
  window.location.href = url;
};

export default function Footer({ show = false }) {
  const [footerMenuItems, setFooterMenuItems] = useState([]);
  const isGerman = detectLanguage();

  // Load WordPress footer menu
  useEffect(() => {
    let cancelled = false;
    
    async function loadFooterMenu() {
      try {
        const isLocalized = window.location.pathname.includes(LANGUAGE_DETECTION.GERMAN_PATH);
        const apiUrl = getApiUrl(isLocalized);
        
        const res = await fetch(apiUrl);
        if (!res.ok) {
          if (!cancelled) {
            setFooterMenuItems([createFallbackItem(isGerman)]);
          }
          return;
        }
        
        const data = await res.json();
        
        if (!cancelled) {
          const filteredItems = filterMenuItems(data);
          setFooterMenuItems(filteredItems);
        }
      } catch (error) {
        if (!cancelled) {
          setFooterMenuItems([createFallbackItem(isGerman)]);
        }
      }
    }
    
    loadFooterMenu();
    return () => { cancelled = true; };
  }, [isGerman]);

  // Get display items with fallback
  const displayItems = footerMenuItems.length > 0 ? footerMenuItems : [createFallbackItem(isGerman)];

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
