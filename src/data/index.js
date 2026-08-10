import { grade3Words, grade3Sentences } from './grade3'
import { grade4Words, grade4Sentences } from './grade4'
import { grade5Words, grade5Sentences } from './grade5'

export const allWords = [...grade3Words, ...grade4Words, ...grade5Words]
export const allSentences = [...grade3Sentences, ...grade4Sentences, ...grade5Sentences]

export const gradeData = {
  3: {
    label: '三年级',
    semesters: {
      '上': { label: '上学期', units: [1,2,3,4,5,6] },
      '下': { label: '下学期', units: [1,2,3,4,5,6] }
    }
  },
  4: {
    label: '四年级',
    semesters: {
      '上': { label: '上学期', units: [1,2,3,4,5,6] },
      '下': { label: '下学期', units: [1,2,3,4,5,6] }
    }
  },
  5: {
    label: '五年级',
    semesters: {
      '上': { label: '上学期', units: [1,2,3,4,5,6] },
      '下': { label: '下学期', units: [1,2,3,4,5,6] }
    }
  }
}

export function getWordsByUnit(grade, semester, unit) {
  return allWords.filter(w => w.grade === grade && w.semester === semester && w.unit === unit)
}

export function getSentencesByUnit(grade, semester, unit) {
  return allSentences.filter(s => s.grade === grade && s.semester === semester && s.unit === unit)
}

export function getUnitInfo(grade, semester, unit) {
  const word = allWords.find(w => w.grade === grade && w.semester === semester && w.unit === unit)
  return word ? { unitName: word.unitName, unit: word.unit, semester: word.semester } : null
}

export function getWordsByGrade(grade) {
  return allWords.filter(w => w.grade === grade)
}
