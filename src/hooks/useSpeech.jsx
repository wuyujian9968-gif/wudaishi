import { useCallback, useState, useEffect, createContext, useContext, useRef } from 'react'

// --- Voice scoring ---
function voiceScore(voice) {
  const name = voice.name.toLowerCase()
  let score = 0
  if (name.includes('natural')) score += 100
  if (name.includes('microsoft') && name.includes('online')) score += 85
  if (name.includes('google')) score += 70
  if (name.includes('microsoft') && !name.includes('mobile')) score += 50
  if (name.includes('samantha') || name.includes('daniel') || name.includes('karen')) score += 60
  if (voice.lang === 'en-US') score += 5
  if (voice.lang === 'en-GB') score += 3
  if (name.includes('mobile')) score -= 50
  return score
}

function isFemaleVoice(voice) {
  const name = voice.name.toLowerCase()
  return name.includes('female') || name.includes('ava') || name.includes('emma')
    || name.includes('zira') || name.includes('samantha') || name.includes('susan')
    || name.includes('linda') || name.includes('catherine') || name.includes('sonia')
    || name.includes('aria') || name.includes('ana') || name.includes('jenny')
}

function isMaleVoice(voice) {
  const name = voice.name.toLowerCase()
  return name.includes('male') || name.includes('andrew') || name.includes('brian')
    || name.includes('david') || name.includes('mark') || name.includes('daniel')
    || name.includes('guy') || name.includes('tom') || name.includes('chris')
    || name.includes('lee') || name.includes('eric')
}

// --- Context ---
const VoiceContext = createContext(null)

export function VoiceProvider({ children }) {
  const [allVoices, setAllVoices] = useState([])
  const [loading, setLoading] = useState(true)
  const loadedRef = useRef(false)
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => {
    return localStorage.getItem('english-learner-voice') || 'auto'
  })
  const [rate, setRate] = useState(() => {
    return parseFloat(localStorage.getItem('english-learner-rate')) || 0.75
  })

  // Aggressively load voices - poll until we get them
  useEffect(() => {
    if (loadedRef.current) return

    let attempts = 0
    const MAX_ATTEMPTS = 30 // 3 seconds max

    const tryLoad = () => {
      attempts++
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        loadedRef.current = true
        setLoading(false)
        const english = voices
          .filter(v => v.lang.startsWith('en'))
          .sort((a, b) => voiceScore(b) - voiceScore(a))
        setAllVoices(english)
        return
      }

      // On Chrome, we need to trigger speech to populate voices
      if (attempts === 1) {
        try {
          const dummy = new SpeechSynthesisUtterance('')
          dummy.volume = 0
          dummy.rate = 2
          window.speechSynthesis.speak(dummy)
        } catch (e) { /* ignore */ }
      }

      if (attempts < MAX_ATTEMPTS) {
        setTimeout(tryLoad, 100)
      } else {
        setLoading(false) // Give up, show what we have
        const voices = window.speechSynthesis.getVoices()
        const english = voices.filter(v => v.lang.startsWith('en'))
        setAllVoices(english)
      }
    }

    // Also listen for the standard event
    const onVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0 && !loadedRef.current) {
        loadedRef.current = true
        setLoading(false)
        const english = voices
          .filter(v => v.lang.startsWith('en'))
          .sort((a, b) => voiceScore(b) - voiceScore(a))
        setAllVoices(english)
      }
    }
    window.speechSynthesis.onvoiceschanged = onVoicesChanged

    // Start polling
    tryLoad()

    return () => {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
    }
  }, [])

  // Persist
  useEffect(() => { localStorage.setItem('english-learner-voice', selectedVoiceName) }, [selectedVoiceName])
  useEffect(() => { localStorage.setItem('english-learner-rate', String(rate)) }, [rate])

  // Organize voices
  const femaleVoices = allVoices.filter(isFemaleVoice)
  const maleVoices = allVoices.filter(isMaleVoice)
  const otherVoices = allVoices.filter(v => !isFemaleVoice(v) && !isMaleVoice(v))

  const topFemale = femaleVoices.slice(0, 5)
  const topMale = maleVoices.slice(0, 5)

  return (
    <VoiceContext.Provider value={{
      selectedVoiceName, setSelectedVoiceName,
      rate, setRate,
      allVoices, loading,
      topFemale, topMale, otherVoices: otherVoices.slice(0, 3),
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

    if (selectedVoiceName !== 'auto') {
      const found = voices.find(v => v.name === selectedVoiceName)
      if (found) return found
    }

    const english = voices
      .filter(v => v.lang.startsWith('en'))
      .sort((a, b) => voiceScore(b) - voiceScore(a))

    return english[0] || voices[0]
  }, [selectedVoiceName])

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return

    const synth = window.speechSynthesis
    synth.cancel()

    // Chrome bug workaround: resume if paused, then create fresh utterance
    const timer = setTimeout(() => {
      // After cancel, Chrome sometimes pauses the synth
      if (synth.paused) {
        synth.resume()
      }

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
      utterance.onend = () => {
        setSpeaking(false)
        // Chrome bug: synth pauses after speaking; resume to keep it alive
        setTimeout(() => {
          if (synth.paused) synth.resume()
        }, 10)
      }
      utterance.onerror = (e) => {
        setSpeaking(false)
        // Retry once on error with a fresh utterance
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          setTimeout(() => {
            const retry = new SpeechSynthesisUtterance(text)
            retry.rate = rate
            retry.pitch = 1.0
            retry.volume = 1.0
            if (voice) { retry.voice = voice; retry.lang = voice.lang }
            else { retry.lang = 'en-US' }
            retry.onstart = () => setSpeaking(true)
            retry.onend = () => setSpeaking(false)
            retry.onerror = () => setSpeaking(false)
            window.speechSynthesis.speak(retry)
          }, 60)
        }
      }

      synth.speak(utterance)
    }, 60)

    return () => clearTimeout(timer)
  }, [rate, getVoice])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  return { speak, stop, speaking }
}
