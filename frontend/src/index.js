import React from 'react';
import { createRoot } from 'react-dom/client'; // ← React 18 syntax
import './index.css';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
