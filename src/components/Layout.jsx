import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">📚</span>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight">小学英语学习助手</h1>
              <p className="text-[10px] sm:text-xs text-indigo-200 leading-tight">三年级 ~ 五年级</p>
            </div>
          </Link>
          {!isHome && (
            <Link
              to="/"
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm transition-colors"
            >
              <span>🏠</span>
              <span className="hidden sm:inline">首页</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 border-t border-indigo-100 py-3 text-center text-xs text-gray-400">
        小学英语学习助手 · PEP人教版（三年级起点）· 深圳
      </footer>
    </div>
  )
}
