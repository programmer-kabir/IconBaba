import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { IconCustomizationProvider } from './context/IconCustomizationContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <IconCustomizationProvider>
          <App />
        </IconCustomizationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
