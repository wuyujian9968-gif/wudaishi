import { useState, useEffect, useCallback } from 'react'
import {
  getAllProgress, saveWordProgress, markWordCorrect, markWordWrong,
  updateSpacedRepetition, getUnitStats, clearAllProgress
} from '../db'

export function useProgress() {
  const [progressMap, setProgressMap] = useState({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const map = await getAllProgress()
    setProgressMap(map)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const markCorrect = useCallback(async (wordId) => {
    await markWordCorrect(wordId)
    await refresh()
  }, [refresh])

  const markWrong = useCallback(async (wordId) => {
    await markWordWrong(wordId)
    await refresh()
  }, [refresh])

  const updateSR = useCallback(async (wordId, data) => {
    await updateSpacedRepetition(wordId, data)
    await refresh()
  }, [refresh])

  const isWordLearned = useCallback((wordId) => {
    const p = progressMap[wordId]
    return p && (p.status === 'learning' || p.status === 'mastered')
  }, [progressMap])

  const isWordMastered = useCallback((wordId) => {
    const p = progressMap[wordId]
    return p && p.status === 'mastered'
  }, [progressMap])

  return {
    progressMap, loading, refresh,
    markCorrect, markWrong, updateSR,
    isWordLearned, isWordMastered,
    clearAll: clearAllProgress,
    getUnitStats: (words) => getUnitStats(words)
  }
}
