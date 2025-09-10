// Social Dock Component
// ====================

// Quick contact links with social media integration
// ------------------------------

import React, { useState, useEffect, useRef } from 'react';
import { getMailtoUrl } from '../../utils/emailHelper.js';

// Icon dimensions and social media configuration
// ------------------------------
const ICON_DIMENSIONS = {
  WIDTH: 20,
  HEIGHT: 20
};

// Social media data structure
// ------------------------------
const SOCIAL_LINKS = [
  {
    type: 'email',
    label: 'Email',
    href: () => getMailtoUrl(),
    icon: 'email.svg',
    className: 'social social--mail'
  },
  {
    type: 'github',
    label: 'GitHub',
    href: () => typeof window !== 'undefined' && window.__SOCIAL_GITHUB__ 
      ? window.__SOCIAL_GITHUB__ 
      : 'https://github.com/',
    icon: 'github.svg',
    className: 'social social--gh',
    external: true
  },
  {
    type: 'linkedin',
    label: 'LinkedIn',
    href: () => typeof window !== 'undefined' && window.__SOCIAL_LINKEDIN__ 
      ? window.__SOCIAL_LINKEDIN__ 
      : 'https://linkedin.com/',
    icon: 'linkedin.svg',
    className: 'social social--li',
    external: true
  }
];

export default function SocialDock() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dockRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle outside clicks to collapse
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dockRef.current && !dockRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  // Generate icon URL helper function
  const getIconUrl = (iconName) => {
    return new URL(`../../../img/${iconName}`, import.meta.url).toString();
  };

  // Toggle expand/collapse on mobile
  const toggleExpanded = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div 
      ref={dockRef}
      className={`social-dock ${isMobile ? 'social-dock--mobile' : ''} ${isExpanded ? 'social-dock--expanded' : ''}`}
      aria-label="Quick contacts"
    >
      {isMobile ? (
        // Mobile: Collapsible version
        <>
          <button
            className="social-dock__toggle"
            onClick={toggleExpanded}
            aria-label={isExpanded ? 'Close social links' : 'Open social links'}
            aria-expanded={isExpanded}
          >
            <img 
              src={getIconUrl('email.svg')} 
              alt="Social links" 
              width={ICON_DIMENSIONS.WIDTH} 
              height={ICON_DIMENSIONS.HEIGHT} 
            />
          </button>
          
          {isExpanded && (
            <div className="social-dock__links">
              {SOCIAL_LINKS.map((social) => (
                <a 
                  key={social.type}
                  href={social.href()} 
                  className={social.className}
                  aria-label={social.label}
                  {...(social.external && {
                    target: "_blank",
                    rel: "noreferrer"
                  })}
                >
                  <img 
                    src={getIconUrl(social.icon)} 
                    alt={social.label} 
                    width={ICON_DIMENSIONS.WIDTH} 
                    height={ICON_DIMENSIONS.HEIGHT} 
                  />
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        // Desktop: Original vertical layout
        SOCIAL_LINKS.map((social) => (
          <a 
            key={social.type}
            href={social.href()} 
            className={social.className}
            aria-label={social.label}
            {...(social.external && {
              target: "_blank",
              rel: "noreferrer"
            })}
          >
            <img 
              src={getIconUrl(social.icon)} 
              alt={social.label} 
              width={ICON_DIMENSIONS.WIDTH} 
              height={ICON_DIMENSIONS.HEIGHT} 
            />
          </a>
        ))
      )}
    </div>
  );
}
