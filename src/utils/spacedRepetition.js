// Simple SM-2 spaced repetition algorithm
// https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm

export function calculateNextReview(quality, prevEaseFactor = 2.5, prevInterval = 0, repetitions = 0) {
  let newEF = prevEaseFactor
  let newInterval = 0
  let newRepetitions = repetitions

  // quality: 0-5 (0=forgot, 3=hard, 4=good, 5=easy)
  if (quality < 3) {
    // Failed recall - reset
    newRepetitions = 0
    newInterval = 1 // review again tomorrow
  } else {
    // Successful recall
    newRepetitions = repetitions + 1

    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 3 // was 6, shortened for kids
    } else {
      newInterval = Math.round(prevInterval * prevEaseFactor)
    }

    // Cap max interval at 90 days for kids
    if (newInterval > 90) newInterval = 90
  }

  // Update ease factor
  newEF = prevEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (newEF < 1.3) newEF = 1.3

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + newInterval)

  return {
    easeFactor: Math.round(newEF * 100) / 100,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview: nextReview.toISOString()
  }
}

export function getDueWords(progressMap, allWords) {
  const now = new Date().toISOString()
  return allWords.filter(w => {
    const p = progressMap[w.id]
    if (!p) return true // never reviewed - due now
    if (p.status === 'mastered') return false
    return p.nextReview <= now
  })
}

export function getQualityLabel(quality) {
  const labels = ['忘记', '困难', '良好', '简单']
  return labels[quality - 2] || '未知'
}
