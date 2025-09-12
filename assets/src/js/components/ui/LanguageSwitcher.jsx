// Language Switcher Component
// ===========================

// Language switching component for header/navigation
// -------------------------------------------------

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function LanguageSwitcher({ className = '' }) {
  const { isGerman, switchLanguage, loading } = useLanguage();

  if (loading) {
    return (
      <div className={`language-switcher ${className}`}>
        <div className="language-switcher__loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`language-switcher ${className}`}>
      <button
        onClick={switchLanguage}
        className="language-switcher__button"
        aria-label={isGerman ? 'Switch to English' : 'Auf Deutsch wechseln'}
        title={isGerman ? 'Switch to English' : 'Auf Deutsch wechseln'}
      >
        <span className="language-switcher__flag">
          {isGerman ? '🇬🇧' : '🇩🇪'}
        </span>
        <span className="language-switcher__text">
          {isGerman ? 'EN' : 'DE'}
        </span>
      </button>
    </div>
  );
}
