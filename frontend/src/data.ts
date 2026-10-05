import type { Question } from './models'

export const questions: Question[] = [
  {
    index: 1,
    title: 'Função linear',
    difficulty: 1,
    subject: 'functions',
    content: {
      problem: 'Uma função é definida por $f(x) = 2x + 3$. Qual é o valor de f(4)?',
      alternatives: {
        a: '7',
        b: '9',
        c: '11',
        d: '12',
        e: '14',
      },
      correctAlternative: 'c',
      explanation: 'Substituindo $x = 4$, temos $f(4) = 11$.',
    },
  },
  {
    index: 2,
    title: 'Área de um triângulo',
    difficulty: 2,
    subject: 'geometry',
    content: {
      problem:
        'Um triângulo possui base de 8 cm e altura de 5 cm. Qual é sua área?',
      alternatives: {
        a: '13 cm²',
        b: '20 cm²',
        c: '26 cm²',
        d: '40 cm²',
        e: '80 cm²',
      },
      correctAlternative: 'b',
      explanation:
        'A área de um triângulo é dada por $A = \\frac{bh}{2}$.',
    },
  },
  {
    index: 3,
    title: 'Probabilidade',
    difficulty: 3,
    subject: 'probability',
    content: {
      problem:
        'Uma caixa contém 3 bolas vermelhas e 2 bolas azuis. Uma bola é retirada ao acaso. Qual é a probabilidade de ela ser azul?',
      alternatives: {
        a: '1/5',
        b: '2/5',
        c: '1/2',
        d: '3/5',
        e: '2/3',
      },
      correctAlternative: 'b',
      explanation:
        'Há 2 bolas azuis entre 5 bolas no total. Logo, a probabilidade é 2/5.',
    },
  },
]