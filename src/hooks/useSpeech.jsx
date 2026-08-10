import { useCallback, useState, useEffect, createContext, useContext } from 'react'

// Voice quality ranking - higher score = more natural
function voiceScore(voice) {
  const name = voice.name.toLowerCase()
  let score = 0

  // Edge Natural voices are the best on Windows
  if (name.includes('natural')) score += 100
  // Microsoft online/natural voices
  if (name.includes('microsoft') && (name.includes('online') || name.includes('natural'))) score += 80
  // Google voices (Chrome) - quite natural
  if (name.includes('google')) score += 70
  // Microsoft offline voices - decent
  if (name.includes('microsoft') && !name.includes('mobile')) score += 50
  // macOS system voices - good quality
  if (name.includes('samantha') || name.includes('daniel') || name.includes('karen') || name.includes('alex')) score += 60
  // Prefer female voices for teaching (generally clearer)
  if (name.includes('female') || name.includes('ava') || name.includes('emma') || name.includes('zira') || name.includes('samantha')) score += 10
  // Prefer US/UK English
  if (voice.lang === 'en-US') score += 5
  if (voice.lang === 'en-GB') score += 3
  // Penalize very robotic voices
  if (name.includes('mobile')) score -= 50

  return score
}

// VoiceContext for global voice settings
const VoiceContext = createContext(null)

export function VoiceProvider({ children }) {
  const [allVoices, setAllVoices] = useState([])
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => {
    return localStorage.getItem('english-learner-voice') || 'auto'
  })
  const [rate, setRate] = useState(() => {
    return parseFloat(localStorage.getItem('english-learner-rate')) || 0.75
  })

  // Load voices
  useEffect(() => {
    const load = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        const english = voices
          .filter(v => v.lang.startsWith('en'))
          .sort((a, b) => voiceScore(b) - voiceScore(a))
        setAllVoices(english)
      }
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [])

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('english-learner-voice', selectedVoiceName)
  }, [selectedVoiceName])

  useEffect(() => {
    localStorage.setItem('english-learner-rate', String(rate))
  }, [rate])

  const topVoices = allVoices.slice(0, 8) // top 8 most natural voices

  return (
    <VoiceContext.Provider value={{
      selectedVoiceName, setSelectedVoiceName,
      rate, setRate,
      allVoices, topVoices,
    }}>
      {children}
    </VoiceContext.Provider>
  )
}

export function useVoiceSettings() {
  const ctx = useContext(VoiceContext)
  if (!ctx) throw new Error('useVoiceSettings must be used within VoiceProvider')
  return ctx
}

export function useSpeech() {
  const { selectedVoiceName, rate } = useVoiceSettings()
  const [speaking, setSpeaking] = useState(false)

  const getVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) return null

    // If user selected a specific voice, find it
    if (selectedVoiceName !== 'auto') {
      const found = voices.find(v => v.name === selectedVoiceName)
      if (found) return found
    }

    // Auto mode: pick highest quality voice available
    const english = voices
      .filter(v => v.lang.startsWith('en'))
      .sort((a, b) => voiceScore(b) - voiceScore(a))

    return english[0] || voices[0]
  }, [selectedVoiceName])

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return

    window.speechSynthesis.cancel()

    // Small delay to let cancel complete
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = 1.0
      utterance.volume = 1.0

      const voice = getVoice()
      if (voice) {
        utterance.voice = voice
        utterance.lang = voice.lang
      } else {
        utterance.lang = 'en-US'
      }

      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = (e) => {
        setSpeaking(false)
        // If the selected voice fails, retry with default
        if (voice && e.error === 'language-unavailable') {
          const fallback = new SpeechSynthesisUtterance(text)
          fallback.rate = rate
          fallback.lang = 'en-US'
          fallback.onstart = () => setSpeaking(true)
          fallback.onend = () => setSpeaking(false)
          window.speechSynthesis.speak(fallback)
        }
      }

      window.speechSynthesis.speak(utterance)
    }, 50)
  }, [rate, getVoice])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  return { speak, stop, speaking }
}
