import { useParams, Link } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { getSentencesByUnit, getUnitInfo } from '../data'
import { useSpeech } from '../hooks/useSpeech'

export default function Sentences() {
  const { grade, unit } = useParams()
  const [semester, unitNum] = unit.split('_')
  const sentences = useMemo(() =>
    getSentencesByUnit(parseInt(grade), semester, parseInt(unitNum)),
    [grade, semester, unitNum]
  )
  const unitInfo = getUnitInfo(parseInt(grade), semester, parseInt(unitNum))
  const { speak } = useSpeech()

  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState('learn') // 'learn' | 'fill' | 'scramble'
  const [fillAnswer, setFillAnswer] = useState('')
  const [fillChecked, setFillChecked] = useState(false)
  const [fillCorrect, setFillCorrect] = useState(false)
  const [scrambleWords, setScrambleWords] = useState([])
  const [scrambleAnswer, setScrambleAnswer] = useState([])
  const [scrambleChecked, setScrambleChecked] = useState(false)
  const [scrambleCorrect, setScrambleCorrect] = useState(false)

  const currentSentence = sentences[index]

  if (sentences.length === 0) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="text-5xl">📭</div>
        <h3 className="text-lg font-semibold text-gray-600">本单元暂无句型数据</h3>
        <Link to={`/grade/${grade}/${encodeURIComponent(semester)}`} className="inline-block px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors">
          ← 返回
        </Link>
      </div>
    )
  }

  // --- Fill-in helper ---
  const getFillQuestion = (sentence) => {
    const words = sentence.english.split(' ')
    if (words.length < 3) return { question: sentence.english, answer: words[0], hint: sentence.chinese }
    // Remove one key word (not the first or very short words)
    const keyIndex = words.findIndex((w, i) => i > 0 && w.length > 2)
    const removeIndex = keyIndex > 0 ? keyIndex : Math.min(1, words.length - 1)
    const answer = words[removeIndex]
    const question = words.map((w, i) => i === removeIndex ? '______' : w).join(' ')
    return { question, answer, hint: sentence.chinese }
  }

  // --- Scramble helper (memoized per sentence to keep stable order) ---
  const getScramble = (sentence) => {
    const words = sentence.english.replace(/[.,!?;:'"]/g, '').split(' ')
    // Fisher-Yates shuffle for proper randomization (not biased like sort)
    const shuffled = [...words]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return { words, shuffled }
  }

  const fillData = useMemo(() => getFillQuestion(currentSentence), [currentSentence.id])
  const scrambleData = useMemo(() => getScramble(currentSentence), [currentSentence.id])

  // Reset scramble state when sentence or mode changes
  useEffect(() => {
    setScrambleAnswer([])
    setScrambleChecked(false)
    setScrambleCorrect(false)
  }, [currentSentence.id, mode])

  const handleFillCheck = () => {
    const correct = fillAnswer.trim().toLowerCase() === fillData.answer.toLowerCase()
    setFillCorrect(correct)
    setFillChecked(true)
  }

  const handleScrambleToggle = (word, wordIndex) => {
    if (scrambleChecked) return
    setScrambleAnswer(prev => {
      const existing = prev.findIndex(w => w.idx === wordIndex)
      if (existing >= 0) {
        return prev.filter(w => w.idx !== wordIndex)
      }
      return [...prev, { word, idx: wordIndex }]
    })
  }

  const handleScrambleCheck = () => {
    const userSentence = scrambleAnswer.map(w => w.word).join(' ')
    const correct = userSentence === scrambleData.words.join(' ')
    setScrambleCorrect(correct)
    setScrambleChecked(true)
  }

  const nextSentence = () => {
    setFillAnswer('')
    setFillChecked(false)
    setFillCorrect(false)
    setScrambleAnswer([])
    setScrambleChecked(false)
    setScrambleCorrect(false)
    if (index < sentences.length - 1) {
      setIndex(index + 1)
    }
  }

  const resetMode = () => {
    setFillAnswer('')
    setFillChecked(false)
    setFillCorrect(false)
    setScrambleAnswer([])
    setScrambleChecked(false)
    setScrambleCorrect(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to={`/grade/${grade}/${encodeURIComponent(semester)}`} className="text-indigo-500 hover:text-indigo-700 text-sm">← 返回</Link>
        <span className="text-sm text-gray-400">{index + 1} / {sentences.length}</span>
      </div>

      <h3 className="text-center font-semibold text-gray-700">{unitInfo?.unitName} - 句型练习</h3>

      {/* Mode tabs */}
      <div className="flex justify-center gap-1 bg-gray-100 rounded-xl p-1">
        {[
          { key: 'learn', label: '📖 学习' },
          { key: 'fill', label: '✏️ 填空' },
          { key: 'scramble', label: '🧩 连词成句' },
        ].map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); resetMode() }}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
              mode === m.key ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 min-h-[200px]">
        {/* Learn mode */}
        {mode === 'learn' && (
          <div className="space-y-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-indigo-700 leading-relaxed">
              {currentSentence.english}
            </div>
            <button
              onClick={() => speak(currentSentence.english)}
              className="w-12 h-12 mx-auto rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-xl transition-colors"
            >
              🔊
            </button>
            <div className="text-lg text-gray-600">{currentSentence.chinese}</div>
          </div>
        )}

        {/* Fill mode */}
        {mode === 'fill' && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-gray-400 mb-2">补全句子中缺少的单词</p>
            <div className="text-xl sm:text-2xl font-bold text-gray-800 leading-relaxed">
              {fillData.question}
            </div>
            <p className="text-sm text-gray-500">提示：{fillData.hint}</p>
            <button
              onClick={() => speak(currentSentence.english)}
              className="w-10 h-10 mx-auto rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm transition-colors"
            >
              🔊
            </button>

            <div className="max-w-[200px] mx-auto">
              <input
                type="text"
                value={fillAnswer}
                onChange={(e) => { setFillAnswer(e.target.value); setFillChecked(false) }}
                disabled={fillChecked}
                onKeyDown={(e) => { if (e.key === 'Enter' && !fillChecked && fillAnswer.trim()) handleFillCheck() }}
                placeholder="填写单词..."
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                className={`w-full px-4 py-2.5 rounded-xl border-2 text-center text-lg font-medium outline-none transition-colors ${
                  fillChecked
                    ? fillCorrect ? 'border-green-400 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-700'
                    : 'border-gray-200 focus:border-indigo-400'
                }`}
              />
            </div>

            {fillChecked && (
              <div className={`text-sm ${fillCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {fillCorrect ? '✅ 正确！' : `❌ 正确答案是：${fillData.answer}`}
              </div>
            )}

            {!fillChecked && fillAnswer.trim() && (
              <button onClick={handleFillCheck} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                检查
              </button>
            )}
          </div>
        )}

        {/* Scramble mode */}
        {mode === 'scramble' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400 text-center">点击单词，按正确顺序排列成句子</p>
            <p className="text-sm text-gray-500 text-center">中文：{currentSentence.chinese}</p>

            {/* Answer area */}
            <div className="min-h-[48px] bg-indigo-50 rounded-xl p-3 flex flex-wrap gap-1.5">
              {scrambleAnswer.length === 0 && !scrambleChecked && (
                <span className="text-gray-400 text-sm w-full text-center py-2">点击下方单词排列...</span>
              )}
              {scrambleAnswer.map((w) => (
                <span
                  key={w.idx}
                  onClick={() => !scrambleChecked && handleScrambleToggle(w.word, w.idx)}
                  className={`px-2.5 py-1 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                    scrambleChecked
                      ? scrambleCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      : 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300'
                  }`}
                >
                  {w.word}
                </span>
              ))}
              {scrambleChecked && (
                <div className="w-full text-center text-sm mt-1">
                  {scrambleCorrect ? (
                    <span className="text-green-600">✅ 正确！</span>
                  ) : (
                    <span className="text-red-600">❌ 正确答案：{scrambleData.words.join(' ')}</span>
                  )}
                </div>
              )}
            </div>

            {/* Word bank */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {scrambleData.shuffled.map((word, i) => {
                const isSelected = scrambleAnswer.some(w => w.idx === i)
                return (
                  <button
                    key={i}
                    onClick={() => !scrambleChecked && handleScrambleToggle(word, i)}
                    disabled={scrambleChecked}
                    className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300'
                    } ${scrambleChecked ? 'opacity-60' : ''}`}
                  >
                    {word}
                  </button>
                )
              })}
            </div>

            {scrambleAnswer.length === scrambleData.words.length && !scrambleChecked && (
              <div className="text-center">
                <button onClick={handleScrambleCheck} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                  检查
                </button>
              </div>
            )}

            {!scrambleChecked && scrambleAnswer.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setScrambleAnswer([])}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  清除重来
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => { if (index > 0) { setIndex(index - 1); resetMode() } }}
          disabled={index === 0}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-sm font-medium transition-colors"
        >
          ← 上一句
        </button>

        <span className="text-xs text-gray-400">{index + 1}/{sentences.length}</span>

        {index < sentences.length - 1 ? (
          <button
            onClick={nextSentence}
            className="px-4 py-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-medium transition-colors"
          >
            下一句 →
          </button>
        ) : (
          <Link
            to={`/grade/${grade}/${encodeURIComponent(semester)}`}
            className="px-4 py-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium transition-colors"
          >
            完成 ✓
          </Link>
        )}
      </div>
    </div>
  )
}
