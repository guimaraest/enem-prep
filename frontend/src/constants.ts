import type { Subject, Difficulty } from "./models";

export const BASEURL = 'api/';

export const difficultyMap = {
  1: {
    label: 'Fácil',
    className: 'difficulty-1',
  },
  2: {
    label: 'Médio',
    className: 'difficulty-2',
  },
  3: {
    label: 'Difícil',
    className: 'difficulty-3',
  },
  4: {
    label: 'Avançado',
    className: 'difficulty-4',
  },
} as const satisfies Record<
  Difficulty,
  {
    label: string;
    className: string;
  }
>;

export const subjectMap = {
  algebra: {
    label: 'Álgebra',
    className: 'subject-algebra',
  },
  geometry: {
    label: 'Geometria',
    className: 'subject-geometry',
  },
  statistics: {
    label: 'Estatística',
    className: 'subject-statistics',
  },
  probability: {
    label: 'Probabilidade',
    className: 'subject-probability',
  },
  functions: {
    label: 'Funções',
    className: 'subject-functions',
  },
  financial_math: {
    label: 'Matemática financeira',
    className: 'subject-financial-math',
  },
  combinatorics: {
    label: 'Combinatória',
    className: 'subject-combinatorics',
  },
  arithmetic: {
    label: 'Aritmética',
    className: 'subject-arithmetic',
  },
} as const satisfies Record<
  Subject,
  {
    label: string;
    className: string;
  }
>;