export default function ProgressBar({ total, learned, mastered }) {
  const pct = total > 0 ? Math.round(((learned + mastered) / total) * 100) : 0

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>学习进度</span>
        <span>{learned + mastered} / {total} ({pct}%)</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
        {mastered > 0 && (
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(mastered / total) * 100}%` }}
          />
        )}
        {learned > 0 && (
          <div
            className="h-full bg-yellow-400 transition-all duration-500"
            style={{ width: `${(learned / total) * 100}%` }}
          />
        )}
      </div>
      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> 已掌握 {mastered}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> 学习中 {learned}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block" /> 未学 {total - learned - mastered}</span>
      </div>
    </div>
  )
}
