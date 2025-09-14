// Language Detection Hook
// ======================

import { useState, useEffect } from 'react';

export function useLanguage() {
  const [language, setLanguage] = useState('en');
  const [isGerman, setIsGerman] = useState(false);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Detect language from URL path
    const detectLanguage = () => {
      const path = window.location.pathname;
      const isGermanPath = path.includes('/de/');
      
      setLanguage(isGermanPath ? 'de' : 'en');
      setIsGerman(isGermanPath);
    };

    detectLanguage();

    // Load language-specific content
    const loadContent = async () => {
      try {
        setLoading(true);
        const response = await fetch('/wp-json/moehser/v1/content');
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Failed to load language content:', error);
        // Fallback to window variables
        setContent({
          language: isGerman ? 'de' : 'en',
          about: {
            title: window.__ABOUT_TITLE__ || (isGerman ? 'Über mich' : 'About Me'),
            subtitle: window.__ABOUT_SUBTITLE__ || (isGerman ? 'Meine Geschichte & Erfahrung' : 'My story & experience')
          },
          projects: {
            title: window.__PROJECTS_TITLE__ || (isGerman ? 'Projekte' : 'Projects'),
            subtitle: window.__PROJECTS_SUBTITLE__ || (isGerman ? 'Meine neuesten Arbeiten und Projekte' : 'My latest work and projects')
          },
          skills: {
            title: window.__SKILLS_TITLE__ || (isGerman ? 'Fähigkeiten' : 'Skills'),
            subtitle: window.__SKILLS_SUBTITLE__ || (isGerman ? 'Technologien & Tools mit denen ich arbeite' : 'Technologies & tools I work with')
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [isGerman]);

  // Get language-specific text
  const t = (key, fallback = '') => {
    if (!content) return fallback;
    
    const keys = key.split('.');
    let value = content;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback;
      }
    }
    
    return value || fallback;
  };

  // Get switch URL for language toggle
  const getSwitchUrl = () => {
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    const currentSearch = window.location.search;
    
    if (isGerman) {
      // Switch from localized to main site
      const newPath = currentPath.replace('/de', '') || '/';
      return `${window.location.origin}${newPath}${currentSearch}${currentHash}`;
    } else {
      // Switch from main to localized site
      const newPath = currentPath === '/' ? '/de/' : currentPath.replace('/', '/de/');
      return `${window.location.origin}${newPath}${currentSearch}${currentHash}`;
    }
  };

  // Switch language (no cookies, direct redirect)
  const switchLanguage = () => {
    // Save user's manual language preference to localStorage
    const newLanguage = isGerman ? 'en' : 'de';
    localStorage.setItem('user_language_preference', newLanguage);
    
    const switchUrl = getSwitchUrl();
    window.location.href = switchUrl;
  };

  return {
    language,
    isGerman,
    content,
    loading,
    t,
    getSwitchUrl,
    switchLanguage
  };
}
