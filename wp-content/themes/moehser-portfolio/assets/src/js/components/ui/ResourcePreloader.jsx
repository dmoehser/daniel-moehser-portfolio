// Resource Preloader Component
// ===========================

// Preload critical resources for faster loading
// ------------------------------

import React, { useEffect } from 'react';

// Critical resources configuration
// ------------------------------
const CRITICAL_RESOURCES = {
  // Fonts - already preloaded in header.php
  fonts: [],
  
  // Critical images - above the fold
  images: [],
  
  // Critical CSS - already preloaded in header.php
  css: [],
  
  // JavaScript - already preloaded in header.php
  scripts: [],
  
  // API endpoints - preconnect already in header.php
  connections: []
};

// Resource preloader hook
// ----------------------
const useResourcePreloader = () => {
  useEffect(() => {
    // Preload critical fonts
    CRITICAL_RESOURCES.fonts.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      link.type = resource.type;
      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }
      if (resource.priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
    });

    // Preload critical images
    CRITICAL_RESOURCES.images.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      link.type = resource.type;
      if (resource.priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
    });

    // Preload critical CSS
    CRITICAL_RESOURCES.css.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      link.type = resource.type;
      if (resource.priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
    });

    // Preload critical scripts
    CRITICAL_RESOURCES.scripts.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      link.type = resource.type;
      if (resource.priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);
    });

    // Preconnect to external domains
    CRITICAL_RESOURCES.connections.forEach(resource => {
      const link = document.createElement('link');
      link.rel = resource.rel;
      link.href = resource.href;
      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }
      document.head.appendChild(link);
    });

    // Preload critical project images (first 3 projects)
    const preloadProjectImages = async () => {
      try {
        // Fetch projects data
        const response = await fetch('/wp-json/moehser/v1/projects?per_page=3&_fields=id,title,project_screenshot,featured_image_wide');

        if (response.ok) {
          const projects = await response.json();
          
          projects.forEach(project => {
            const imageUrl = project.project_screenshot || project.featured_image_wide;
            if (imageUrl) {
              const link = document.createElement('link');
              link.rel = 'preload';
              link.href = imageUrl;
              link.as = 'image';
              link.type = 'image/jpeg';
              link.setAttribute('fetchpriority', 'low');
              document.head.appendChild(link);
            }
          });
        }
      } catch (error) {
        console.warn('Failed to preload project images:', error);
      }
    };

    // Preload project images after a short delay
    setTimeout(preloadProjectImages, 1000);

  }, []);
};

// Resource preloader component
// ---------------------------
export default function ResourcePreloader() {
  useResourcePreloader();
  
  // This component doesn't render anything
  return null;
}

// Export the hook for use in other components
export { useResourcePreloader, CRITICAL_RESOURCES };
