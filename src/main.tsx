import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { DesktopOverlayWindow } from './components/DesktopOverlayWindow'
import { LanguageProvider } from './i18n'
import './index.css'

const isOverlayMode = window.location.search.includes('overlay=1');

if (isOverlayMode) {
  document.documentElement.classList.add('overlay-mode');
  document.body.classList.add('overlay-mode');
  const root = document.getElementById('root');
  if (root) {
    root.classList.add('overlay-mode');
    root.classList.remove('bg-[#050608]');
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      {isOverlayMode ? <DesktopOverlayWindow /> : <App />}
    </LanguageProvider>
  </React.StrictMode>,
)
