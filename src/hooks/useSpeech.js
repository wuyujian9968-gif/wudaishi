import { useCallback, useState, useEffect } from 'react'

const ENGLISH_VOICE_PATTERNS = [
  // Most natural voices first
  'Microsoft Ava',      // Windows 11 - very natural female
  'Microsoft Andrew',   // Windows 11 - very natural male
  'Microsoft Emma',     // Windows 11 - very natural female
  'Microsoft Brian',    // Windows 11 - very natural male
  'Microsoft Sonia',    // Windows - natural female
  'Microsoft Mark',     // Windows - natural male
  'Microsoft Zira',     // Windows - natural female
  'Microsoft David',    // Windows - natural male
  'Google US English',  // Chrome - natural
  'Google UK English Female',
  'Google UK English Male',
  'Samantha',           // macOS - natural female
  'Daniel',             // macOS - natural male (UK)
  'Karen',              // macOS
  'Alex',               // macOS
]

export function useSpeech() {
  const [voiceType, setVoiceType] = useState('en-US')
  const [rate, setRate] = useState(0.85)
  const [speaking, setSpeaking] = useState(false)
  const [availableVoices, setAvailableVoices] = useState([])
  const [selectedVoiceName, setSelectedVoiceName] = useState('auto')

  // Load voices - they load asynchronously
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        const englishVoices = voices.filter(v => v.lang.startsWith('en'))
        setAvailableVoices(englishVoices)

        // Auto-select best voice if not manually chosen
        if (selectedVoiceName === 'auto') {
          // Nothing to do - voice is picked in speak()
        }
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [selectedVoiceName])

  const findBestVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) return null

    // If user picked a specific voice, use it
    if (selectedVoiceName !== 'auto') {
      const found = voices.find(v => v.name === selectedVoiceName)
      if (found) return found
    }

    const englishVoices = voices.filter(v => v.lang.startsWith('en'))

    // Try each preferred voice pattern in order
    for (const pattern of ENGLISH_VOICE_PATTERNS) {
      const match = englishVoices.find(v => v.name.includes(pattern))
      if (match) return match
    }

    // Fallback: prefer US/UK English
    const usVoice = englishVoices.find(v => v.lang === 'en-US')
    if (usVoice) return usVoice
    const ukVoice = englishVoices.find(v => v.lang === 'en-GB')
    if (ukVoice) return ukVoice

    // Last resort: any English voice
    return englishVoices[0] || voices[0]
  }, [selectedVoiceName])

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voiceType
    utterance.rate = rate
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const voice = findBestVoice()
    if (voice) {
      utterance.voice = voice
    }

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [voiceType, rate, findBestVoice])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  return {
    speak, stop, speaking,
    voiceType, setVoiceType,
    rate, setRate,
    availableVoices,
    selectedVoiceName, setSelectedVoiceName
  }
}
