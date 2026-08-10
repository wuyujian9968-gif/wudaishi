import Dexie from 'dexie'

const db = new Dexie('EnglishLearner')

db.version(1).stores({
  progress: 'wordId, status, nextReview, lastReviewed'
})

// --- Word Progress ---

export async function getWordProgress(wordId) {
  return await db.progress.get(wordId) || null
}

export async function getAllProgress() {
  const all = await db.progress.toArray()
  const map = {}
  all.forEach(p => { map[p.wordId] = p })
  return map
}

export async function saveWordProgress(wordId, data) {
  await db.progress.put({
    wordId,
    status: data.status || 'learning',
    correctCount: data.correctCount || 0,
    wrongCount: data.wrongCount || 0,
    lastReviewed: data.lastReviewed || new Date().toISOString(),
    nextReview: data.nextReview || new Date().toISOString(),
    easeFactor: data.easeFactor || 2.5,
    repetitions: data.repetitions || 0,
  })
}

export async function markWordCorrect(wordId) {
  const existing = await db.progress.get(wordId)
  const count = (existing?.correctCount || 0) + 1
  await db.progress.put({
    wordId,
    status: count >= 3 ? 'mastered' : 'learning',
    correctCount: count,
    wrongCount: existing?.wrongCount || 0,
    lastReviewed: new Date().toISOString(),
    nextReview: existing?.nextReview || new Date().toISOString(),
    easeFactor: existing?.easeFactor || 2.5,
    repetitions: (existing?.repetitions || 0) + 1,
  })
}

export async function markWordWrong(wordId) {
  const existing = await db.progress.get(wordId)
  await db.progress.put({
    wordId,
    status: 'learning',
    correctCount: existing?.correctCount || 0,
    wrongCount: (existing?.wrongCount || 0) + 1,
    lastReviewed: new Date().toISOString(),
    nextReview: new Date().toISOString(), // review soon
    easeFactor: Math.max(1.3, (existing?.easeFactor || 2.5) - 0.2),
    repetitions: 0,
  })
}

export async function updateSpacedRepetition(wordId, { easeFactor, interval, repetitions, nextReview }) {
  const existing = await db.progress.get(wordId)
  const status = repetitions >= 3 ? 'mastered' : 'learning'
  await db.progress.put({
    wordId,
    status,
    correctCount: existing?.correctCount || 0,
    wrongCount: existing?.wrongCount || 0,
    lastReviewed: new Date().toISOString(),
    nextReview,
    easeFactor,
    repetitions,
  })
}

export async function getUnitStats(unitWords) {
  const progressMap = await getAllProgress()
  const total = unitWords.length
  let learned = 0
  let mastered = 0
  unitWords.forEach(w => {
    const p = progressMap[w.id]
    if (p && p.status === 'learning') learned++
    if (p && p.status === 'mastered') mastered++
  })
  return { total, learned, mastered, newCount: total - learned - mastered }
}

export async function clearAllProgress() {
  await db.progress.clear()
}

export default db
