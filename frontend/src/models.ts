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

export interface Alternative {
    index: AlternativeLetter;
    text: string;
}

export type Alternatives = Alternative[];

export interface QuestionContent {
  problem: string
  alternatives: Alternatives
  correctAlternative: AlternativeLetter
  explanation: string
}

export interface Question {
  index: number
  title: string
  difficulty: Difficulty
  subject: Subject
  content: QuestionContent
}

export interface QuestionSummary {
  index: number
  title: string
  difficulty: Difficulty
  subject: Subject
}

export type Questions = QuestionSummary[]