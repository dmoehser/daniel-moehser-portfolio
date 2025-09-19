// Social Dock Component
// ====================

import React, { useState, useEffect, useRef } from 'react';
import { getMailtoUrl } from '../../utils/emailHelper.js';

// Icon imports
// ------------
import emailIcon from '../../../img/email.svg';
import githubIcon from '../../../img/github.svg';
import linkedinIcon from '../../../img/linkedin.svg';

// Constants
// ---------
const BREAKPOINT_CONFIG = {
  MOBILE_MAX_WIDTH: 768 // pixels
};

const ICON_CONFIG = {
  DIMENSIONS: {
    WIDTH: 20,
    HEIGHT: 20
  },
  SOURCES: {
    EMAIL: emailIcon,
    GITHUB: githubIcon,
    LINKEDIN: linkedinIcon
  }
};

const CSS_CLASSES = {
  CONTAINER: 'social-dock',
  MOBILE: 'social-dock--mobile',
  EXPANDED: 'social-dock--expanded',
  TOGGLE: 'social-dock__toggle',
  LINKS: 'social-dock__links',
  SOCIAL_BASE: 'social',
  SOCIAL_MAIL: 'social social--mail',
  SOCIAL_GITHUB: 'social social--gh',
  SOCIAL_LINKEDIN: 'social social--li'
};

const FALLBACK_URLS = {
  GITHUB: 'https://github.com/',
  LINKEDIN: 'https://linkedin.com/'
};

const GLOBAL_VARS = {
  GITHUB: '__SOCIAL_GITHUB__',
  LINKEDIN: '__SOCIAL_LINKEDIN__'
};

const EVENT_OPTIONS = {
  RESIZE: { passive: true },
  MOUSE_DOWN: { passive: true }
};

const ACCESSIBILITY_LABELS = {
  DOCK: 'Quick contacts',
  TOGGLE_OPEN: 'Open social links',
  TOGGLE_CLOSE: 'Close social links',
  TOGGLE_ALT: 'Social links',
  EMAIL: 'Send email to Daniel Moehser',
  GITHUB: 'Visit Daniel Moehser GitHub profile - opens in new tab',
  LINKEDIN: 'Visit Daniel Moehser LinkedIn profile - opens in new tab'
};

// Social media configuration
// --------------------------
const SOCIAL_LINKS = [
  {
    type: 'email',
    label: 'Send email',
    ariaLabel: ACCESSIBILITY_LABELS.EMAIL,
    href: () => getMailtoUrl(),
    icon: ICON_CONFIG.SOURCES.EMAIL,
    className: CSS_CLASSES.SOCIAL_MAIL
  },
  {
    type: 'github',
    label: 'GitHub',
    ariaLabel: ACCESSIBILITY_LABELS.GITHUB,
    href: () => typeof window !== 'undefined' && window[GLOBAL_VARS.GITHUB] 
      ? window[GLOBAL_VARS.GITHUB] 
      : FALLBACK_URLS.GITHUB,
    icon: ICON_CONFIG.SOURCES.GITHUB,
    className: CSS_CLASSES.SOCIAL_GITHUB,
    external: true
  },
  {
    type: 'linkedin',
    label: 'LinkedIn',
    ariaLabel: ACCESSIBILITY_LABELS.LINKEDIN,
    href: () => typeof window !== 'undefined' && window[GLOBAL_VARS.LINKEDIN] 
      ? window[GLOBAL_VARS.LINKEDIN] 
      : FALLBACK_URLS.LINKEDIN,
    icon: ICON_CONFIG.SOURCES.LINKEDIN,
    className: CSS_CLASSES.SOCIAL_LINKEDIN,
    external: true
  }
];

export default function SocialDock() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dockRef = useRef(null);

  // Utility functions
  // -----------------
  const checkMobileBreakpoint = () => {
    return window.matchMedia(`(max-width: ${BREAKPOINT_CONFIG.MOBILE_MAX_WIDTH}px)`).matches;
  };

  const getIconSource = (iconSource) => {
    return iconSource;
  };

  const isClickOutsideDock = (event) => {
    return dockRef.current && !dockRef.current.contains(event.target);
  };

  const getContainerClasses = () => {
    const classes = [CSS_CLASSES.CONTAINER];
    
    if (isMobile) {
      classes.push(CSS_CLASSES.MOBILE);
    }
    
    if (isExpanded) {
      classes.push(CSS_CLASSES.EXPANDED);
    }
    
    return classes.join(' ');
  };

  const getToggleAriaLabel = () => {
    return isExpanded ? ACCESSIBILITY_LABELS.TOGGLE_CLOSE : ACCESSIBILITY_LABELS.TOGGLE_OPEN;
  };

  const getSocialLinkProps = (social) => {
    const props = {
      href: social.href(),
      className: social.className,
      'aria-label': social.ariaLabel
    };

    if (social.external) {
      props.target = "_blank";
      props.rel = "noreferrer";
    }

    return props;
  };

  const getIconProps = (iconSource, altText = "") => {
    return {
      src: getIconSource(iconSource),
      alt: altText,
      role: altText ? undefined : "presentation",
      width: ICON_CONFIG.DIMENSIONS.WIDTH,
      height: ICON_CONFIG.DIMENSIONS.HEIGHT
    };
  };

  // Event handlers
  // --------------
  const handleMobileCheck = () => {
    setIsMobile(checkMobileBreakpoint());
  };

  const handleClickOutside = (event) => {
    if (isClickOutsideDock(event)) {
      setIsExpanded(false);
    }
  };

  const handleToggleExpanded = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  // Mobile detection effect
  // -----------------------
  useEffect(() => {
    handleMobileCheck();
    window.addEventListener('resize', handleMobileCheck, EVENT_OPTIONS.RESIZE);
    return () => window.removeEventListener('resize', handleMobileCheck);
  }, []);

  // Outside click handling effect
  // -----------------------------
  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside, EVENT_OPTIONS.MOUSE_DOWN);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  return (
    <div 
      ref={dockRef}
      className={getContainerClasses()}
      aria-label={ACCESSIBILITY_LABELS.DOCK}
    >
      {isMobile ? (
        // Mobile: Collapsible version
        <>
          <button
            className={CSS_CLASSES.TOGGLE}
            onClick={handleToggleExpanded}
            aria-label={getToggleAriaLabel()}
            aria-expanded={isExpanded}
          >
            <img {...getIconProps(ICON_CONFIG.SOURCES.EMAIL, ACCESSIBILITY_LABELS.TOGGLE_ALT)} />
          </button>
          
          {isExpanded && (
            <div className={CSS_CLASSES.LINKS}>
              {SOCIAL_LINKS.map((social) => (
                <a key={social.type} {...getSocialLinkProps(social)}>
                  <img {...getIconProps(social.icon)} />
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        // Desktop: Original vertical layout
        SOCIAL_LINKS.map((social) => (
          <a key={social.type} {...getSocialLinkProps(social)}>
            <img {...getIconProps(social.icon)} />
          </a>
        ))
      )}
    </div>
  );
}
