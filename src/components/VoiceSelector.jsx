import { useState } from 'react'
import { useVoiceSettings } from '../hooks/useSpeech'

export default function VoiceSelector() {
  const { selectedVoiceName, setSelectedVoiceName, rate, setRate, topVoices } = useVoiceSettings()
  const [open, setOpen] = useState(false)

  const currentLabel = selectedVoiceName === 'auto'
    ? '🎤 自动'
    : '🎤 ' + (topVoices.find(v => v.name === selectedVoiceName)?.name?.slice(0, 10) || '已选')

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1.5 rounded-full text-xs transition-colors"
        title="选择发音音色"
      >
        {currentLabel}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-700 mb-2">🎙️ 选择音色</p>

              {/* Auto option */}
              <button
                onClick={() => { setSelectedVoiceName('auto'); setOpen(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-2 transition-colors ${
                  selectedVoiceName === 'auto'
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                🤖 自动选择最佳音色
              </button>

              {/* Voice list */}
              {topVoices.length === 0 ? (
                <p className="text-xs text-gray-400 px-3 py-2">正在加载音色列表...</p>
              ) : (
                <div className="space-y-0.5 max-h-48 overflow-y-auto">
                  {topVoices.map(v => (
                    <button
                      key={v.name + v.lang}
                      onClick={() => { setSelectedVoiceName(v.name); setOpen(false) }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        selectedVoiceName === v.name
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{v.name}</span>
                        <span className="text-[10px] text-gray-400 ml-2 shrink-0">{v.lang}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rate control */}
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">⏱️ 语速</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">慢</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.2"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 accent-indigo-600"
                />
                <span className="text-[10px] text-gray-400">快</span>
                <span className="text-xs font-medium text-indigo-600 w-8 text-right">{rate}x</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
