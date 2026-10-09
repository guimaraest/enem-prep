export type Subject =
  | 'algebra'
  | 'geometry'
  | 'statistics'
  | 'probability'
  | 'functions'
  | 'financial_math'
  | 'combinatorics'
  | 'arithmetic'

export type Difficulty = 1 | 2 | 3 | 4

export type AlternativeLetter = 'a' | 'b' | 'c' | 'd' | 'e'

export type QuestionSource =
  | 'enem 2018'
  | 'enem 2019'
  | 'enem 2020'
  | 'enem 2021'
  | 'enem 2022'
  | 'enem 2023'
  | 'enem 2024'
  | 'enem 2025'
  | 'autoral'
  | 'test'

export interface File {
  url: string
  type: 'image'
}

export interface Alternative {
  index: AlternativeLetter
  text: string
  file?: File
}

export type Alternatives = Alternative[]

export interface QuestionContent {
  files: File[]
  problem: string
  alternatives: Alternatives
  correctAlternative: AlternativeLetter
  explanation: string
}

export interface Question {
  id: string
  label: string
  title: string
  source: QuestionSource
  difficulty: Difficulty | null
  percentCorrectRate: number | null
  subject: Subject | null
  content: QuestionContent
}

export interface QuestionSummary {
  id: string
  label: string
  title: string
  source: QuestionSource
  difficulty: Difficulty | null
  subject: Subject | null
}

export type Questions = QuestionSummary[]