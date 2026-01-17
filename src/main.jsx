import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'; // Import ini

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider> {/* Bungkus App dengan HelmetProvider */}
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)