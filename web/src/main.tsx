/**
 * @fileoverview Application entry point for SpectaSyncAI web dashboard.
 * Renders the root React component tree into the DOM.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
)
