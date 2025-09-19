// Language Detection Hook
// ======================

import { useState, useEffect } from 'react';

// Constants
// ---------
const LANGUAGE_CONFIG = {
  DEFAULT_LANGUAGE: 'en',
  GERMAN_CODE: 'de',
  GERMAN_PATH_PATTERN: '/de/',
  STORAGE_KEY: 'user_language_preference'
};

const API_CONFIG = {
  ENDPOINT: '/wp-json/moehser/v1/content',
  TIMEOUT: 5000 // milliseconds
};

const FALLBACK_CONTENT = {
  GERMAN: {
    ABOUT_TITLE: 'Über mich',
    ABOUT_SUBTITLE: 'Meine Geschichte & Erfahrung',
    PROJECTS_TITLE: 'Projekte', 
    PROJECTS_SUBTITLE: 'Meine neuesten Arbeiten und Projekte',
    SKILLS_TITLE: 'Fähigkeiten',
    SKILLS_SUBTITLE: 'Technologien & Tools mit denen ich arbeite'
  },
  ENGLISH: {
    ABOUT_TITLE: 'About Me',
    ABOUT_SUBTITLE: 'My story & experience',
    PROJECTS_TITLE: 'Projects',
    PROJECTS_SUBTITLE: 'My latest work and projects', 
    SKILLS_TITLE: 'Skills',
    SKILLS_SUBTITLE: 'Technologies & tools I work with'
  }
};

const GLOBAL_VARS = {
  ABOUT_TITLE: '__ABOUT_TITLE__',
  ABOUT_SUBTITLE: '__ABOUT_SUBTITLE__',
  PROJECTS_TITLE: '__PROJECTS_TITLE__',
  PROJECTS_SUBTITLE: '__PROJECTS_SUBTITLE__',
  SKILLS_TITLE: '__SKILLS_TITLE__',
  SKILLS_SUBTITLE: '__SKILLS_SUBTITLE__'
};

// Utility functions
// -----------------
const isServerSideRendering = () => {
  return typeof window === 'undefined';
};

const detectLanguageFromPath = () => {
  if (isServerSideRendering()) return { language: LANGUAGE_CONFIG.DEFAULT_LANGUAGE, isGerman: false };
  
  const path = window.location.pathname;
  const isGermanPath = path.includes(LANGUAGE_CONFIG.GERMAN_PATH_PATTERN);
  
  
  return {
    language: isGermanPath ? LANGUAGE_CONFIG.GERMAN_CODE : LANGUAGE_CONFIG.DEFAULT_LANGUAGE,
    isGerman: isGermanPath
  };
};

const getGlobalVariable = (varName, fallback = '') => {
  if (isServerSideRendering()) return fallback;
  return window[varName] || fallback;
};

const createFallbackContent = (isGerman) => {
  const fallback = isGerman ? FALLBACK_CONTENT.GERMAN : FALLBACK_CONTENT.ENGLISH;
  
  return {
    language: isGerman ? LANGUAGE_CONFIG.GERMAN_CODE : LANGUAGE_CONFIG.DEFAULT_LANGUAGE,
    about: {
      title: getGlobalVariable(GLOBAL_VARS.ABOUT_TITLE, fallback.ABOUT_TITLE),
      subtitle: getGlobalVariable(GLOBAL_VARS.ABOUT_SUBTITLE, fallback.ABOUT_SUBTITLE)
    },
    projects: {
      title: getGlobalVariable(GLOBAL_VARS.PROJECTS_TITLE, fallback.PROJECTS_TITLE),
      subtitle: getGlobalVariable(GLOBAL_VARS.PROJECTS_SUBTITLE, fallback.PROJECTS_SUBTITLE)
    },
    skills: {
      title: getGlobalVariable(GLOBAL_VARS.SKILLS_TITLE, fallback.SKILLS_TITLE),
      subtitle: getGlobalVariable(GLOBAL_VARS.SKILLS_SUBTITLE, fallback.SKILLS_SUBTITLE)
    }
  };
};

// Custom Hook
// -----------
export function useLanguage() {
  // Initialize with detected language immediately
  const initialDetection = detectLanguageFromPath();
  const [language, setLanguage] = useState(initialDetection.language);
  const [isGerman, setIsGerman] = useState(initialDetection.isGerman);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Content loading with improved error handling
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        
        const response = await fetch(API_CONFIG.ENDPOINT, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Failed to load language content:', error.message);
        // Use fallback content with global variables
        setContent(createFallbackContent(isGerman));
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [isGerman]);

  // Translation function with dot notation support
  const getTranslation = (key, fallback = '') => {
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

  // URL generation utilities
  const generateLanguageSwitchUrl = () => {
    if (isServerSideRendering()) return '#';
    
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    const currentSearch = window.location.search;
    const origin = window.location.origin;
    
    if (isGerman) {
      // Switch from German to English
      const newPath = currentPath.replace(LANGUAGE_CONFIG.GERMAN_PATH_PATTERN, '/') || '/';
      return `${origin}${newPath}${currentSearch}${currentHash}`;
    } else {
      // Switch from English to German
      const newPath = currentPath === '/' ? 
        LANGUAGE_CONFIG.GERMAN_PATH_PATTERN : 
        currentPath.replace('/', LANGUAGE_CONFIG.GERMAN_PATH_PATTERN);
      return `${origin}${newPath}${currentSearch}${currentHash}`;
    }
  };

  const performLanguageSwitch = () => {
    if (isServerSideRendering()) return;
    
    const newLanguage = isGerman ? LANGUAGE_CONFIG.DEFAULT_LANGUAGE : LANGUAGE_CONFIG.GERMAN_CODE;
    
    try {
      localStorage.setItem(LANGUAGE_CONFIG.STORAGE_KEY, newLanguage);
    } catch (error) {
      console.warn('Failed to save language preference:', error.message);
    }
    
    const switchUrl = generateLanguageSwitchUrl();
    window.location.href = switchUrl;
  };

  // Public API
  return {
    language,
    isGerman,
    content,
    loading,
    t: getTranslation,                    // Translation function (public API)
    getSwitchUrl: generateLanguageSwitchUrl, // URL generator (public API)  
    switchLanguage: performLanguageSwitch    // Language switcher (public API)
  };
}
