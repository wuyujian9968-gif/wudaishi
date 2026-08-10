import { Link } from 'react-router-dom'
import { gradeData } from '../data'

const bookDesigns = {
  3: {
    spine: 'bg-amber-500',
    cover: 'from-amber-300 via-orange-200 to-amber-100',
    accent: 'bg-amber-600',
    emoji: '🌟',
    subtitle: '英语启蒙·快乐起步',
    topics: '问候 · 颜色 · 身体 · 动物 · 食物 · 数字',
    features: ['认识字母和发音', '日常问候和介绍', '基础颜色和数字', '常见动物和食物'],
  },
  4: {
    spine: 'bg-emerald-500',
    cover: 'from-emerald-300 via-teal-200 to-emerald-100',
    accent: 'bg-emerald-600',
    emoji: '🚀',
    subtitle: '积累词汇·稳步提升',
    topics: '教室 · 家庭 · 天气 · 农场 · 衣服 · 购物',
    features: ['学校场所和课程', '时间和日常作息', '天气和季节表达', '购物和服装描述'],
  },
  5: {
    spine: 'bg-purple-500',
    cover: 'from-purple-300 via-indigo-200 to-purple-100',
    accent: 'bg-purple-600',
    emoji: '💪',
    subtitle: '冲刺提高·全面发展',
    topics: '性格 · 星期 · 美食 · 能力 · 月份 · 规则',
    features: ['描述人物性格', '表达能力和特长', '日期和节日表达', '现在进行时态'],
  },
}

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-3 sm:py-6">
        <div className="inline-flex items-center gap-2 bg-white/80 rounded-full px-4 py-1.5 text-xs text-gray-500 mb-3 border border-gray-100">
          📖 PEP人教版 · 三年级起点
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
          小学英语学习助手
        </h2>
        <p className="text-gray-500 text-sm">
          点击课本封面，开始学习吧！
        </p>
      </div>

      {/* Book Cover Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {[3, 4, 5].map(grade => {
          const design = bookDesigns[grade]
          return (
            <Link
              key={grade}
              to={`/grade/${grade}`}
              className="group block"
            >
              {/* Book cover with 3D effect */}
              <div className="relative">
                {/* Shadow */}
                <div className="absolute -bottom-2 left-2 right-2 h-4 bg-black/10 rounded-full blur-md group-hover:blur-lg transition-all" />

                {/* Book body */}
                <div className={`relative bg-gradient-to-br ${design.cover} rounded-r-xl rounded-l-sm shadow-lg border-r-2 border-b-2 border-black/10 overflow-hidden group-hover:shadow-xl group-hover:-translate-y-1 transition-all`}>
                  {/* Spine effect on left */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${design.spine} rounded-l-sm`} />

                  {/* Content area */}
                  <div className="pl-5 pr-4 py-4 sm:py-5">
                    {/* Top label */}
                    <div className={`inline-block ${design.accent} text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full mb-2 font-medium`}>
                       PEP
                    </div>

                    {/* Grade number */}
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-3xl sm:text-4xl font-black text-gray-800 leading-none">
                        {gradeData[grade].label}
                      </span>
                      <span className="text-lg sm:text-xl font-bold text-gray-500 leading-none">
                        英语
                      </span>
                    </div>

                    {/* Emoji */}
                    <div className="text-4xl sm:text-5xl my-2 sm:my-3 text-center">
                      {design.emoji}
                    </div>

                    {/* Subtitle */}
                    <p className="text-[10px] sm:text-xs text-gray-500 text-center mb-2 font-medium">
                      {design.subtitle}
                    </p>

                    {/* Topics */}
                    <div className={`${design.accent} text-white text-[9px] sm:text-[10px] rounded-lg px-2 py-1.5 text-center leading-relaxed opacity-90`}>
                      {design.topics}
                    </div>

                    {/* Features list */}
                    <ul className="mt-2.5 space-y-0.5">
                      {design.features.map((f, i) => (
                        <li key={i} className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-gray-400" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* Click hint */}
                    <div className="text-center mt-3 text-[10px] text-gray-400 group-hover:text-indigo-500 transition-colors">
                      点击进入 →
                    </div>
                  </div>

                  {/* Decorative corner fold */}
                  <div className="absolute -top-0.5 -right-0.5 w-8 h-8">
                    <div className={`absolute top-0 right-0 w-0 h-0 border-t-[16px] border-l-[16px] border-t-white border-l-transparent rounded-tr-xl`} />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
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
          <li>· 右上角 🎤 可以选择发音音色和调整语速</li>
          <li>· 建议用 <strong>Edge 或 Chrome 浏览器</strong>打开，Edge 的语音更自然</li>
          <li>· 学习进度自动保存在浏览器中</li>
          <li>· 可以把网站添加到手机主屏幕，像 App 一样使用</li>
        </ul>
      </div>
    </div>
  )
}
