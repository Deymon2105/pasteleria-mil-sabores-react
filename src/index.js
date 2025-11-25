import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './styles/theme.css';
import './styles/styles.css';
import './styles/components.css';
/* Note: responsive.css was empty and removed to reduce unused files */
import App from './App';

// Ignorar errores de extensiones del navegador durante desarrollo
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' && 
      args[0].includes('Extension context invalidated')
    ) {
      return; // Ignorar este error específico
    }
    originalError.apply(console, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
