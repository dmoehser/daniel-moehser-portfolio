// Email Helper Utilities
// =====================

// Constants
// ---------
const EMAIL_CONFIG = {
  GLOBAL_VARS: {
    EMAIL: '__SOCIAL_EMAIL__',
    SUBJECT: '__EMAIL_SUBJECT__'
  },
  FALLBACKS: {
    EMAIL: '',
    SUBJECT: '',
    MAILTO_URL: ''
  },
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_EMAIL_LENGTH: 5,
    MAX_EMAIL_LENGTH: 320,
    MAX_SUBJECT_LENGTH: 998
  }
};

const MAILTO_CONFIG = {
  PROTOCOL: 'mailto:',
  SUBJECT_PARAM: 'subject='
};

// Utility functions
// -----------------
const isServerSideRendering = () => {
  return typeof window === 'undefined';
};

const getGlobalVariable = (varName, fallback = '') => {
  if (isServerSideRendering()) return fallback;
  return window[varName] || fallback;
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const trimmedEmail = email.trim();
  if (trimmedEmail.length < EMAIL_CONFIG.VALIDATION.MIN_EMAIL_LENGTH || 
      trimmedEmail.length > EMAIL_CONFIG.VALIDATION.MAX_EMAIL_LENGTH) {
    return false;
  }
  
  return EMAIL_CONFIG.VALIDATION.EMAIL_REGEX.test(trimmedEmail);
};

const sanitizeSubject = (subject) => {
  if (!subject || typeof subject !== 'string') return '';
  
  const trimmedSubject = subject.trim();
  if (trimmedSubject.length > EMAIL_CONFIG.VALIDATION.MAX_SUBJECT_LENGTH) {
    return trimmedSubject.substring(0, EMAIL_CONFIG.VALIDATION.MAX_SUBJECT_LENGTH);
  }
  
  return trimmedSubject;
};

// Email data retrieval
// --------------------
export const getEmail = () => {
  const email = getGlobalVariable(
    EMAIL_CONFIG.GLOBAL_VARS.EMAIL, 
    EMAIL_CONFIG.FALLBACKS.EMAIL
  );
  
  return validateEmail(email) ? email.trim() : EMAIL_CONFIG.FALLBACKS.EMAIL;
};

export const getEmailSubject = () => {
  const subject = getGlobalVariable(
    EMAIL_CONFIG.GLOBAL_VARS.SUBJECT, 
    EMAIL_CONFIG.FALLBACKS.SUBJECT
  );
  
  return sanitizeSubject(subject);
};

// Mailto URL generation
// ---------------------
export const generateMailtoUrl = (email, subject = '') => {
  if (!email || !validateEmail(email)) {
    return EMAIL_CONFIG.FALLBACKS.MAILTO_URL;
  }
  
  const cleanEmail = email.trim();
  const cleanSubject = sanitizeSubject(subject);
  
  if (cleanSubject) {
    try {
      const encodedSubject = encodeURIComponent(cleanSubject);
      return `${MAILTO_CONFIG.PROTOCOL}${cleanEmail}?${MAILTO_CONFIG.SUBJECT_PARAM}${encodedSubject}`;
    } catch (error) {
      console.warn('Failed to encode email subject:', error.message);
      return `${MAILTO_CONFIG.PROTOCOL}${cleanEmail}`;
    }
  }
  
  return `${MAILTO_CONFIG.PROTOCOL}${cleanEmail}`;
};

export const getMailtoUrl = () => {
  const email = getEmail();
  const subject = getEmailSubject();
  
  if (!email) {
    return EMAIL_CONFIG.FALLBACKS.MAILTO_URL;
  }
  
  return generateMailtoUrl(email, subject);
};

// Additional utilities
// --------------------
export const isValidEmail = (email) => {
  return validateEmail(email);
};

export const hasEmailConfigured = () => {
  const email = getEmail();
  return email !== EMAIL_CONFIG.FALLBACKS.EMAIL && validateEmail(email);
};
