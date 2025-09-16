// Resource Preloader Component
// ===========================

import React, { useEffect } from 'react';

// Constants
// ---------
const PRELOAD_CONFIG = {
  PROJECT_IMAGES_COUNT: 3,
  PROJECT_IMAGES_DELAY: 1000, // milliseconds
  FALLBACK_IMAGE_TYPE: 'image/jpeg'
};

const API_ENDPOINTS = {
  PROJECTS_PREVIEW: '/wp-json/moehser/v1/projects?per_page=3&_fields=id,title,project_screenshot,featured_image_wide'
};

const PRIORITY_LEVELS = {
  HIGH: 'high',
  LOW: 'low'
};

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

// Utility functions
// -----------------
const createPreloadLink = (resource) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = resource.href;
  link.as = resource.as;
  link.type = resource.type;
  
  if (resource.crossorigin) {
    link.crossOrigin = resource.crossorigin;
  }
  
  if (resource.priority === PRIORITY_LEVELS.HIGH) {
    link.setAttribute('fetchpriority', PRIORITY_LEVELS.HIGH);
  }
  
  return link;
};

const createConnectionLink = (resource) => {
  const link = document.createElement('link');
  link.rel = resource.rel;
  link.href = resource.href;
  
  if (resource.crossorigin) {
    link.crossOrigin = resource.crossorigin;
  }
  
  return link;
};

const preloadResources = (resources) => {
  resources.forEach(resource => {
    const link = createPreloadLink(resource);
    document.head.appendChild(link);
  });
};

const preloadConnections = (connections) => {
  connections.forEach(resource => {
    const link = createConnectionLink(resource);
    document.head.appendChild(link);
  });
};

// Resource preloader hook
// ----------------------
const useResourcePreloader = () => {
  useEffect(() => {
    // Preload all critical resource types
    preloadResources(CRITICAL_RESOURCES.fonts);
    preloadResources(CRITICAL_RESOURCES.images);
    preloadResources(CRITICAL_RESOURCES.css);
    preloadResources(CRITICAL_RESOURCES.scripts);
    
    // Handle connections separately (different link type)
    preloadConnections(CRITICAL_RESOURCES.connections);

    // Preload critical project images with delay
    const preloadProjectImages = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PROJECTS_PREVIEW);

        if (!response.ok) {
          throw new Error(`Projects API failed: ${response.status}`);
        }
        
        const projects = await response.json();
        
        if (Array.isArray(projects)) {
          projects.forEach(project => {
            const imageUrl = project.project_screenshot || project.featured_image_wide;
            if (imageUrl) {
              const imageLink = createPreloadLink({
                href: imageUrl,
                as: 'image',
                type: PRELOAD_CONFIG.FALLBACK_IMAGE_TYPE,
                priority: PRIORITY_LEVELS.LOW
              });
              document.head.appendChild(imageLink);
            }
          });
        }
      } catch (error) {
        console.warn('Failed to preload project images:', error);
      }
    };

    // Preload project images after delay for better initial page performance
    setTimeout(preloadProjectImages, PRELOAD_CONFIG.PROJECT_IMAGES_DELAY);

  }, []);
};

// Main component
// --------------
export default function ResourcePreloader() {
  useResourcePreloader();
  
  // This component doesn't render anything
  return null;
}

// Exports for external usage
// --------------------------
export { 
  useResourcePreloader, 
  CRITICAL_RESOURCES,
  PRELOAD_CONFIG 
};
