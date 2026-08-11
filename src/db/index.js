import Dexie from 'dexie'

const db = new Dexie('EnglishLearner')

db.version(2).stores({
  progress: 'wordId, status, nextReview, lastReviewed',
  errors: '++id, wordId, errorType, timestamp, unitInfo',
  dailyLog: 'date, wordsLearned, wordsReviewed, starsEarned',
  starStats: 'key',
}).upgrade(tx => {
  // Migrate from v1 if needed
  return tx.table('progress').toCollection().modify(p => {
    if (!p.repetitions) p.repetitions = 0
    if (!p.easeFactor) p.easeFactor = 2.5
  })
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
  await db.progress.put({ wordId, ...data })
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
    nextReview: new Date().toISOString(),
    easeFactor: Math.max(1.3, (existing?.easeFactor || 2.5) - 0.2),
    repetitions: 0,
  })
}

export async function updateSpacedRepetition(wordId, { easeFactor, interval, repetitions, nextReview }) {
  const existing = await db.progress.get(wordId)
  await db.progress.put({
    wordId,
    status: repetitions >= 3 ? 'mastered' : 'learning',
    correctCount: existing?.correctCount || 0,
    wrongCount: existing?.wrongCount || 0,
    lastReviewed: new Date().toISOString(),
    nextReview, easeFactor, repetitions,
  })
}

// --- Error Book ---
export async function addError({ wordId, errorType, userAnswer, unitInfo, word }) {
  await db.errors.put({
    wordId,
    errorType,       // 'dictation' | 'learn' | 'review'
    userAnswer: userAnswer || '',
    unitInfo: unitInfo || '',
    word: word || '',  // store word data for display
    timestamp: new Date().toISOString(),
    reviewed: false,
    reviewedAt: null,
  })
}

export async function getErrors(type = null) {
  let collection = db.errors.orderBy('timestamp')
  if (type) {
    return await collection.filter(e => e.errorType === type).reverse().toArray()
  }
  return await collection.reverse().toArray()
}

export async function getUnreviewedErrors() {
  return await db.errors.filter(e => !e.reviewed).toArray()
}

export async function markErrorReviewed(errorId) {
  await db.errors.update(errorId, {
    reviewed: true,
    reviewedAt: new Date().toISOString()
  })
}

export async function deleteError(errorId) {
  await db.errors.delete(errorId)
}

export async function getErrorCount() {
  return await db.errors.filter(e => !e.reviewed).count()
}

// --- Daily Log ---
function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export async function getTodayLog() {
  return await db.dailyLog.get(todayStr()) || {
    date: todayStr(),
    wordsLearned: 0,
    wordsReviewed: 0,
    dictationDone: 0,
    starsEarned: 0,
  }
}

export async function updateDailyLog(data) {
  const existing = await getTodayLog()
  await db.dailyLog.put({
    ...existing,
    ...data,
    date: todayStr(),
  })
}

export async function addWordsLearned(count = 1) {
  const log = await getTodayLog()
  log.wordsLearned += count
  await db.dailyLog.put(log)
}

export async function addWordsReviewed(count = 1) {
  const log = await getTodayLog()
  log.wordsReviewed += count
  await db.dailyLog.put(log)
}

export async function addDictationDone() {
  const log = await getTodayLog()
  log.dictationDone += 1
  await db.dailyLog.put(log)
}

export async function getAllDailyLogs() {
  return await db.dailyLog.orderBy('date').reverse().toArray()
}

export async function getConsecutiveDays() {
  const logs = await db.dailyLog.orderBy('date').reverse().toArray()
  if (logs.length === 0) return 0

  let streak = 0
  const today = new Date(todayStr())

  for (let i = 0; i < logs.length; i++) {
    const logDate = new Date(logs[i].date)
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)

    if (logDate.toISOString().slice(0, 10) === expectedDate.toISOString().slice(0, 10)) {
      // Check if they actually did something
      if (logs[i].wordsLearned > 0 || logs[i].wordsReviewed > 0 || logs[i].dictationDone > 0) {
        streak++
      } else if (i === 0) {
        // Today with no activity - don't count
        continue
      } else {
        break
      }
    } else {
      break
    }
  }
  return streak
}

export async function getYesterdayWords() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().slice(0, 10)
  const log = await db.dailyLog.get(dateStr)
  return log || null
}

// --- Stars / Points ---
export async function getStars() {
  const stat = await db.starStats.get('stars')
  return stat?.total || 0
}

export async function addStars(amount, reason = '') {
  const stat = await db.starStats.get('stars')
  const current = stat?.total || 0
  const history = stat?.history || []
  await db.starStats.put({
    key: 'stars',
    total: current + amount,
    history: [...history.slice(-50), { date: todayStr(), amount, reason }]
  })
  // Also update today's log
  const log = await getTodayLog()
  log.starsEarned += amount
  await db.dailyLog.put(log)
  return current + amount
}

export async function getStarHistory() {
  const stat = await db.starStats.get('stars')
  return stat?.history || []
}

export async function getUnitStats(words) {
  const progress = await getAllProgress()
  let mastered = 0, learning = 0, newCount = 0
  words.forEach(w => {
    const p = progress[w.id]
    if (!p || p.status === 'new') newCount++
    else if (p.status === 'mastered') mastered++
    else learning++
  })
  return { total: words.length, mastered, learning, new: newCount }
}

export async function clearAllProgress() {
  await db.progress.clear()
  await db.errors.clear()
  await db.dailyLog.clear()
  await db.starStats.clear()
}

export default db
