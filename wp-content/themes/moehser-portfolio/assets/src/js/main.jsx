// Main entry point for React app
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '@/scss/main.scss';

// Get root container element
const container = document.getElementById('root');
if (container) {
  // Create React root and render app
  const root = createRoot(container);
  root.render(<App />);
}


