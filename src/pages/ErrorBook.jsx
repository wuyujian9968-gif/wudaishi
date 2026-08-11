import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getErrors, markErrorReviewed, deleteError, getErrorCount } from '../db'
import { useSpeech } from '../hooks/useSpeech'
import { useProgress } from '../hooks/useProgress'

const typeLabels = {
  'dictation': { label: '✏️ 默写错误', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  'learn': { label: '📝 学习标记', color: 'bg-red-50 border-red-200 text-red-700' },
  'review': { label: '🔄 复习忘记', color: 'bg-orange-50 border-orange-200 text-orange-700' },
}

export default function ErrorBook() {
  const [errors, setErrors] = useState([])
  const [filter, setFilter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [practiceMode, setPracticeMode] = useState(false)
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const { speak } = useSpeech()
  const { progressMap } = useProgress()

  const loadErrors = async () => {
    setLoading(true)
    const data = await getErrors(filter)
    setErrors(data)
    setLoading(false)
  }

  useEffect(() => { loadErrors() }, [filter])

  const unreviewed = errors.filter(e => !e.reviewed)
  const reviewed = errors.filter(e => e.reviewed)
  const errorCount = unreviewed.length

  // --- Practice Mode ---
  const startPractice = () => {
    if (unreviewed.length === 0) return
    setPracticeMode(true)
    setPracticeIndex(0)
    setAnswer('')
    setResult(null)
  }

  const currentPractice = practiceMode ? unreviewed[practiceIndex] : null

  const checkAnswer = async () => {
    if (!currentPractice) return
    let wordData
    try { wordData = JSON.parse(currentPractice.word) } catch { wordData = { english: currentPractice.wordId } }
    const correct = answer.trim().toLowerCase() === (wordData.english || '').toLowerCase()
    setResult({ correct, correctAnswer: wordData.english || currentPractice.wordId })
    if (correct) {
      await markErrorReviewed(currentPractice.id)
    }
  }

  const nextPractice = () => {
    setAnswer('')
    setResult(null)
    if (practiceIndex < unreviewed.length - 1) {
      setPracticeIndex(practiceIndex + 1)
    } else {
      setPracticeMode(false)
      loadErrors()
    }
  }

  const handleDelete = async (id) => {
    await deleteError(id)
    loadErrors()
  }

  const handleMarkReviewed = async (id) => {
    await markErrorReviewed(id)
    loadErrors()
  }

  // --- Practice Mode UI ---
  if (practiceMode && currentPractice) {
    let wordData
    try { wordData = JSON.parse(currentPractice.word) } catch { wordData = { english: currentPractice.wordId, chinese: '' } }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setPracticeMode(false)} className="text-indigo-500 text-sm">← 返回错题本</button>
          <span className="text-sm text-gray-400">{practiceIndex + 1} / {unreviewed.length}</span>
        </div>

        <h3 className="text-center font-bold text-gray-700">
          📝 错题订正 · {typeLabels[currentPractice.errorType]?.label}
        </h3>

        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6 text-center space-y-4">
          <p className="text-xs text-gray-400">你之前在这个单词上犯了错，现在重新默写一次</p>
          <div className="text-3xl font-bold text-red-600">{wordData.chinese || '(无中文)'}</div>
          <button onClick={() => speak(wordData.english)} className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center text-xl">
            🔊
          </button>

          <div>
            <input
              type="text"
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setResult(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !result && answer.trim()) checkAnswer() }}
              placeholder="输入英文单词..."
              autoComplete="off" autoCapitalize="off" spellCheck="false"
              className={`w-full max-w-[250px] px-4 py-3 rounded-xl border-2 text-center text-lg font-medium outline-none ${
                result
                  ? result.correct ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
                  : 'border-gray-200 focus:border-indigo-400'
              }`}
              autoFocus
            />
          </div>

          {result ? (
            <div className={`text-sm ${result.correct ? 'text-green-600' : 'text-red-600'}`}>
              {result.correct ? '✅ 这次对了！' : `❌ 正确答案：${result.correctAnswer}`}
              <div className="mt-3">
                <button onClick={nextPractice} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                  {practiceIndex < unreviewed.length - 1 ? '下一题 →' : '🏆 完成订正'}
                </button>
              </div>
            </div>
          ) : (
            answer.trim() && (
              <button onClick={checkAnswer} className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-medium">
                检查
              </button>
            )
          )}
        </div>
      </div>
    )
  }

  // --- Main Error Book UI ---
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-indigo-500 text-sm">← 返回首页</Link>
        {errorCount > 0 && (
          <button
            onClick={startPractice}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-bold shadow-lg transition-colors animate-pulse"
          >
            🔥 订正错题 ({errorCount})
          </button>
        )}
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">📕 改错本</h2>
        <p className="text-xs text-gray-400 mt-1">
          {errorCount > 0 ? `${errorCount} 个待订正错题` : '太棒了，没有错题！🎉'}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex justify-center gap-2">
        {[{ key: null, label: '全部' }, { key: 'dictation', label: '✏️默写' }, { key: 'learn', label: '📝学习' }, { key: 'review', label: '🔄复习' }].map(t => (
          <button
            key={t.key || 'all'}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === t.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Error list */}
      {loading ? (
        <p className="text-center text-gray-400 text-sm py-8">加载中...</p>
      ) : errors.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🌟</div>
          <p className="text-gray-400 text-sm">这里很干净，继续加油！</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Unreviewed first */}
          {unreviewed.map(e => {
            let wordData
            try { wordData = JSON.parse(e.word) } catch { wordData = { english: e.wordId, chinese: '' } }
            return (
              <div key={e.id} className={`rounded-xl border p-3 flex items-center gap-3 ${typeLabels[e.errorType]?.color}`}>
                <span className="text-2xl">{e.errorType === 'dictation' ? '✏️' : e.errorType === 'learn' ? '📝' : '🔄'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{wordData.english || e.wordId}</div>
                  <div className="text-xs opacity-70">{wordData.chinese} · {e.unitInfo}</div>
                  <div className="text-[10px] opacity-50">{new Date(e.timestamp).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleMarkReviewed(e.id)} title="标记已订正" className="px-2 py-1 bg-white/60 rounded text-xs">✅</button>
                  <button onClick={() => handleDelete(e.id)} title="删除" className="px-2 py-1 bg-white/60 rounded text-xs">🗑️</button>
                </div>
              </div>
            )
          })}

          {/* Reviewed (collapsed) */}
          {reviewed.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs text-gray-400 cursor-pointer py-1">已订正 ({reviewed.length})</summary>
              <div className="space-y-1 mt-1 opacity-60">
                {reviewed.slice(0, 20).map(e => {
                  let wordData
                  try { wordData = JSON.parse(e.word) } catch { wordData = { english: e.wordId, chinese: '' } }
                  return (
                    <div key={e.id} className="flex items-center gap-2 text-xs text-gray-500 py-1 px-2 bg-gray-50 rounded">
                      <span>✅</span>
                      <span className="font-medium">{wordData.english || e.wordId}</span>
                      <span className="text-gray-400">{wordData.chinese}</span>
                    </div>
                  )
                })}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
