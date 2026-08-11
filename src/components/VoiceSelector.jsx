import { useState } from 'react'
import { useVoiceSettings } from '../hooks/useSpeech'

export default function VoiceSelector() {
  const {
    selectedVoiceName, setSelectedVoiceName,
    rate, setRate,
    loading, topFemale, topMale, otherVoices
  } = useVoiceSettings()
  const [open, setOpen] = useState(false)

  const getLabel = () => {
    if (selectedVoiceName === 'auto') return '🎤 自动'
    const name = selectedVoiceName
    if (name.length <= 12) return '🎤 ' + name
    return '🎤 ' + name.slice(0, 10) + '...'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1.5 rounded-full text-xs transition-colors"
        title="选择发音音色"
      >
        {getLabel()}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] overflow-y-auto">
            {/* Auto option */}
            <div className="p-3 border-b border-gray-100">
              <button
                onClick={() => { setSelectedVoiceName('auto'); setOpen(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedVoiceName === 'auto'
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                🤖 自动选择最佳音色
              </button>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin text-lg mb-2">⏳</div>
                <p className="text-xs text-gray-400">正在加载音色列表...</p>
                <p className="text-[10px] text-gray-300 mt-1">首次加载可能需要几秒</p>
              </div>
            ) : topFemale.length === 0 && topMale.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-gray-400">未找到可用音色</p>
                <p className="text-[10px] text-gray-300 mt-1">请使用 Edge 或 Chrome 浏览器</p>
              </div>
            ) : (
              <>
                {/* Female voices */}
                {topFemale.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-[10px] font-semibold text-pink-500 uppercase mb-1.5">👩‍🏫 女声</p>
                    <div className="space-y-0.5">
                      {topFemale.map(v => (
                        <button
                          key={v.name + v.lang}
                          onClick={() => { setSelectedVoiceName(v.name); setOpen(false) }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            selectedVoiceName === v.name
                              ? 'bg-pink-50 text-pink-700 font-medium'
                              : 'hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {v.name}
                          <span className="text-[10px] text-gray-400 ml-1">({v.lang})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Male voices */}
                {topMale.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-[10px] font-semibold text-blue-500 uppercase mb-1.5">👨‍🏫 男声</p>
                    <div className="space-y-0.5">
                      {topMale.map(v => (
                        <button
                          key={v.name + v.lang}
                          onClick={() => { setSelectedVoiceName(v.name); setOpen(false) }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            selectedVoiceName === v.name
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {v.name}
                          <span className="text-[10px] text-gray-400 ml-1">({v.lang})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other voices */}
                {otherVoices.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">🎙️ 其他</p>
                    <div className="space-y-0.5">
                      {otherVoices.map(v => (
                        <button
                          key={v.name + v.lang}
                          onClick={() => { setSelectedVoiceName(v.name); setOpen(false) }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            selectedVoiceName === v.name
                              ? 'bg-gray-100 text-gray-700 font-medium'
                              : 'hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {v.name}
                          <span className="text-[10px] text-gray-400 ml-1">({v.lang})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Rate control */}
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">⏱️ 语速调节</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">🐢慢</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.2"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 accent-indigo-600 cursor-pointer"
                />
                <span className="text-[10px] text-gray-400">快🐇</span>
                <span className="text-xs font-bold text-indigo-600 w-10 text-right">{rate}x</span>
              </div>
              <p className="text-[10px] text-gray-300 mt-1 text-center">调节后下次朗读生效</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
