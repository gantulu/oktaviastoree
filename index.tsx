
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Block all zoom attempts via JavaScript
const blockZoom = () => {
  // Prevent multi-touch pinch zoom
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // Prevent double tap to zoom (handled mostly by CSS touch-action, but good as fallback)
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Prevent Safari gesture scaling
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  });

  // Prevent keyboard zoom shortcuts (Cmd/Ctrl + +/-/0)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && 
        (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
      e.preventDefault();
    }
  });

  // Prevent wheel zoom (Ctrl + scroll)
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });
};

// Initialize zoom blocking
blockZoom();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);