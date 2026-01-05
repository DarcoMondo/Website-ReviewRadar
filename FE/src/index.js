import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx';

const rootElement = document.getElementById('root');

if (rootElement.hasChildNodes()) {
  // If root has children, it means react-snap has pre-rendered the app
  // Use hydrateRoot for hydration
  const root = ReactDOM.hydrateRoot(rootElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Normal rendering for development
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
