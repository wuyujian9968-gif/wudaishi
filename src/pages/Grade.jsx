import { useParams, Link } from 'react-router-dom'
import { gradeData, getWordsByUnit } from '../data'
import { useProgress } from '../hooks/useProgress'
import { useEffect, useState } from 'react'

const modeList = [
  { key: 'learn', label: '📝 记单词', desc: '翻转卡片，记忆单词', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { key: 'dictation', label: '✏️ 默写', desc: '听音写词，检验记忆', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { key: 'review', label: '🔄 复习', desc: '间隔重复，科学复习', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
  { key: 'sentences', label: '💬 句型', desc: '核心句型，填空连词', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
]

const semLabel = { '上': '上学期', '下': '下学期' }

export default function Grade() {
  const { grade, semester } = useParams()
  const gradeNum = parseInt(grade)
  const semesterStr = decodeURIComponent(semester)
  const info = gradeData[gradeNum]
  const { progressMap } = useProgress()
  const [unitStats, setUnitStats] = useState({})

  useEffect(() => {
    const stats = {}
    if (info) {
      const sem = info.semesters[semesterStr]
      if (sem) {
        for (const unit of sem.units) {
          const words = getWordsByUnit(gradeNum, semesterStr, unit)
          let learned = 0, mastered = 0
          words.forEach(w => {
            const p = progressMap[w.id]
            if (p?.status === 'mastered') mastered++
            else if (p?.status === 'learning') learned++
          })
          stats[unit] = {
            total: words.length,
            learned,
            mastered,
            pct: words.length > 0 ? Math.round(((learned + mastered) / words.length) * 100) : 0
          }
        }
      }
    }
    setUnitStats(stats)
  }, [gradeNum, semesterStr, progressMap, info])

  if (!info || !info.semesters[semesterStr]) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-gray-500">年级或学期不存在</p>
        <Link to="/" className="text-indigo-500 hover:text-indigo-700 text-sm">← 返回首页</Link>
      </div>
    )
  }

  const sem = info.semesters[semesterStr]
  const semEmoji = semesterStr === '上' ? '📖' : '📚'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          {info.label} 英语 · {semEmoji} {sem.label}
        </h2>
      </div>

      {/* Switch semester */}
      <div className="flex justify-center gap-2">
        {['上', '下'].map(s => (
          <Link
            key={s}
            to={`/grade/${grade}/${encodeURIComponent(s)}`}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              s === semesterStr
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
            }`}
          >
            {s === '上' ? '📖 上册' : '📚 下册'}
          </Link>
        ))}
      </div>

      {/* Unit cards */}
      <div className="grid gap-3">
        {sem.units.map(unit => {
          const words = getWordsByUnit(gradeNum, semesterStr, unit)
          const stats = unitStats[unit] || { total: 0, learned: 0, mastered: 0, pct: 0 }
          const unitName = words[0]?.unitName || `Unit ${unit}`
          const encodedSemester = encodeURIComponent(semesterStr)

          return (
            <div key={unit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{unitName}</h4>
                <span className="text-xs text-gray-400">{stats.total} 词</span>
              </div>

              {/* Mini progress */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span>已学 {stats.learned + stats.mastered}/{stats.total}</span>
                  <span>{stats.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                  {stats.mastered > 0 && (
                    <div className="h-full bg-green-400 rounded-full" style={{width: `${(stats.mastered/stats.total)*100}%`}} />
                  )}
                  {stats.learned > 0 && (
                    <div className="h-full bg-yellow-400" style={{width: `${(stats.learned/stats.total)*100}%`}} />
                  )}
                </div>
              </div>

              {/* Mode buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {modeList.map(mode => (
                  <Link
                    key={mode.key}
                    to={`/grade/${grade}/${encodedSemester}/unit/${semesterStr}_${unit}/${mode.key}`}
                    className={`text-center py-2 px-1 rounded-lg border text-xs sm:text-sm transition-colors ${mode.color}`}
                  >
                    <div className="text-sm sm:text-base mb-0.5">{mode.label.slice(0, 2)}</div>
                    <span className="text-[10px] sm:text-xs text-gray-500">{mode.label.slice(3)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center pt-2 pb-4">
        <Link to="/" className="text-indigo-500 hover:text-indigo-700 text-sm">← 返回首页</Link>
      </div>
    </div>
  )
}
