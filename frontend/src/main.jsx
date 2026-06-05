import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider } from './hooks/useAuth.jsx';
import './index.css';

import App from './App.jsx';

/**
 * Provider hierarchy (order matters):
 * 1. StrictMode     — React dev checks
 * 2. BrowserRouter  — Client-side routing
 * 3. Auth0Provider  — Auth0 SDK context (must wrap AuthProvider)
 * 4. AuthProvider   — Our unified auth context (reads from Auth0)
 * 5. App            — Application root
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain="dev-xopvoxzeck6g4zg7.jp.auth0.com"
        clientId="krTiaXwN6OFtYCojTYtnSBLAWJm0NxzQ"
        authorizationParams={{ redirect_uri: window.location.origin }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </Auth0Provider>
    </BrowserRouter>
  </StrictMode>,
);
