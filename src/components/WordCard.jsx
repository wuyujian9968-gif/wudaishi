import SpeechBtn from './SpeechBtn'

export default function WordCard({ word, flipped, onFlip, showActions = true, onCorrect, onWrong }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Card */}
      <div
        className={`card-flip cursor-pointer select-none ${flipped ? 'flipped' : ''}`}
        onClick={onFlip}
      >
        <div className="card-flip-inner relative w-full aspect-[4/3]">
          {/* Front - English */}
          <div className="card-front absolute inset-0 bg-white rounded-2xl shadow-lg border-2 border-indigo-100 flex flex-col items-center justify-center p-4">
            <div className="text-4xl sm:text-5xl font-bold text-indigo-700 mb-4 text-center">
              {word.english}
            </div>
            <SpeechBtn text={word.english} />
            <p className="text-gray-400 text-xs mt-3">点击卡片翻转</p>
          </div>

          {/* Back - Chinese */}
          <div className="card-back absolute inset-0 bg-indigo-50 rounded-2xl shadow-lg border-2 border-indigo-200 flex flex-col items-center justify-center p-4">
            <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2 text-center">
              {word.chinese}
            </div>
            <div className="text-lg text-gray-500 mb-4">{word.english}</div>
            <SpeechBtn text={word.english} />
            <p className="text-gray-400 text-xs mt-3">点击卡片翻转</p>
          </div>
        </div>
      </div>

      {/* Unit label */}
      <p className="text-center text-xs text-gray-400 mt-2">{word.unitName}</p>

      {/* Action buttons for learn mode */}
      {showActions && onCorrect && onWrong && (
        <div className="flex gap-3 mt-4 justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); onWrong(word.id) }}
            className="flex-1 max-w-[140px] py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-base transition-colors"
          >
            😕 不认识
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onCorrect(word.id) }}
            className="flex-1 max-w-[140px] py-3 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 font-semibold text-base transition-colors"
          >
            😊 认识了
          </button>
        </div>
      )}
    </div>
  )
}
