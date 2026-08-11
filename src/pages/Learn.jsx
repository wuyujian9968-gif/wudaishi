import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { getWordsByUnit, getUnitInfo } from '../data'
import { useProgress } from '../hooks/useProgress'
import { addError, addWordsLearned, addStars, updateDailyLog } from '../db'
import WordCard from '../components/WordCard'
import ProgressBar from '../components/ProgressBar'

export default function Learn() {
  const { grade, unit } = useParams()
  const [semester, unitNum] = unit.split('_')
  const navigate = useNavigate()

  const words = useMemo(() =>
    getWordsByUnit(parseInt(grade), semester, parseInt(unitNum)),
    [grade, semester, unitNum]
  )
  const unitInfo = getUnitInfo(parseInt(grade), semester, parseInt(unitNum))
  const { progressMap, markCorrect, markWrong } = useProgress()

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)
  const [correctIds, setCorrectIds] = useState(new Set())
  const [wrongIds, setWrongIds] = useState(new Set())

  const currentWord = words[index]

  const handleCorrect = async (wordId) => {
    setCorrectIds(prev => new Set([...prev, wordId]))
    await markCorrect(wordId)
    await addWordsLearned(1)
    nextWord()
  }

  const handleWrong = async (wordId) => {
    setWrongIds(prev => new Set([...prev, wordId]))
    await markWrong(wordId)
    const w = words.find(x => x.id === wordId)
    await addError({
      wordId,
      errorType: 'learn',
      unitInfo: w?.unitName || '',
      word: JSON.stringify({ english: w?.english, chinese: w?.chinese })
    })
    await addWordsLearned(1)
    nextWord()
  }

  const nextWord = () => {
    setFlipped(false)
    if (index < words.length - 1) {
      setIndex(index + 1)
    } else {
      setFinished(true)
    }
  }

  const masteredCount = words.filter(w => progressMap[w.id]?.status === 'mastered').length
  const learnedCount = words.filter(w => progressMap[w.id]?.status === 'learning').length

  // Award stars on completion
  useEffect(() => {
    if (finished) {
      const rate = correctIds.size / Math.max(words.length, 1)
      const earnedStars = rate >= 0.9 ? 5 : rate >= 0.7 ? 3 : 1
      addStars(earnedStars, `记单词 ${unitInfo?.unitName || ''}`)
    }
  }, [finished])

  if (finished) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-5xl my-6">🎉</div>
        <h3 className="text-xl font-bold text-gray-800">本轮学习完成！</h3>

        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-600">{correctIds.size}</div>
            <div className="text-sm text-green-500">认识</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-red-500">{wrongIds.size}</div>
            <div className="text-sm text-red-400">不认识</div>
          </div>
        </div>

        {wrongIds.size > 0 && (
          <div className="bg-amber-50 rounded-xl p-4 max-w-sm mx-auto text-left">
            <p className="text-sm font-semibold text-amber-700 mb-2">需要加油的单词：</p>
            <div className="flex flex-wrap gap-1">
              {words.filter(w => wrongIds.has(w.id)).map(w => (
                <span key={w.id} className="bg-white text-amber-800 text-xs px-2 py-1 rounded">
                  {w.english} ({w.chinese})
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center pt-4">
          <button
            onClick={() => { setIndex(0); setFlipped(false); setFinished(false); setCorrectIds(new Set()); setWrongIds(new Set()) }}
            className="px-5 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl font-semibold transition-colors"
          >
            🔄 再来一轮
          </button>
          <Link
            to={`/grade/${grade}/${encodeURIComponent(semester)}`}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
          >
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
        <Link to={`/grade/${grade}/${encodeURIComponent(semester)}`} className="text-indigo-500 hover:text-indigo-700 text-sm">
          ← 返回
        </Link>
        <span className="text-sm text-gray-400">{index + 1} / {words.length}</span>
      </div>

      {/* Unit title */}
      <h3 className="text-center font-semibold text-gray-700">
        {unitInfo?.unitName} - 记单词
      </h3>

      {/* Progress */}
      <ProgressBar
        total={words.length}
        learned={learnedCount}
        mastered={masteredCount}
      />

      {/* Word Card */}
      <div className="pt-2">
        <WordCard
          word={currentWord}
          flipped={flipped}
          onFlip={() => setFlipped(!flipped)}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
      </div>

      {/* Auto-flip hint */}
      {!flipped && (
        <p className="text-center text-xs text-gray-400">
          先自己想一想这个单词的意思，然后点击卡片查看答案 👆
        </p>
      )}
    </div>
  )
}
