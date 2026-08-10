import { Link } from 'react-router-dom'
import { gradeData } from '../data'

const gradeColors = {
  3: 'from-amber-400 to-orange-500 shadow-amber-200',
  4: 'from-emerald-400 to-teal-500 shadow-emerald-200',
  5: 'from-indigo-400 to-purple-500 shadow-indigo-200',
}

const gradeEmojis = { 3: '🌟', 4: '🚀', 5: '💪' }
const gradeDesc = {
  3: '英语启蒙，打好基础',
  4: '稳步提升，积累词汇',
  5: '冲刺准备，全面发展',
}

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-4 sm:py-8">
        <div className="text-5xl sm:text-6xl mb-3">📖</div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          小学英语学习助手
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">
          选择年级，开始学习吧！
        </p>
      </div>

      {/* Grade Cards */}
      <div className="grid gap-4 sm:gap-6">
        {[3, 4, 5].map(grade => (
          <Link
            key={grade}
            to={`/grade/${grade}`}
            className={`block bg-gradient-to-r ${gradeColors[grade]} rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-5xl">{gradeEmojis[grade]}</span>
              <div className="flex-1 text-white">
                <h3 className="text-xl sm:text-2xl font-bold">
                  {gradeData[grade].label}
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  {gradeDesc[grade]}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  上下册 · 每册6个单元
                </p>
              </div>
              <span className="text-white text-2xl sm:text-3xl">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Global review */}
      <div className="text-center pt-2">
        <Link
          to="/review-all"
          className="inline-flex items-center gap-2 bg-white border-2 border-indigo-200 hover:border-indigo-400 text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          📝 全局复习（所有年级到期单词）
        </Link>
      </div>

      {/* Tips */}
      <div className="bg-white/80 rounded-xl p-4 border border-indigo-100">
        <h4 className="font-semibold text-gray-700 mb-2 text-sm">💡 使用提示</h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>· 建议用 <strong>Chrome 或 Edge 浏览器</strong>打开，发音效果最好</li>
          <li>· 学习进度自动保存在浏览器中</li>
          <li>· 复习功能会提醒你哪些单词该复习了</li>
          <li>· 可以把网站添加到手机主屏幕，像 App 一样使用</li>
        </ul>
      </div>
    </div>
  )
}
