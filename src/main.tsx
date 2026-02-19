import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameProvider } from './state/gameContext'
import { Analytics } from '@vercel/analytics/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <App />
      {/* Vercel Analytics: counts page views and visitor metrics. */}
      <Analytics />
    </GameProvider>
  </StrictMode>,
)
