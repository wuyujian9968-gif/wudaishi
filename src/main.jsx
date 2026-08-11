import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { VoiceProvider } from './hooks/useSpeech'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <VoiceProvider>
        <App />
      </VoiceProvider>
    </HashRouter>
  </StrictMode>,
)
