export type UUID = string & { readonly __brand: 'UUID' };
export type QuestionId = UUID;

export function parseUUID(value: string): UUID {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  ) {
    throw new Error('Invalid UUID');
  }

  return value as UUID;
}

export const SUBJECTS = [
  "arithmetic_and_fundamentals",
  "statistics_and_data_interpretation",
  "algebra_and_equations",
  "functions",
  "logarithms_and_exponentials",
  "trigonometry",
  "plane_geometry",
  "solid_and_analytic_geometry",
  "combinatorics_and_probability",
] as const

export type Subject = (typeof SUBJECTS)[number]

export const DIFFICULTIES = [1, 2, 3, 4] as const

export type Difficulty = (typeof DIFFICULTIES)[number]

export type QuestionSource =
  | 'enem 2009'
  | 'enem 2010'
  | 'enem 2011'
  | 'enem 2012'
  | 'enem 2013'
  | 'enem 2014'
  | 'enem 2015'
  | 'enem 2016'
  | 'enem 2017'
  | 'enem 2018'
  | 'enem 2019'
  | 'enem 2020'
  | 'enem 2021'
  | 'enem 2022'
  | 'enem 2023'
  | 'enem 2024'
  | 'enem 2025'
  | 'autoral'
  | 'test';

export interface File {
  url: string
  type: 'image'
}

export type AlternativeLetter = 'a' | 'b' | 'c' | 'd' | 'e'

export interface Alternative {
  index: AlternativeLetter
  text: string
  file?: File
}

export interface QuestionContent {
  files: File[]
  problem: string
  command: string | null
  alternatives: Alternative[]
  correctAlternative: AlternativeLetter
  explanation: string
}

export interface Question {
  id: UUID
  label: number
  title: string
  source: QuestionSource
  difficulty: Difficulty | null
  percentCorrectRate: number | null
  subject: Subject | null
  content: QuestionContent
}

export type QuestionSummary = Omit<Question, 'content'> & {
  isMissed: boolean;
  isBookmarked: boolean;
};

export interface QuestionAttempt {
  index: number;
  selectedAlternativeIndex: Alternative['index'];
  isCorrect: boolean;
  attemptedAt: string;
}

export interface UserQuestionData {
    questionId: UUID;
    isBookmarked: boolean;
    attempts: QuestionAttempt[];
}

export interface Exam {
  examId: UUID
  type: 'autoral' | 'official-inep'
  year: string | null
  content: QuestionSummary[]
}