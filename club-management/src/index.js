import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Bypass localtunnel warning page automatically for all API requests
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  let [resource, config] = args;
  if (!config) config = {};
  if (!config.headers) config.headers = {};
  
  if (config.headers instanceof Headers) {
    config.headers.append('Bypass-Tunnel-Reminder', 'true');
  } else {
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
  }
  
  return originalFetch(resource, config);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
