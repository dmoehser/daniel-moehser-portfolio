// Social Dock Component
// ====================

// Quick contact links with social media integration
// ------------------------------

import React from 'react';

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
    href: () => `mailto:${window.__SOCIAL_EMAIL__ || ''}`,
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
  // Generate icon URL helper function
  const getIconUrl = (iconName) => {
    return new URL(`../../../img/${iconName}`, import.meta.url).toString();
  };

  return (
    <ul className="social-dock" aria-label="Quick contacts">
      {SOCIAL_LINKS.map((social) => (
        <li key={social.type}>
          <a 
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
        </li>
      ))}
    </ul>
  );
}
