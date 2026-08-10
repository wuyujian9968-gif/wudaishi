import { useParams, Link } from 'react-router-dom'
import { useState, useMemo, useRef } from 'react'
import { getWordsByUnit, getUnitInfo } from '../data'
import { useSpeech } from '../hooks/useSpeech'
import { useProgress } from '../hooks/useProgress'

export default function Dictation() {
  const { grade, unit } = useParams()
  const [semester, unitNum] = unit.split('_')
  const words = useMemo(() =>
    getWordsByUnit(parseInt(grade), semester, parseInt(unitNum)),
    [grade, semester, unitNum]
  )
  const unitInfo = getUnitInfo(parseInt(grade), semester, parseInt(unitNum))
  const { speak } = useSpeech()
  const { markCorrect, markWrong } = useProgress()

  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [results, setResults] = useState([])
  const [finished, setFinished] = useState(false)
  const [mode, setMode] = useState('listen') // 'listen' | 'chinese'
  const inputRef = useRef(null)

  const currentWord = words[index]

  const handleSubmit = async () => {
    const trimmed = answer.trim().toLowerCase()
    const correct = trimmed === currentWord.english.toLowerCase()
    setIsCorrect(correct)
    setSubmitted(true)

    if (correct) {
      await markCorrect(currentWord.id)
    } else {
      await markWrong(currentWord.id)
    }
    setResults(prev => [...prev, { word: currentWord, userAnswer: trimmed, correct }])
  }

  const handleNext = () => {
    setAnswer('')
    setSubmitted(false)
    setIsCorrect(false)

    if (index < words.length - 1) {
      setIndex(index + 1)
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setFinished(true)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (submitted) handleNext()
      else if (answer.trim()) handleSubmit()
    }
  }

  const correctCount = results.filter(r => r.correct).length
  const wrongList = results.filter(r => !r.correct)

  if (finished) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-5xl my-6">{correctCount === words.length ? '🏆' : '📝'}</div>
        <h3 className="text-xl font-bold text-gray-800">默写完成！</h3>

        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-600">{correctCount}</div>
            <div className="text-sm text-green-500">正确</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-red-500">{wrongList.length}</div>
            <div className="text-sm text-red-400">错误</div>
          </div>
        </div>

        {wrongList.length > 0 && (
          <div className="bg-white rounded-xl border border-red-100 p-4 max-w-sm mx-auto text-left">
            <p className="text-sm font-semibold text-red-600 mb-2">❌ 需要订正的单词：</p>
            <div className="space-y-2">
              {wrongList.map((r, i) => (
                <div key={i} className="text-sm">
                  <span className="text-gray-600">{r.word.chinese}</span>
                  <span className="mx-2">→</span>
                  <span className="text-red-500 line-through">{r.userAnswer || '(空)'}</span>
                  <span className="mx-1">→</span>
                  <span className="text-green-600 font-semibold">{r.word.english}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center pt-4">
          <button
            onClick={() => { setIndex(0); setAnswer(''); setSubmitted(false); setResults([]); setFinished(false) }}
            className="px-5 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl font-semibold transition-colors"
          >
            🔄 再来一轮
          </button>
          <Link to={`/grade/${grade}`} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors">
            ← 返回
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to={`/grade/${grade}`} className="text-indigo-500 hover:text-indigo-700 text-sm">← 返回</Link>
        <span className="text-sm text-gray-400">{index + 1} / {words.length}</span>
      </div>

      <h3 className="text-center font-semibold text-gray-700">{unitInfo?.unitName} - 默写</h3>

      {/* Mode switch */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setMode('listen')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${mode === 'listen' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          🎧 听音写词
        </button>
        <button
          onClick={() => setMode('chinese')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${mode === 'chinese' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          🇨🇳 看中文写词
        </button>
      </div>

      {/* Prompt */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
        {mode === 'listen' ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">点击喇叭听发音，写出单词</p>
            <button
              onClick={() => speak(currentWord.english)}
              className="w-16 h-16 mx-auto rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-2xl transition-colors"
            >
              🔊
            </button>
            <p className="text-xs text-gray-400">可以多次点击</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">根据中文意思，写出英文单词</p>
            <div className="text-3xl font-bold text-indigo-600">{currentWord.chinese}</div>
            <button
              onClick={() => speak(currentWord.english)}
              className="w-10 h-10 mx-auto rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm transition-colors"
              title="听发音提示"
            >
              🔊
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div>
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={submitted}
          placeholder="在这里输入英文单词..."
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          className={`w-full px-4 py-3 rounded-xl border-2 text-center text-lg font-medium outline-none transition-colors ${
            submitted
              ? isCorrect
                ? 'border-green-400 bg-green-50 text-green-700'
                : 'border-red-400 bg-red-50 text-red-700'
              : 'border-gray-200 focus:border-indigo-400'
          }`}
          autoFocus
        />
      </div>

      {/* Result feedback */}
      {submitted && (
        <div className={`text-center p-3 rounded-xl ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isCorrect ? (
            <p>✅ 正确！<span className="font-bold ml-1">{currentWord.english}</span></p>
          ) : (
            <div>
              <p className="mb-1">❌ 正确答案是：</p>
              <p className="text-xl font-bold">{currentWord.english}</p>
              <p className="text-sm opacity-75">{currentWord.chinese}</p>
            </div>
          )}
          <button
            onClick={handleNext}
            className="mt-2 px-4 py-1.5 bg-white rounded-lg text-sm font-medium shadow-sm hover:shadow transition-shadow"
          >
            {index < words.length - 1 ? '下一题 →' : '查看结果'}
          </button>
        </div>
      )}

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold transition-colors"
        >
          确认提交
        </button>
      )}
    </div>
  )
}
