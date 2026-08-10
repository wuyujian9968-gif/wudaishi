import { useParams, Link } from 'react-router-dom'
import { gradeData, getWordsByUnit, getSentencesByUnit } from '../data'
import { useProgress } from '../hooks/useProgress'
import ProgressBar from '../components/ProgressBar'
import { useEffect, useState } from 'react'

const modeList = [
  { key: 'learn', label: '📝 记单词', desc: '翻转卡片，记忆单词', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { key: 'dictation', label: '✏️ 默写', desc: '听音写词，检验记忆', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { key: 'review', label: '🔄 复习', desc: '间隔重复，科学复习', color: 'bg-green-50 border-green-200 hover:bg-green-100' },
  { key: 'sentences', label: '💬 句型', desc: '核心句型，填空连词', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
]

export default function Grade() {
  const { grade } = useParams()
  const gradeNum = parseInt(grade)
  const info = gradeData[gradeNum]
  const { progressMap } = useProgress()
  const [unitStats, setUnitStats] = useState({})

  useEffect(() => {
    const stats = {}
    for (const semester of ['上', '下']) {
      for (const unit of [1,2,3,4,5,6]) {
        const words = getWordsByUnit(gradeNum, semester, unit)
        let learned = 0, mastered = 0
        words.forEach(w => {
          const p = progressMap[w.id]
          if (p?.status === 'mastered') mastered++
          else if (p?.status === 'learning') learned++
        })
        stats[`${semester}_${unit}`] = {
          total: words.length,
          learned,
          mastered,
          pct: words.length > 0 ? Math.round(((learned + mastered) / words.length) * 100) : 0
        }
      }
    }
    setUnitStats(stats)
  }, [gradeNum, progressMap])

  if (!info) {
    return <div className="text-center py-8 text-gray-500">年级不存在</div>
  }

  return (
    <div className="space-y-5">
      {/* Grade header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {info.label} 英语
        </h2>
        <p className="text-gray-500 text-sm mt-1">PEP人教版（三年级起点）</p>
      </div>

      {/* Semester sections */}
      {['上', '下'].map(semester => {
        const sem = info.semesters[semester]
        return (
          <div key={semester} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
              {semester === '上' ? '📖' : '📚'} {sem.label}
            </h3>

            <div className="grid gap-3">
              {sem.units.map(unit => {
                const words = getWordsByUnit(gradeNum, semester, unit)
                const stats = unitStats[`${semester}_${unit}`] || { total: 0, learned: 0, mastered: 0, pct: 0 }
                const unitName = words[0]?.unitName || `Unit ${unit}`

                return (
                  <div key={unit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{unitName}</h4>
                      <span className="text-xs text-gray-400">{stats.total} 个单词</span>
                    </div>

                    {/* Mini progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>已学 {stats.learned + stats.mastered}/{stats.total}</span>
                        <span>{stats.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                        {stats.mastered > 0 && (
                          <div className="h-full bg-green-400" style={{width: `${(stats.mastered/stats.total)*100}%`}} />
                        )}
                        {stats.learned > 0 && (
                          <div className="h-full bg-yellow-400" style={{width: `${(stats.learned/stats.total)*100}%`}} />
                        )}
                      </div>
                    </div>

                    {/* Mode links */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {modeList.map(mode => (
                        <Link
                          key={mode.key}
                          to={`/grade/${grade}/unit/${semester}_${unit}/${mode.key}`}
                          className={`text-center py-2 px-1 rounded-lg border text-xs sm:text-sm transition-colors ${mode.color}`}
                        >
                          <div className="text-base mb-0.5">{mode.label.slice(0, 2)}</div>
                          <span className="text-[10px] sm:text-xs text-gray-500">{mode.label.slice(3)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="text-center pt-2 pb-4">
        <Link to="/" className="text-indigo-500 hover:text-indigo-700 text-sm">
          ← 返回选择年级
        </Link>
      </div>
    </div>
  )
}
