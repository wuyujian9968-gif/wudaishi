import { useParams, Link } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { getWordsByUnit, allWords, getUnitInfo } from '../data'
import { useProgress } from '../hooks/useProgress'
import { calculateNextReview } from '../utils/spacedRepetition'
import { addError, addWordsReviewed, addStars } from '../db'
import WordCard from '../components/WordCard'

export default function Review() {
  const { grade, semester: semesterParam, unit } = useParams()
  const { progressMap, updateSR, loading } = useProgress()

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)
  const [rated, setRated] = useState(false)
  const [qualityStats, setQualityStats] = useState([])

  // Get due words
  const dueWords = useMemo(() => {
    if (loading) return []

    if (grade && unit) {
      // Unit-specific review
      const [semester, unitNum] = unit.split('_')
      return getWordsByUnit(parseInt(grade), semester, parseInt(unitNum))
        .filter(w => {
          const p = progressMap[w.id]
          if (!p) return true // never reviewed
          return p.status !== 'mastered' && new Date(p.nextReview) <= new Date()
        })
    }

    // Global review (all grades)
    return allWords.filter(w => {
      const p = progressMap[w.id]
      if (!p) return true
      return p.status !== 'mastered' && new Date(p.nextReview) <= new Date()
    })
  }, [grade, unit, progressMap, loading])

  const unitInfo = grade && unit ? getUnitInfo(parseInt(grade), unit.split('_')[0], parseInt(unit.split('_')[1])) : null

  const handleRate = async (quality) => {
    const word = dueWords[index]
    const existing = progressMap[word.id] || {}
    const sr = calculateNextReview(
      quality,
      existing.easeFactor || 2.5,
      existing.repetitions || 0,
      existing.repetitions || 0
    )
    await updateSR(word.id, sr)

    // Log error if they forgot (quality < 3)
    if (quality < 3) {
      await addError({
        wordId: word.id,
        errorType: 'review',
        unitInfo: word.unitName || '',
        word: JSON.stringify({ english: word.english, chinese: word.chinese })
      })
    }
    await addWordsReviewed(1)

    setQualityStats(prev => [...prev, { word, quality }])
    setRated(false)
    setFlipped(false)

    if (index < dueWords.length - 1) {
      setIndex(index + 1)
    } else {
      setFinished(true)
    }
  }

  // Award stars on finish
  useEffect(() => {
    if (finished) {
      const forgotten = qualityStats.filter(q => q.quality < 3).length
      const remembered = qualityStats.filter(q => q.quality >= 3).length
      const rate = remembered / Math.max(qualityStats.length, 1)
      const earnedStars = rate >= 0.9 ? 5 : rate >= 0.7 ? 3 : 1
      addStars(earnedStars, '复习')
    }
  }, [finished])

  if (loading) {
    return <div className="text-center py-8 text-gray-400">加载中...</div>
  }

  if (dueWords.length === 0) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="text-5xl">🎉</div>
        <h3 className="text-xl font-bold text-gray-800">
          {grade ? '本单元暂无需要复习的单词！' : '太棒了！暂无需要复习的单词！'}
        </h3>
        <p className="text-gray-500 text-sm">所有单词都还没到复习时间，或者你都已经掌握了 👍</p>
        <Link to={grade ? `/grade/${grade}/${encodeURIComponent(semesterParam || '')}` : '/'} className="inline-block px-5 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl font-semibold transition-colors">
          ← 返回
        </Link>
      </div>
    )
  }

  if (finished) {
    const forgotten = qualityStats.filter(q => q.quality < 3).length
    const remembered = qualityStats.filter(q => q.quality >= 3).length

    return (
      <div className="space-y-6 text-center">
        <div className="text-5xl my-6">📊</div>
        <h3 className="text-xl font-bold text-gray-800">复习完成！</h3>
        <p className="text-sm text-gray-500">复习了 {qualityStats.length} 个单词</p>

        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-600">{remembered}</div>
            <div className="text-sm text-green-500">记得</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-red-500">{forgotten}</div>
            <div className="text-sm text-red-400">忘了</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center pt-4">
          <button
            onClick={() => { setIndex(0); setFlipped(false); setFinished(false); setQualityStats([]) }}
            className="px-5 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl font-semibold transition-colors"
          >
            🔄 继续复习
          </button>
          <Link to={grade ? `/grade/${grade}/${encodeURIComponent(semesterParam || '')}` : '/'} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors">
            ← 返回
          </Link>
        </div>
      </div>
    )
  }

  const currentWord = dueWords[index]
  const existing = currentWord ? progressMap[currentWord.id] : null

  if (!currentWord) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-gray-500">暂无复习数据</p>
        <Link to="/" className="text-indigo-500 hover:text-indigo-700 text-sm">← 返回首页</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to={grade ? `/grade/${grade}/${encodeURIComponent(semesterParam || '')}` : '/'} className="text-indigo-500 hover:text-indigo-700 text-sm">← 返回</Link>
        <span className="text-sm text-gray-400">{index + 1} / {dueWords.length}</span>
      </div>

      <h3 className="text-center font-semibold text-gray-700">
        {unitInfo ? `${unitInfo.unitName} - ` : ''}复习
        {existing && (
          <span className="text-xs text-gray-400 ml-2">
            (已复习{existing.repetitions || 0}次)
          </span>
        )}
      </h3>

      {/* Word Card */}
      <WordCard
        word={currentWord}
        flipped={flipped}
        onFlip={() => setFlipped(!flipped)}
        showActions={false}
      />

      {/* Rating */}
      <div className="text-center">
        <p className="text-xs text-gray-400 mb-3">
          先翻转卡片回忆，然后给自己打分 👇
        </p>
        <div className={`grid grid-cols-4 gap-1.5 sm:gap-2 max-w-md mx-auto transition-all duration-300 ${!flipped ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <button
            onClick={() => handleRate(0)}
            className="py-2.5 sm:py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-medium text-xs sm:text-sm transition-colors"
          >
            😫<br/>完全忘了
          </button>
          <button
            onClick={() => handleRate(2)}
            className="py-2.5 sm:py-3 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium text-xs sm:text-sm transition-colors"
          >
            😅<br/>有点难
          </button>
          <button
            onClick={() => handleRate(3)}
            className="py-2.5 sm:py-3 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium text-xs sm:text-sm transition-colors"
          >
            🙂<br/>想起来了
          </button>
          <button
            onClick={() => handleRate(5)}
            className="py-2.5 sm:py-3 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 font-medium text-xs sm:text-sm transition-colors"
          >
            😎<br/>很简单
          </button>
        </div>
      </div>
    </div>
  )
}
