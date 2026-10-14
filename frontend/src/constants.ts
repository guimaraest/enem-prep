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
  arithmetic_and_fundamentals: {
    label: 'Aritmética e fundamentos',
    className: 'subject-arithmetic-and-fundamentals',
  },
  statistics_and_data_interpretation: {
    label: 'Estatística e interpretação de dados',
    className: 'subject-statistics-and-data-interpretation',
  },
  algebra_and_equations: {
    label: 'Álgebra e equações',
    className: 'subject-algebra-and-equations',
  },
  functions: {
    label: 'Funções',
    className: 'subject-functions',
  },
  logarithms_and_exponentials: {
    label: 'Logaritmos e exponenciais',
    className: 'subject-logarithms-and-exponentials',
  },
  trigonometry: {
    label: 'Trigonometria',
    className: 'subject-trigonometry',
  },
  plane_geometry: {
    label: 'Geometria plana',
    className: 'subject-plane-geometry',
  },
  solid_and_analytic_geometry: {
    label: 'Geometria espacial e analítica',
    className: 'subject-solid-and-analytic-geometry',
  },
  combinatorics_and_probability: {
    label: 'Combinatória e probabilidade',
    className: 'subject-combinatorics-and-probability',
  },
} as const satisfies Record<
  Subject,
  {
    label: string;
    className: string;
  }
>;