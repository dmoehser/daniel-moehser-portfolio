// Imprint Component
// ================

// Static imprint page with WordPress integration
// ---------------------------------------------

import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ContactForm from './ui/ContactForm';

export default function Imprint() {
  // Get page content from WordPress
  const imprintTitle = typeof window !== 'undefined' ? (window.__IMPRINT_TITLE__ || 'Impressum') : 'Impressum';
  const imprintHTML = typeof window !== 'undefined' ? (window.__IMPRINT_HTML__ || '') : '';
  const contentToShow = imprintHTML || '';

  // Contact form state
  const [isContactFormExpanded, setIsContactFormExpanded] = useState(false);
  const isExpandedRef = useRef(false);

  // Get business email subject from WordPress Customizer
  const businessEmailSubject = typeof window !== 'undefined' ? 
    (window.__BUSINESS_EMAIL_SUBJECT__ || 'Business Inquiry - Portfolio Contact') : 
    'Business Inquiry - Portfolio Contact';

  // Process content to replace h3 Contact with contact form
  const processImprintContent = (html) => {
    if (!html) return '';
    
    // Replace <h3>Contact</h3> with contact form button
    const contactFormButton = `
      <div class="imprint-contact-section">
        <h3>Contact</h3>
        <div class="contact-form-container">
          <button class="contact-form__toggle" onclick="window.toggleImprintContactForm()" id="imprint-contact-toggle">
            <span class="contact-form__toggle-icon">📧</span>
            <span class="contact-form__toggle-text">Contact Form</span>
          </button>
          <div class="contact-form__wrapper" id="imprint-contact-form-wrapper" style="display: none;">
            <!-- Contact form will be rendered here -->
          </div>
        </div>
      </div>
    `;
    
    return html.replace(/<h3[^>]*>Contact<\/h3>/gi, contactFormButton);
  };

  const processedContent = processImprintContent(contentToShow);

  // Navigate back to home section
  const goBack = () => {
    window.location.href = '/#';
  };

  // Toggle contact form
  const toggleContactForm = () => {
    const newState = !isContactFormExpanded;
    setIsContactFormExpanded(newState);
    isExpandedRef.current = newState;
  };

  // Global function for onclick handler
  useEffect(() => {
    window.toggleImprintContactForm = () => {
      const newState = !isExpandedRef.current;
      setIsContactFormExpanded(newState);
      isExpandedRef.current = newState;
    };

    return () => {
      delete window.toggleImprintContactForm;
    };
  }, []);

  // Update ref when state changes
  useEffect(() => {
    isExpandedRef.current = isContactFormExpanded;
  }, [isContactFormExpanded]);

  // Render contact form in the container after content is processed
  useEffect(() => {
    const renderContactForm = () => {
      const wrapper = document.getElementById('imprint-contact-form-wrapper');
      const toggleButton = document.getElementById('imprint-contact-toggle');
      
      if (wrapper && toggleButton) {
        // Update button text and icon
        const icon = toggleButton.querySelector('.contact-form__toggle-icon');
        const text = toggleButton.querySelector('.contact-form__toggle-text');
        
        if (isContactFormExpanded) {
          icon.textContent = '✕';
          text.textContent = 'Close Contact Form';
        } else {
          icon.textContent = '📧';
          text.textContent = 'Contact Form';
        }
        
        // Clear and render form
        wrapper.innerHTML = '';
        if (isContactFormExpanded) {
          const root = createRoot(wrapper);
          root.render(
            <ContactForm 
              isExpanded={true}
              onToggle={toggleContactForm}
              businessSubject={businessEmailSubject}
              hideToggleButton={true}
            />
          );
        }
        
        // Show/hide wrapper based on expanded state
        wrapper.style.display = isContactFormExpanded ? 'block' : 'none';
      }
    };

    // Initial render with delay
    const timeoutId = setTimeout(renderContactForm, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isContactFormExpanded, businessEmailSubject, processedContent]);

  return (
    <>
      <style>
        {`
          /* Force left alignment with highest priority */
          .imprint-page {
            min-height: 100vh !important;
            background: var(--color-bg) !important;
            color: var(--color-text) !important;
            text-align: left !important;
          }

          .imprint {
            min-height: 100vh !important;
            width: 100% !important;
            display: flex !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
            background: transparent !important;
            position: relative !important;
            padding: 2rem 0 4vh 0 !important;
            box-sizing: border-box !important;
            z-index: 1 !important;
            text-align: left !important;
          }

          .imprint__inner {
            width: 100% !important;
            max-width: 1000px !important;
            margin: 0 auto !important;
            padding: 0 3rem !important;
            position: relative !important;
            z-index: 2 !important;
            overflow: visible !important;
            text-align: left !important;
            /* Offset for social dock */
            margin-left: 80px !important;
            margin-right: auto !important;
          }

          .imprint__content {
            width: 100% !important;
            max-width: 1000px !important;
            margin: 0 !important;
            text-align: left !important;
          }

          .imprint__card {
            width: 100% !important;
            background: rgba(255,255,255,.95) !important;
            border: 1px solid rgba(15,23,42,.12) !important;
            border-radius: 16px !important;
            padding: clamp(24px, 3.5vw, 48px) !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            backdrop-filter: blur(10px) saturate(140%) !important;
            -webkit-backdrop-filter: blur(10px) saturate(140%) !important;
            text-align: left !important;
          }

          .imprint-header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: var(--color-bg);
            border-bottom: 1px solid var(--color-border);
            backdrop-filter: blur(10px);
          }

          .imprint-header__inner {
            max-width: 1000px !important;
            margin: 0 auto !important;
            padding: 1rem 3rem !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            /* Offset for social dock */
            margin-left: 80px !important;
            margin-right: auto !important;
          }

          .imprint-header__logo-link {
            text-decoration: none;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 500;
            font-size: 1.125rem;
          }

          .imprint-header__back-btn {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            padding: 8px 12px !important;
            border-radius: 12px !important;
            background: rgba(255,255,255,.65) !important;
            border: 1px solid rgba(15,23,42,.08) !important;
            border-bottom: 2px solid rgba(15,23,42,.15) !important;
            color: #0f172a !important;
            cursor: pointer !important;
            text-decoration: none !important;
            font-weight: 700 !important;
            transition: all 0.2s ease !important;
          }

          .imprint-header__back-btn:hover {
            background: rgba(255,255,255,.8) !important;
            border-color: rgba(15,23,42,.12) !important;
            border-bottom-color: rgba(15,23,42,.2) !important;
            transform: translateY(-1px) !important;
          }

          .theme-dark .imprint-header__back-btn {
            background: rgba(11,18,32,.7) !important;
            color: #e2e8f0 !important;
            border-color: rgba(255,255,255,.08) !important;
            border-bottom: 2px solid rgba(255,255,255,.15) !important;
          }

          .theme-dark .imprint-header__back-btn:hover {
            background: rgba(11,18,32,.9) !important;
            border-color: rgba(255,255,255,.12) !important;
            border-bottom-color: rgba(255,255,255,.2) !important;
          }

          .imprint__title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--color-text);
            margin: 0 0 1.5rem 0;
            line-height: 1.2;
          }

          .imprint__text {
            color: var(--color-text);
            line-height: 1.6;
          }

          .imprint__text h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 2rem 0 1rem 0;
            color: var(--color-text);
          }

          .imprint__text h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 1.5rem 0 0.75rem 0;
            color: var(--color-text);
          }

          .imprint__text p {
            margin: 0 0 1rem 0;
            color: var(--color-text);
          }

          .imprint__text a {
            color: #3b82f6 !important; /* Blue for light mode */
            text-decoration: none;
          }

          .imprint__text a:hover {
            text-decoration: underline;
          }

          /* Dark mode link styling */
          .theme-dark .imprint__text a {
            color: #10b981 !important; /* Green for dark mode */
          }

          /* Dark mode */
          .theme-dark .imprint__card {
            background: rgba(11,18,32,.95) !important;
            border-color: rgba(255,255,255,.12) !important;
            color: #e2e8f0 !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2) !important;
          }

          .theme-dark .imprint-header {
            background: var(--color-bg-dark);
            border-bottom-color: var(--color-border-dark);
          }

          /* Contact Section Styles */
          .imprint-contact-section {
            margin: 2rem 0;
            padding: 1.5rem 0;
            border-top: 1px solid rgba(15, 23, 42, 0.1);
            position: relative;
            z-index: 10;
          }

          .imprint-contact-section h3 {
            margin: 0 0 1rem 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--color-text);
          }

          .theme-dark .imprint-contact-section {
            border-top-color: rgba(255, 255, 255, 0.1);
          }

          /* Ensure contact form is above terminal overlay */
          .contact-form-container {
            position: relative;
            z-index: 10000;
          }

          .contact-form {
            position: relative;
            z-index: 10000;
          }

          /* Button styles for inline contact form */
          .contact-form__toggle {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.5rem;
            background: rgba(59, 130, 246, 0.1);
            border: 2px solid rgba(59, 130, 246, 0.2);
            border-radius: 12px;
            color: #3b82f6;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            width: 100%;
            justify-content: center;
            font-family: inherit;
          }

          .contact-form__toggle:hover {
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.3);
            transform: translateY(-1px);
          }

          .contact-form__toggle-icon {
            font-size: 1.25rem;
            line-height: 1;
          }

          .contact-form__toggle-text {
            font-size: 1rem;
            font-weight: 600;
          }

          .theme-dark .contact-form__toggle {
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.3);
            color: #60a5fa;
          }

          .theme-dark .contact-form__toggle:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.4);
          }

        `}
      </style>
      
      <div className="imprint-page">
        {/* Header with logo and back button */}
        <header className="imprint-header">
          <div className="imprint-header__inner">
            <div className="imprint-header__logo">
              <a href="/" onClick={(e) => { e.preventDefault(); goBack(); }} className="imprint-header__logo-link">
                <span style={{color: '#94a3b8'}}>&lt;</span>
                <span style={{color: '#0f172a'}}>danielmoehser</span>
                <span style={{color: '#38bdf8'}}>.dev</span>
                <span style={{color: '#94a3b8'}}> /&gt;</span>
              </a>
            </div>
            <button 
              className="imprint-header__back-btn"
              onClick={goBack}
              aria-label="Back to home"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="imprint-main">
          <section className="imprint">
            <div className="imprint__inner">
              <div className="imprint__content">
                <div className="imprint__card">
                  <div className="imprint__header">
                    <h1 className="imprint__title">
                      {imprintTitle}
                    </h1>
                  </div>

                  {processedContent && (
                    <div className="imprint__body">
                      <div className="imprint__text">
                        <div 
                          className="imprint__content-text" 
                          dangerouslySetInnerHTML={{ __html: processedContent }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
