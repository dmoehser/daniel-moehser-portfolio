// Contact Form Component
// =====================

// Expandable contact form with reCAPTCHA integration
// ------------------------------------------------

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation constants
// ------------------------------
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
    EASE: 'easeInOut'
  }
};

export default function ContactForm({ isExpanded, onToggle, businessSubject, hideToggleButton = false }) {
  // Get business subject from WordPress Customizer
  const defaultBusinessSubject = typeof window !== 'undefined' ? 
    (window.__BUSINESS_EMAIL_SUBJECT__ || 'Business Inquiry - Portfolio Contact') : 
    'Business Inquiry - Portfolio Contact';
  
  const finalBusinessSubject = businessSubject || defaultBusinessSubject;
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
    if (isExpanded && !window.grecaptcha) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        if (window.grecaptcha && recaptchaRef.current) {
          const siteKey = window.__RECAPTCHA_SITE_KEY__ || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Fallback to test key
          window.grecaptcha.render(recaptchaRef.current, {
            sitekey: siteKey,
            theme: 'light',
            size: 'normal'
          });
        }
      };
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = window.grecaptcha ? 
        await window.grecaptcha.execute() : null;

      // Prepare form data
      const submitData = {
        ...formData,
        recaptchaToken,
        action: 'contact_form_submit'
      };

      // Submit to WordPress
      const response = await fetch('/wp-json/moehser/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: businessSubject,
          message: ''
        });
        // Reset reCAPTCHA
        if (window.grecaptcha) {
          window.grecaptcha.reset();
        }
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
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
            {isExpanded ? 'Close Contact Form' : 'Contact Form'}
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
              transition={{ ...ANIMATION.TIMING, delay: 0.1 }}
            >
              <div className="contact-form__header">
                <h3 className="contact-form__title">Get in Touch</h3>
                <p className="contact-form__description">
                  Send me a message and I'll get back to you as soon as possible.
                </p>
              </div>

              <div className="contact-form__fields">
                <div className="contact-form__field">
                  <label htmlFor="contact-name" className="contact-form__label">
                    Name *
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
                    Email *
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
                    Subject *
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
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="contact-form__textarea"
                    rows="5"
                    required
                    disabled={isSubmitting}
                    placeholder="Tell me about your project or inquiry..."
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
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <motion.div
                    className="contact-form__status contact-form__status--success"
                    initial={ANIMATION.FADE.hidden}
                    animate={ANIMATION.FADE.visible}
                  >
                    ✅ Message sent successfully! I'll get back to you soon.
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    className="contact-form__status contact-form__status--error"
                    initial={ANIMATION.FADE.hidden}
                    animate={ANIMATION.FADE.visible}
                  >
                    ❌ Something went wrong. Please try again or contact me directly.
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
