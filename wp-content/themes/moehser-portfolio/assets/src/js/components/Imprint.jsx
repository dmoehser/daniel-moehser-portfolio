// Imprint Component
// ================

// Static imprint page with WordPress integration
// ---------------------------------------------

import React from 'react';

export default function Imprint() {
  // Get page content from WordPress
  const imprintTitle = typeof window !== 'undefined' ? (window.__IMPRINT_TITLE__ || 'Impressum') : 'Impressum';
  const imprintHTML = typeof window !== 'undefined' ? (window.__IMPRINT_HTML__ || '') : '';
  const contentToShow = imprintHTML || '';

  // Navigate back to projects section
  const goBack = () => {
    window.location.href = '/#projects';
  };

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
            /* Fixed width for consistent alignment */
            margin-left: 0 !important;
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
            /* Match content width and alignment */
            margin-left: 0 !important;
            margin-right: auto !important;
          }

          .imprint-header__logo-link {
            text-decoration: none;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 500;
            font-size: 1.125rem;
          }

          .imprint-header__back-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            color: var(--color-text);
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .imprint-header__back-btn:hover {
            background: var(--color-bg-hover);
            border-color: var(--color-border-hover);
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
            color: var(--color-accent);
            text-decoration: none;
          }

          .imprint__text a:hover {
            text-decoration: underline;
          }

          /* Dark mode */
          .theme-dark .imprint__card {
            background: rgba(30,41,59,.95);
            border-color: rgba(255,255,255,.12);
            color: #e2e8f0;
          }

          .theme-dark .imprint-header {
            background: var(--color-bg-dark);
            border-bottom-color: var(--color-border-dark);
          }

          .theme-dark .imprint-header__back-btn {
            background: var(--color-bg-dark);
            border-color: var(--color-border-dark);
            color: var(--color-text-dark);
          }

          .theme-dark .imprint-header__back-btn:hover {
            background: var(--color-bg-hover-dark);
            border-color: var(--color-border-hover-dark);
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
              aria-label="Back to projects"
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

                  {contentToShow && (
                    <div className="imprint__body">
                      <div className="imprint__text">
                        <div 
                          className="imprint__content-text" 
                          dangerouslySetInnerHTML={{ __html: contentToShow }} 
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
