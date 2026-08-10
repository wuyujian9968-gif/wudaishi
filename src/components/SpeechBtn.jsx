import { useSpeech } from '../hooks/useSpeech'

export default function SpeechBtn({ text, size = 'md' }) {
  const { speak, speaking } = useSpeech()

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl'
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); speak(text) }}
      disabled={speaking}
      className={`${sizeClasses[size]} rounded-full bg-indigo-100 hover:bg-indigo-200 disabled:bg-indigo-50 flex items-center justify-center transition-all ${speaking ? 'animate-pulse ring-2 ring-indigo-400' : ''}`}
      title="点击朗读"
    >
      🔊
    </button>
  )
}
