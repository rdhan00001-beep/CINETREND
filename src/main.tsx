// Defensive block to prevent issues with third-party libraries attempting to override window.fetch
// in sandboxed/iframe environments where window.fetch might be defined as a getter-only property.
if (typeof window !== 'undefined') {
  const isFetchError = (msg: string) => {
    return msg && (
      msg.includes('Cannot set property fetch') ||
      msg.includes('only a getter') ||
      msg.includes('property fetch')
    );
  };

  window.addEventListener('error', (event) => {
    const msg = event.message || (event.error && event.error.message) || '';
    if (isFetchError(msg)) {
      event.preventDefault();
      console.warn("Muted non-fatal fetch assignment error:", msg);
    }
  });

  const oldOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    const msg = String(message || '');
    if (isFetchError(msg)) {
      console.warn("Muted non-fatal fetch assignment error via window.onerror:", msg);
      return true;
    }
    if (oldOnError) {
      return oldOnError.apply(this, arguments as any);
    }
    return false;
  };
}


import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
