// Email Helper Utilities
// =====================

// Global email helper functions for consistent email handling
// across all components (Terminal, SocialDock, MobileMenu, etc.)
// ------------------------------

/**
 * Get email address from WordPress Customizer
 * @returns {string} Email address or empty string
 */
export const getEmail = () => {
  if (typeof window !== 'undefined' && window.__SOCIAL_EMAIL__) {
    return window.__SOCIAL_EMAIL__;
  }
  return '';
};

/**
 * Get email subject from WordPress Customizer
 * @returns {string} Email subject or empty string
 */
export const getEmailSubject = () => {
  if (typeof window !== 'undefined' && window.__EMAIL_SUBJECT__) {
    return window.__EMAIL_SUBJECT__;
  }
  return '';
};

/**
 * Generate mailto URL with optional subject
 * @param {string} email - Email address
 * @param {string} subject - Email subject (optional)
 * @returns {string} Complete mailto URL
 */
export const generateMailtoUrl = (email, subject = '') => {
  if (!email) return '';
  
  if (subject) {
    return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  }
  
  return `mailto:${email}`;
};

/**
 * Generate mailto URL using WordPress Customizer settings
 * @returns {string} Complete mailto URL with subject
 */
export const getMailtoUrl = () => {
  const email = getEmail();
  const subject = getEmailSubject();
  return generateMailtoUrl(email, subject);
};
