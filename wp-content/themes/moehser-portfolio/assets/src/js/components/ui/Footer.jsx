// Footer Component
// ===============

import React from 'react';

export default function Footer({ show = false }) {
  if (!show) return null;

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__content">
          <nav className="site-footer__nav">
            <a href="/imprint/" className="site-footer__link">
              Imprint
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
