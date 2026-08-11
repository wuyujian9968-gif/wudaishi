import { grade1Words, grade1Sentences } from './grade1'
import { grade2Words, grade2Sentences } from './grade2'
import { grade3Words, grade3Sentences } from './grade3'
import { grade4Words, grade4Sentences } from './grade4'
import { grade5Words, grade5Sentences } from './grade5'
import { grade6Words, grade6Sentences } from './grade6'

export const allWords = [
  ...grade1Words, ...grade2Words,
  ...grade3Words, ...grade4Words,
  ...grade5Words, ...grade6Words,
]
export const allSentences = [
  ...grade1Sentences, ...grade2Sentences,
  ...grade3Sentences, ...grade4Sentences,
  ...grade5Sentences, ...grade6Sentences,
]

export const gradeData = {
  1: {
    label: '一年级',
    semesters: {
      '上': { label: '上学期', units: [1,2,3,4,5,6,7,8,9,10,11,12] },
      '下': { label: '下学期', units: [1,2,3,4,5,6,7,8,9,10,11,12] }
    }
  },
  2: {
    label: '二年级',
    semesters: {
      '上': { label: '上学期', units: [1,2,3,4,5,6,7,8,9,10,11,12] },
      '下': { label: '下学期', units: [1,2,3,4,5,6,7,8,9,10,11,12] }
    }
  },
  3: {
    label: '三年级',
    semesters: {
      '上': { label: '上学期', units: [1,2,3,4,5,6,7,8] },
      '下': { label: '下学期', units: [1,2,3,4,5,6,7,8,9,10,11,12] }
    }
  },
  4: {
    label: '四年级',
    semesters: {
      '上': { label: '上学期', units: [1,2,3,4,5,6,7,8] },
      '下': { label: '下学期', units: [1,2,3,4,5,6,7,8,9,10,11,12] }
    }
  },
  5: {
    label: '五年级',
    semesters: {
      '上': { label: '上学期', units: [1,2,3,4,5,6,7,8,9,10,11,12] },
      '下': { label: '下学期', units: [1,2,3,4,5,6,7,8,9,10,11,12] }
    }
  },
  6: {
    label: '六年级',
    semesters: {
      '上': { label: '上学期', units: [1,2,3,4,5,6,7,8,9,10,11,12] },
      '下': { label: '下学期', units: [1,2,3,4,5,6,7,8,9,10,11,12] }
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
