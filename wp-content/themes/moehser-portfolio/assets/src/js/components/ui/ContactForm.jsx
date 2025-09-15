// Contact Form Component
// =====================

// Expandable contact form with reCAPTCHA integration
// ------------------------------------------------

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Constants
// =========

// Animation configuration
const ANIMATION = {
  EXPAND: {
    hidden: { height: 0, opacity: 0 },
    visible: { height: 'auto', opacity: 1 }
  },
  FADE: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  },
  TIMING: {
    DURATION: 0.3,
    EASE: 'easeInOut',
    DELAY: 0.1
  }
};

// Form configuration
const FORM_CONFIG = {
  TEXTAREA_ROWS: 5,
  API_ENDPOINT: '/wp-json/moehser/v1/contact',
  ACTION: 'contact_form_submit'
};

// reCAPTCHA configuration
const RECAPTCHA_CONFIG = {
  SCRIPT_URL: 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit',
  THEME: 'light',
  SIZE: 'normal',
  FALLBACK_KEY: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
};

// Default values
const DEFAULTS = {
  BUSINESS_SUBJECT: 'Business Inquiry - Portfolio Contact'
};

// Helper Functions
// ================

// Helper function to get business subject from WordPress Customizer
const getBusinessSubject = (businessSubject) => {
  const defaultSubject = typeof window !== 'undefined' ? 
    (window.__BUSINESS_EMAIL_SUBJECT__ || DEFAULTS.BUSINESS_SUBJECT) : 
    DEFAULTS.BUSINESS_SUBJECT;
  
  return businessSubject || defaultSubject;
};

// Helper function to detect if language is German
const isGermanLanguage = () => {
  return typeof window !== 'undefined' && 
    (window.location.pathname.includes('/de/') || 
     document.querySelector('.imprint__content-text')?.innerHTML.includes('Kontakt'));
};

// Helper function to get language-specific texts
const getLanguageTexts = (isGerman) => {
  return {
    en: {
      toggle: { open: 'Contact Form', close: 'Close Contact Form' },
      header: { title: 'Get in Touch', description: 'Send me a message and I\'ll get back to you as soon as possible.' },
      labels: { name: 'Name *', email: 'Email *', subject: 'Subject *', message: 'Message *' },
      placeholder: 'Tell me about your project or inquiry...',
      button: { sending: 'Sending...', send: 'Send Message' },
      messages: { 
        success: '✅ Message sent successfully! I\'ll get back to you soon.',
        error: '❌ Something went wrong. Please try again or contact me directly.'
      }
    },
    de: {
      toggle: { open: 'Kontaktformular', close: 'Kontaktformular schließen' },
      header: { title: 'Kontakt aufnehmen', description: 'Senden Sie mir eine Nachricht und ich melde mich so schnell wie möglich bei Ihnen.' },
      labels: { name: 'Name *', email: 'E-Mail *', subject: 'Betreff *', message: 'Nachricht *' },
      placeholder: 'Erzählen Sie mir von Ihrem Projekt oder Ihrer Anfrage...',
      button: { sending: 'Wird gesendet...', send: 'Nachricht senden' },
      messages: { 
        success: '✅ Nachricht erfolgreich gesendet! Ich melde mich bald bei Ihnen.',
        error: '❌ Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder kontaktieren Sie mich direkt.'
      }
    }
  }[isGerman ? 'de' : 'en'];
};

// Helper function to create reCAPTCHA script
const createRecaptchaScript = () => {
  const script = document.createElement('script');
  script.src = RECAPTCHA_CONFIG.SCRIPT_URL;
  script.async = true;
  script.defer = true;
  return script;
};

// Helper function to get reCAPTCHA site key
const getRecaptchaSiteKey = () => {
  return window.__RECAPTCHA_SITE_KEY__ || RECAPTCHA_CONFIG.FALLBACK_KEY;
};

// Helper function to render reCAPTCHA
const renderRecaptcha = (recaptchaRef) => {
  if (window.grecaptcha && recaptchaRef.current) {
    const siteKey = getRecaptchaSiteKey();
    try {
      window.grecaptcha.render(recaptchaRef.current, {
        sitekey: siteKey,
        theme: RECAPTCHA_CONFIG.THEME,
        size: RECAPTCHA_CONFIG.SIZE,
        callback: (token) => {
          console.log('reCAPTCHA token:', token);
        }
      });
    } catch (error) {
      console.error('reCAPTCHA render error:', error);
    }
  }
};

// Helper function to get reCAPTCHA token
const getRecaptchaToken = () => {
  if (window.grecaptcha) {
    try {
      return window.grecaptcha.getResponse();
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return null;
    }
  }
  return null;
};

// Helper function to reset reCAPTCHA
const resetRecaptcha = () => {
  if (window.grecaptcha) {
    window.grecaptcha.reset();
  }
};

// Helper function to prepare form submission data
const prepareFormData = (formData, recaptchaToken) => {
  return {
    ...formData,
    recaptchaToken,
    action: FORM_CONFIG.ACTION
  };
};

// Helper function to submit form data
const submitFormData = async (formData) => {
  const response = await fetch(FORM_CONFIG.API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  });
  
  return response.ok;
};

export default function ContactForm({ isExpanded, onToggle, businessSubject, hideToggleButton = false }) {
  // Get business subject and language
  const finalBusinessSubject = getBusinessSubject(businessSubject);
  const isGerman = isGermanLanguage();
  const t = getLanguageTexts(isGerman);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: finalBusinessSubject,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const formRef = useRef(null);
  const recaptchaRef = useRef(null);

  // Load reCAPTCHA script
  useEffect(() => {
    if (isExpanded) {
      // Load script if not already loaded
      if (!window.grecaptcha) {
        const script = createRecaptchaScript();
        document.head.appendChild(script);
        
        // Global callback for reCAPTCHA
        window.onRecaptchaLoad = () => {
          renderRecaptcha(recaptchaRef);
        };
      } else {
        // Script already loaded, render immediately
        renderRecaptcha(recaptchaRef);
      }
    }
  }, [isExpanded]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper function to reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      subject: businessSubject,
      message: ''
    });
  };

  // Helper function to handle form submission success
  const handleSubmissionSuccess = () => {
    setSubmitStatus('success');
    resetFormData();
    resetRecaptcha();
  };

  // Helper function to handle form submission error
  const handleSubmissionError = () => {
    setSubmitStatus('error');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = getRecaptchaToken();
      if (!recaptchaToken) {
        handleSubmissionError();
        return;
      }

      // Prepare and submit form data
      const submitData = prepareFormData(formData, recaptchaToken);
      const isSuccess = await submitFormData(submitData);

      if (isSuccess) {
        handleSubmissionSuccess();
      } else {
        handleSubmissionError();
      }
    } catch (error) {
      console.error('Contact form error:', error);
      handleSubmissionError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-container">
      {/* Toggle Button - only show if not hidden */}
      {!hideToggleButton && (
        <motion.button
          className="contact-form__toggle"
          onClick={onToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={ANIMATION.TIMING}
        >
          <span className="contact-form__toggle-icon">
            {isExpanded ? '✕' : '📧'}
          </span>
          <span className="contact-form__toggle-text">
            {isExpanded ? t.toggle.close : t.toggle.open}
          </span>
        </motion.button>
      )}

      {/* Expandable Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="contact-form__wrapper"
            initial={ANIMATION.EXPAND.hidden}
            animate={ANIMATION.EXPAND.visible}
            exit={ANIMATION.EXPAND.hidden}
            transition={ANIMATION.TIMING}
          >
            <motion.form
              ref={formRef}
              className="contact-form"
              onSubmit={handleSubmit}
              initial={ANIMATION.FADE.hidden}
              animate={ANIMATION.FADE.visible}
              transition={{ ...ANIMATION.TIMING, delay: ANIMATION.TIMING.DELAY }}
            >
              <div className="contact-form__header">
                <h3 className="contact-form__title">{t.header.title}</h3>
                <p className="contact-form__description">
                  {t.header.description}
                </p>
              </div>

              <div className="contact-form__fields">
                <div className="contact-form__field">
                  <label htmlFor="contact-name" className="contact-form__label">
                    {t.labels.name}
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="contact-form__input"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="contact-form__field">
                  <label htmlFor="contact-email" className="contact-form__label">
                    {t.labels.email}
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="contact-form__input"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="contact-form__field">
                  <label htmlFor="contact-subject" className="contact-form__label">
                    {t.labels.subject}
                  </label>
                  <input
                    type="text"
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="contact-form__input"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="contact-form__field">
                  <label htmlFor="contact-message" className="contact-form__label">
                    {t.labels.message}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="contact-form__textarea"
                    rows={FORM_CONFIG.TEXTAREA_ROWS}
                    required
                    disabled={isSubmitting}
                    placeholder={t.placeholder}
                  />
                </div>

                {/* reCAPTCHA */}
                <div className="contact-form__recaptcha">
                  <div ref={recaptchaRef}></div>
                </div>

                {/* Submit Button */}
                <div className="contact-form__actions">
                  <button
                    type="submit"
                    className="contact-form__submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t.button.sending : t.button.send}
                  </button>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <motion.div
                    className="contact-form__status contact-form__status--success"
                    initial={ANIMATION.FADE.hidden}
                    animate={ANIMATION.FADE.visible}
                  >
                    {t.messages.success}
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    className="contact-form__status contact-form__status--error"
                    initial={ANIMATION.FADE.hidden}
                    animate={ANIMATION.FADE.visible}
                  >
                    {t.messages.error}
                  </motion.div>
                )}
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
