import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { I18nProvider } from './i18n/I18nContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { StoreInfoProvider } from './context/StoreInfoContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import './styles/theme.css';
import './styles/store.css';
import './styles/dash.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <StoreInfoProvider>
              <CartProvider>
                <WishlistProvider>
                  <App />
                  <Toaster position="top-center" toastOptions={{
                    duration: 3500,
                    style: { fontFamily: 'var(--font-body)', fontWeight: 600, background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)' },
                  }} />
                </WishlistProvider>
              </CartProvider>
            </StoreInfoProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
