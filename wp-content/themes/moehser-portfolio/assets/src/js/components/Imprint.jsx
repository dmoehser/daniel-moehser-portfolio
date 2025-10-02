// Imprint Component
// ================
// Static imprint page with WordPress integration

import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ContactForm from './ui/ContactForm';
import HeroBrand from './ui/HeroBrand';
import MobileMenu from './ui/MobileMenu';
import { useLanguage } from '../hooks/useLanguage';

// Configuration constants
// ----------------------
const DEFAULT_IMPRINT_TITLE = 'Imprint';
const DEFAULT_BUSINESS_EMAIL_SUBJECT = 'Business Inquiry - Portfolio Contact';
const PROFILE_NAME = 'Daniel Moehser';
const PROFILE_EMAIL = 'hi@danielmoehser.dev';
const PROFILE_WEBSITE = 'danielmoehser.dev';
const PROFILE_ADDRESS = {
  STREET: 'Sydneystr. 8',
  CITY: '22297 Hamburg',
  COUNTRY_DE: 'Deutschland',
  COUNTRY_EN: 'Germany'
};

// UI constants
// -----------
const CONTACT_FORM_DELAY = 100;
const SOCIAL_DOCK_OFFSET = 80;
const MOBILE_BREAKPOINT = 1024; // includes tablets
const CONTACT_ICONS = {
  EMAIL: '📧',
  CLOSE: '✕'
};

// Language-specific content
// ------------------------
const CONTACT_LABELS = {
  DE: {
    CONTACT: 'Kontakt',
    CONTACT_FORM: 'Kontaktformular',
    CLOSE_FORM: 'Kontaktformular schließen'
  },
  EN: {
    CONTACT: 'Contact',
    CONTACT_FORM: 'Contact Form',
    CLOSE_FORM: 'Close Contact Form'
  }
};

// Print content constants
// ----------------------
const PRINT_CONTENT = {
  DE: {
    TITLE: 'Rechtliche Hinweise',
    CONTACT_EMAIL: 'E-Mail:',
    CONTACT_WEBSITE: 'Website:',
    RESPONSIBLE_TITLE: 'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV',
    DISCLAIMER_TITLE: 'Haftungsausschluss',
    DISCLAIMER_TEXT: 'Die Inhalte meiner Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann ich jedoch keine Gewähr übernehmen.',
    PRIVACY_TITLE: 'Datenschutz & Datenverarbeitung',
    PRIVACY_TEXT: 'Die Nutzung meiner Website ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf meinen Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder E-Mail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis.<br><br>Bei der Nutzung des Kontaktformulars werden Ihre Daten von Google reCAPTCHA verarbeitet, um Spam zu verhindern. Dies ist für die Funktionalität des Formulars technisch erforderlich.<br>Es gelten die Datenschutzbestimmungen von Google: https://policies.google.com/privacy<br><br><strong>Lokaler Speicher</strong><br><br>Diese Website verwendet den lokalen Speicher des Browsers (keine Cookies), um Ihre Einstellungen zu speichern:<br><br>• Themenauswahl (Dunkel-/Hellmodus)<br>• Spracheinstellung (Deutsch/Englisch)<br>• Einstellungen der Benutzeroberfläche<br><br>Diese Daten verbleiben auf Ihrem Gerät und werden nicht übertragen.<br><br><strong>Kein Tracking</strong><br><br>Diese Website verwendet keine Analysen, Tracking-Cookies oder Werbung.',
    COPYRIGHT_TITLE: 'Urheberrecht',
    COPYRIGHT_TEXT: 'Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.'
  },
  EN: {
    TITLE: 'Legal Notice',
    CONTACT_EMAIL: 'Email:',
    CONTACT_WEBSITE: 'Website:',
    RESPONSIBLE_TITLE: 'Responsible for content according to German law (§ 55 Abs. 2 RStV)',
    DISCLAIMER_TITLE: 'Disclaimer',
    DISCLAIMER_TEXT: 'The contents of my pages have been created with the utmost care. However, I cannot guarantee the accuracy, completeness and timeliness of the content.',
    PRIVACY_TITLE: 'Privacy & Data Processing',
    PRIVACY_TEXT: 'The use of my website is generally possible without providing personal data. If personal data (such as name, address or e-mail addresses) is collected on my pages, this is always done on a voluntary basis as far as possible.<br><br>When you use the contact form, your data is processed by Google reCAPTCHA to prevent spam. This is technically necessary for form functionality.<br>Google\'s privacy policy applies: https://policies.google.com/privacy<br><br><strong>Local Storage</strong><br><br>This website uses browser localStorage (not cookies) to save your preferences:<br><br>• Theme selection (dark/light mode)<br>• Language preference (German/English)<br>• Interface settings<br><br>This data stays on your device and is not transmitted.<br><br><strong>No Tracking</strong><br><br>This website does not use analytics, tracking cookies, or advertising.',
    COPYRIGHT_TITLE: 'Copyright',
    COPYRIGHT_TEXT: 'The content and works created by the site operators on these pages are subject to German copyright law. The reproduction, processing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.'
  }
};

// Helper functions
// ---------------
function getCustomizerValue(key, defaultValue = '') {
  return typeof window !== 'undefined' ? (window[key] || defaultValue) : defaultValue;
}

function isGermanLanguage() {
  return typeof window !== 'undefined' && 
    (window.location.pathname.includes('/de/') || 
     document.querySelector('.imprint__content-text')?.innerHTML.includes('Kontakt'));
}

function generateContactFormButton(isGerman) {
  const labels = isGerman ? CONTACT_LABELS.DE : CONTACT_LABELS.EN;
  return `
    <div class="imprint-contact-section">
      <h3>${labels.CONTACT}</h3>
      <div class="contact-form-container">
        <button class="contact-form__toggle" onclick="window.toggleImprintContactForm()" id="imprint-contact-toggle">
          <span class="contact-form__toggle-icon">${CONTACT_ICONS.EMAIL}</span>
          <span class="contact-form__toggle-text">${labels.CONTACT_FORM}</span>
        </button>
        <div class="contact-form__wrapper" id="imprint-contact" style="display: none;">
          <!-- Contact form will be rendered here -->
        </div>
      </div>
    </div>
  `;
}

function generatePrintContent(isGerman) {
  const labels = isGerman ? CONTACT_LABELS.DE : CONTACT_LABELS.EN;
  const content = isGerman ? PRINT_CONTENT.DE : PRINT_CONTENT.EN;
  const country = isGerman ? PROFILE_ADDRESS.COUNTRY_DE : PROFILE_ADDRESS.COUNTRY_EN;
  
  return `
    <h2>${content.TITLE}</h2>
    <p><strong>${PROFILE_NAME}</strong><br>
    ${PROFILE_ADDRESS.STREET}<br>
    ${PROFILE_ADDRESS.CITY}<br>
    ${country}</p>

    <h3>${labels.CONTACT}</h3>
    <p>${content.CONTACT_EMAIL} ${PROFILE_EMAIL}</p>
    <p>${content.CONTACT_WEBSITE} ${PROFILE_WEBSITE}</p>
    
    <h3>${content.RESPONSIBLE_TITLE}</h3>
    <p><strong>${PROFILE_NAME}</strong><br>
    ${PROFILE_ADDRESS.STREET}<br>
    ${PROFILE_ADDRESS.CITY}<br>
    ${country}</p>

    <h3>${content.DISCLAIMER_TITLE}</h3>
    <p>${content.DISCLAIMER_TEXT}</p>

    <h3>${content.PRIVACY_TITLE}</h3>
    <p>${content.PRIVACY_TEXT}</p>

    <h3>${content.COPYRIGHT_TITLE}</h3>
    <p>${content.COPYRIGHT_TEXT}</p>
  `;
}

export default function Imprint() {
  // Get page content from WordPress
  const imprintTitle = getCustomizerValue('__IMPRINT_TITLE__', DEFAULT_IMPRINT_TITLE);
  const imprintHTML = getCustomizerValue('__IMPRINT_HTML__');
  const contentToShow = imprintHTML || '';

  // Language detection
  const { isGerman } = useLanguage();

  // Print mode state
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Contact form state
  const [isContactFormExpanded, setIsContactFormExpanded] = useState(false);
  const isExpandedRef = useRef(false);

  // Get business email subject from WordPress Customizer
  const businessEmailSubject = getCustomizerValue('__BUSINESS_EMAIL_SUBJECT__', DEFAULT_BUSINESS_EMAIL_SUBJECT);

  // Process content to replace h3 Contact/Kontakt with contact form
  const processImprintContent = (html) => {
    if (!html) return '';
    
    // Detect language from URL or content
    const isGerman = isGermanLanguage();
    
    // Generate contact form button based on language
    const contactFormButton = generateContactFormButton(isGerman);
    
    // Replace based on language
    if (isGerman) {
      return html.replace(/<h3[^>]*>Kontakt<\/h3>/gi, contactFormButton);
    } else {
      return html.replace(/<h3[^>]*>Contact<\/h3>/gi, contactFormButton);
    }
  };

  const processedContent = processImprintContent(contentToShow);

  // Generate print content based on language
  const printContent = generatePrintContent(isGerman);

  // Navigate back to home section
  const goBack = () => {
    const isGerman = window.location.pathname.includes('/de/');
    const basePath = isGerman ? '/de' : '';
    const targetSection = 'projects';
    window.location.href = `${basePath}/#${targetSection}`;
  };

  // Toggle contact form
  const toggleContactForm = () => {
    const newState = !isContactFormExpanded;
    setIsContactFormExpanded(newState);
    isExpandedRef.current = newState;
  };

  // Print mode detection and content replacement
  useEffect(() => {
    const handleBeforePrint = () => {
      setIsPrintMode(true);
    };

    const handleAfterPrint = () => {
      setIsPrintMode(false);
    };

    // Listen for print events
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

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
      const wrapper = document.getElementById('imprint-contact');
      const toggleButton = document.getElementById('imprint-contact-toggle');
      
      if (wrapper && toggleButton) {
        // Update button text and icon
        const icon = toggleButton.querySelector('.contact-form__toggle-icon');
        const text = toggleButton.querySelector('.contact-form__toggle-text');
        
        // Detect language for button text
        const isGerman = isGermanLanguage();
        const labels = isGerman ? CONTACT_LABELS.DE : CONTACT_LABELS.EN;
        
        if (isContactFormExpanded) {
          icon.textContent = CONTACT_ICONS.CLOSE;
          text.textContent = labels.CLOSE_FORM;
        } else {
          icon.textContent = CONTACT_ICONS.EMAIL;
          text.textContent = labels.CONTACT_FORM;
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
    const timeoutId = setTimeout(renderContactForm, CONTACT_FORM_DELAY);
    
    return () => clearTimeout(timeoutId);
  }, [isContactFormExpanded, businessEmailSubject, processedContent]);

  return (
    <>
      <nav id="imprint-navigation" className="sr-only">
        <h2>Navigation</h2>
        <ul>
          <li><a href="#imprint-content">Skip to main content</a></li>
          <li><a href="#imprint-contact">Skip to contact form</a></li>
        </ul>
      </nav>
      
      <style>
        {`
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
            max-width: 750px !important;
            margin: 0 auto !important;
            margin-left: ${SOCIAL_DOCK_OFFSET}px !important;
            margin-right: auto !important;
            padding: 0 clamp(18px, 3.5vw, 36px) !important;
            position: relative !important;
            z-index: 2 !important;
            overflow: visible !important;
            text-align: left !important;
          }

          /* Mobile optimizations */
          @media (max-width: ${MOBILE_BREAKPOINT}px) {
            .imprint__inner {
              padding: 0 0.75rem !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
            }
            
            .imprint__card {
              padding: 1.5rem 1rem !important;
              margin: 0 !important;
            }
            
            .imprint__title {
              font-size: 1.75rem !important;
              margin-bottom: 1rem !important;
            }
            
            .imprint__content-text h3 {
              font-size: 1.1rem !important;
              margin: 1.25rem 0 0.5rem 0 !important;
            }
            
            .imprint__content-text p {
              margin: 0.75rem 0 !important;
              font-size: 0.9rem !important;
              line-height: 1.5 !important;
            }
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
            backdrop-filter: blur(4px) saturate(110%) !important;
            -webkit-backdrop-filter: blur(4px) saturate(110%) !important;
            text-align: left !important;
          }

          .imprint-header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: var(--color-bg);
            border-bottom: 1px solid var(--color-border);
            backdrop-filter: blur(4px);
          }

          .imprint-header__inner {
            max-width: 750px !important;
            margin: 0 auto !important;
            margin-left: ${SOCIAL_DOCK_OFFSET}px !important;
            margin-right: auto !important;
            padding: 1rem clamp(18px, 3.5vw, 36px) !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
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

          @media (max-width: ${MOBILE_BREAKPOINT}px) {
            .imprint-header__back-btn {
              display: none !important;
            }
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
            color: #3b82f6 !important;
            text-decoration: none;
          }

          .imprint__text a:hover {
            text-decoration: underline;
          }

          .theme-dark .imprint__text a {
            color: #10b981 !important;
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

          /* Print mode styles */
          @media print {
            @page {
              size: portrait;
              margin: 15mm;
            }
            
            .imprint-header,
            .imprint__credits,
            .contact-form-container,
            .imprint-contact-section {
              display: none !important;
            }
            
            .imprint-page,
            .imprint-main,
            .imprint,
            .imprint__inner,
            .imprint__content,
            .imprint__card {
              height: auto !important;
              min-height: auto !important;
              max-height: none !important;
            }
            
            .imprint__card {
              background: white !important;
              border: none !important;
              box-shadow: none !important;
              padding: 20px !important;
            }
            
            .imprint__text {
              color: black !important;
            }
            
            .imprint__text h2 {
              color: black !important;
              font-size: 13pt !important;
              margin: 12pt 0 6pt 0 !important;
            }
            
            .imprint__text h3 {
              color: black !important;
              font-size: 11pt !important;
              margin: 8pt 0 4pt 0 !important;
            }
            
            .imprint__text p {
              color: black !important;
              font-size: 8pt !important;
              line-height: 1.2 !important;
              margin: 0 0 4pt 0 !important;
            }
            
            .imprint__text strong {
              font-weight: bold !important;
            }
          }

        `}
      </style>
      
      <div className="imprint-page" id="imprint-content">
        {/* Mobile Header */}
        <div className="mobile-only">
          <HeroBrand />
          <MobileMenu />
        </div>
        
        {/* Desktop Header with back button */}
        <header className="imprint-header desktop-only">
          <div className="imprint-header__inner">
            <div className="imprint-header__logo">
              <a 
                href={window.location.pathname.includes('/de/') ? '/de/#' : '/#'} 
                onClick={(e) => { 
                  e.preventDefault(); 
                  window.location.href = window.location.pathname.includes('/de/') ? '/de/#' : '/#'; 
                }} 
                className="imprint-header__logo-link"
              >
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

                  <div className="imprint__body">
                    <div className="imprint__text">
                      <div 
                        className="imprint__content-text" 
                        dangerouslySetInnerHTML={{ 
                          __html: isPrintMode ? printContent : processedContent 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <div className="imprint__credits">
          <p className="mb-0 mt-2">
            <small>
              Created with ❤️ by{' '}
              <a href={isGerman ? "https://danielmoehser.dev/de/" : "https://danielmoehser.dev"} className="text-light" target="_blank" style={{textDecoration: 'none', fontFamily: 'monospace', fontWeight: 'bold'}}>
                <span className="brand-bracket">&lt;</span><span className="brand-base">danielmoehser</span><span className="brand-accent">.dev</span><span className="brand-bracket"> /&gt;</span>
              </a>
              </small>
            </p>
            <p className="mb-0 mt-1">
              <small style={{color: '#64748b', fontSize: '0.75rem'}}>
                No cookies used
              </small>
            </p>
          </div>
      </div>
    </>
  );
}
