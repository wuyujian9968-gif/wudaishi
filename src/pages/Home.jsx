import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getConsecutiveDays, getStars, getErrorCount, getTodayLog, getYesterdayWords, getAllDailyLogs } from '../db'

const gradeInfo = {
  1: { color: '#F59E0B', bg: 'from-amber-100 via-orange-50 to-yellow-100', spine: 'bg-amber-500', badge: 'bg-amber-600', emoji: '🌱', desc: '你好 · 数字 · 颜色 · 水果 · 动物 · 家庭', badgeText: '预备级' },
  2: { color: '#10B981', bg: 'from-emerald-100 via-green-50 to-teal-100', spine: 'bg-emerald-500', badge: 'bg-emerald-600', emoji: '🌿', desc: '天气 · 季节 · 活动 · 衣服 · 食物 · 交通', badgeText: '预备级' },
  3: { color: '#3B82F6', bg: 'from-blue-100 via-sky-50 to-indigo-100', spine: 'bg-blue-500', badge: 'bg-blue-600', emoji: '📘', desc: '情感 · 数字 · 颜色 · 动物 · 食物 · 身体', badgeText: '起点' },
  4: { color: '#8B5CF6', bg: 'from-violet-100 via-purple-50 to-fuchsia-100', spine: 'bg-violet-500', badge: 'bg-violet-600', emoji: '📙', desc: '城市 · 动物 · 家庭 · 衣服 · 食物 · 学校', badgeText: '进阶' },
  5: { color: '#EC4899', bg: 'from-pink-100 via-rose-50 to-red-100', spine: 'bg-pink-500', badge: 'bg-pink-600', emoji: '📕', desc: '未来 · 朋友 · 城市 · 自然 · 安全 · 环保', badgeText: '提升' },
  6: { color: '#EF4444', bg: 'from-red-100 via-orange-50 to-amber-100', spine: 'bg-red-500', badge: 'bg-red-600', emoji: '🎓', desc: '成长 · 健康 · 世界 · 科学 · 文化 · 地球', badgeText: '毕业' },
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

export default function Home() {
  const [streak, setStreak] = useState(0)
  const [stars, setStars] = useState(0)
  const [errors, setErrors] = useState(0)
  const [todayLog, setTodayLog] = useState(null)
  const [yesterdayWords, setYesterdayWords] = useState(null)
  const [weekLogs, setWeekLogs] = useState([])

  useEffect(() => {
    (async () => {
      const [s, st, e, t, y, all] = await Promise.all([
        getConsecutiveDays(),
        getStars(),
        getErrorCount(),
        getTodayLog(),
        getYesterdayWords(),
        getAllDailyLogs(),
      ])
      setStreak(s)
      setStars(st)
      setErrors(e)
      setTodayLog(t)
      setYesterdayWords(y)
      const last7 = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const ds = d.toISOString().slice(0, 10)
        const log = all.find(l => l.date === ds)
        last7.push({ date: ds, day: d.getDate(), weekday: weekDays[d.getDay()], active: !!(log && (log.wordsLearned > 0 || log.wordsReviewed > 0 || log.dictationDone > 0)), stars: log?.starsEarned || 0 })
      }
      setWeekLogs(last7)
    })()
  }, [])

  const todayDone = todayLog && (todayLog.wordsLearned > 0 || todayLog.wordsReviewed > 0 || todayLog.dictationDone > 0)

  return (
    <div className="space-y-5">
      {/* --- 游戏化状态栏 --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl">🔥</div>
            <div className="text-xl font-black text-orange-500">{streak}</div>
            <div className="text-[10px] text-gray-400">连续天数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">⭐</div>
            <div className="text-xl font-black text-amber-500">{stars}</div>
            <div className="text-[10px] text-gray-400">总积分</div>
          </div>
          <div className="text-center">
            <Link to="/error-book" className="block">
              <div className="text-2xl">{errors > 0 ? '📕' : '✅'}</div>
              <div className={`text-xl font-black ${errors > 0 ? 'text-red-500' : 'text-green-500'}`}>{errors}</div>
              <div className="text-[10px] text-gray-400">待订正</div>
            </Link>
          </div>
          <div className="text-center">
            <div className="text-2xl">{todayDone ? '🏆' : '🎯'}</div>
            <div className={`text-xl font-black ${todayDone ? 'text-green-500' : 'text-gray-400'}`}>
              {todayDone ? '已打卡' : '未打卡'}
            </div>
            <div className="text-[10px] text-gray-400">今日</div>
          </div>
        </div>

        {/* 周迷你日历 */}
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex justify-between gap-1">
            {weekLogs.map((d, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="text-[9px] text-gray-400">{d.weekday}</div>
                <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                  d.active ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {d.day}
                </div>
                {d.stars > 0 && <div className="text-[9px] text-amber-500">+{d.stars}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* 昨日提醒 */}
        {yesterdayWords && !todayDone && (
          <div className="mt-3 bg-amber-50 rounded-xl p-3 text-sm">
            <p className="text-amber-700 font-medium">💡 昨天学了 {yesterdayWords.wordsLearned + yesterdayWords.wordsReviewed} 个单词</p>
            <p className="text-amber-600 text-xs mt-0.5">建议先复习一下昨天的内容，再学新的！</p>
            <Link to="/review-all" className="inline-block mt-2 text-xs bg-amber-200 hover:bg-amber-300 text-amber-800 px-3 py-1.5 rounded-full font-medium transition-colors">
              🔄 快速复习 →
            </Link>
          </div>
        )}
      </div>

      {/* 标题 */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-4 py-1 text-xs text-gray-500 border shadow-sm mb-2">
          📖 <span className="font-medium">2026 沪教牛津</span> · 深圳专用版
        </div>
        <h2 className="text-xl font-bold text-gray-800">小学英语学习助手</h2>
        <p className="text-xs text-gray-400 mt-1">一年级 ~ 六年级 · 上下册全覆盖</p>
      </div>

      {/* 课本封面 - 2行x3列 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map(grade => {
          const info = gradeInfo[grade]
          return (
            <div key={grade} className="flex flex-col items-center space-y-2">
              <div className="relative w-full max-w-[180px]">
                <div className="absolute -bottom-2 left-3 right-3 h-4 bg-black/10 rounded-full blur-md" />
                <div className={`relative bg-gradient-to-br ${info.bg} rounded-r-xl rounded-l-[4px] shadow-lg border-r-2 border-b-[3px] border-black/10 overflow-hidden`}
                  style={{ aspectRatio: '3/4' }}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[6px] ${info.spine} rounded-l-[2px]`} />
                  <div className="pl-4 pr-3 py-3 h-full flex flex-col">
                    <div className={`self-start ${info.badge} text-white text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wide mb-1.5`}>{info.badgeText}</div>
                    <div className="w-6 h-0.5 bg-gray-300 mb-1.5" />
                    <div className="text-center mb-1.5">
                      <div className="text-[22px] sm:text-[28px] font-black text-gray-800 leading-none">英语</div>
                      <div className="text-sm font-bold text-gray-600 mt-0.5">{grade}年级</div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-1">{info.emoji}</div>
                        <p className="text-[7px] text-gray-500 leading-relaxed">{info.desc}</p>
                      </div>
                    </div>
                    <div className="text-center mt-auto">
                      <p className="text-[7px] text-gray-300 mt-0.5">上海教育出版社</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 w-full max-w-[180px]">
                <Link to={`/grade/${grade}/${encodeURIComponent('上')}`} className="flex-1 text-center py-2 rounded-lg bg-white border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-gray-700 font-semibold text-xs transition-all shadow-sm">
                  📖 上册
                </Link>
                <Link to={`/grade/${grade}/${encodeURIComponent('下')}`} className="flex-1 text-center py-2 rounded-lg bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 font-semibold text-xs transition-all shadow-sm">
                  📚 下册
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* 快捷入口 */}
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/review-all" className="inline-flex items-center gap-1.5 bg-white border-2 border-indigo-200 hover:border-indigo-400 text-indigo-600 font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-sm">
          📝 全局复习
        </Link>
        <Link to="/error-book" className={`inline-flex items-center gap-1.5 border-2 font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-sm ${
          errors > 0 ? 'bg-red-50 border-red-300 hover:border-red-400 text-red-600 animate-pulse' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600'
        }`}>
          📕 改错本{errors > 0 ? ` (${errors})` : ''}
        </Link>
      </div>

      {/* 提示 */}
      <div className="bg-white/80 rounded-xl p-3 border border-indigo-100 max-w-xl mx-auto">
        <ul className="text-[10px] text-gray-400 space-y-0.5">
          <li>🎤 右上角可选男/女声 | ⭐ 每天学习赚积分 | 🔥 连续打卡有惊喜</li>
          <li>📖 沪教牛津深圳专用版 · 覆盖1-6年级全部上下册 | 📕 错题自动收集到改错本</li>
        </ul>
      </div>
    </div>
  )
}
