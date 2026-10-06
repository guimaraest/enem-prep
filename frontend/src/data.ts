import type { Question } from './models';

export const questions: Question[] = [
    {
        id: 'test-1',
        label: 'test-1',
        title: 'Função linear',
        source: 'test',
        difficulty: 1,
        subject: 'functions',
        content: {
            problem: 'Uma função é definida por $f(x) = 2x + 3$. Qual é o valor de f(4)?',
            files: [],
            alternatives: [
                { index: 'a', text: '7' },
                { index: 'b', text: '9' },
                { index: 'c', text: '11' },
                { index: 'd', text: '12' },
                { index: 'e', text: '14' },
            ],
            correctAlternative: 'c',
            explanation: 'Substituindo $x = 4$, temos $f(4) = 11$.',
        },
    },

    {
        id: 'test-2',
        label: 'test-2',
        title: 'Área de um triângulo',
        source: 'test',
        difficulty: 2,
        subject: 'geometry',
        content: {
            problem:
                'Um triângulo possui base de 8 cm e altura de 5 cm. Qual é sua área?',
            files: [],
            alternatives: [
                { index: 'a', text: '13 cm²' },
                { index: 'b', text: '20 cm²' },
                { index: 'c', text: '26 cm²' },
                { index: 'd', text: '40 cm²' },
                { index: 'e', text: '80 cm²' },
            ],
            correctAlternative: 'b',
            explanation:
                'A área de um triângulo é dada por $A = \\frac{bh}{2}$.',
        },
    },

    {
        id: 'test-3',
        label: 'test-3',
        title: 'Probabilidade',
        source: 'test',
        difficulty: 3,
        subject: 'probability',
        content: {
            problem:
                'Uma caixa contém 3 bolas vermelhas e 2 bolas azuis. Uma bola é retirada ao acaso. Qual é a probabilidade de ela ser azul?',
            files: [],
            alternatives: [
                { index: 'a', text: '1/5' },
                { index: 'b', text: '2/5' },
                { index: 'c', text: '1/2' },
                { index: 'd', text: '3/5' },
                { index: 'e', text: '2/3' },
            ],
            correctAlternative: 'b',
            explanation:
                'Há 2 bolas azuis entre 5 bolas no total. Logo, a probabilidade é 2/5.',
        },
    },
];