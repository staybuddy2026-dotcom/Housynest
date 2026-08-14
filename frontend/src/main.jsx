import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

// Global Fetch Interceptor to handle 401 Unauthorized (e.g. JWT expired)
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const response = await originalFetch.apply(this, args);
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/control/login')) {
      window.location.href = '/login';
    }
  }
  return response;
};

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '191257462818-no8jm4eiabnn87tjl1a04fkbgn3rmm2s.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </HelmetProvider>
)
