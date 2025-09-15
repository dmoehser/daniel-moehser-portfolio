// Main entry point for React app
// ==============================

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '@/scss/main.scss';

// Configuration constants
// ----------------------
const ROOT_CONTAINER_ID = 'root';

// Initialize React application
// ---------------------------
const container = document.getElementById(ROOT_CONTAINER_ID);
if (container) {
  // Create React root and render app
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error(`Root container with id "${ROOT_CONTAINER_ID}" not found`);
}
