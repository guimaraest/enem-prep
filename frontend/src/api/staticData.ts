import { questions } from './data';

import type { Question, QuestionSummary } from '../models';

export function getAllQuestions(): QuestionSummary[] {
    return questions.map(
        ({ id, label, title, source, difficulty, subject }) => ({
            id,
            label,
            title,
            source,
            difficulty,
            subject,
        }),
    );
}

export function getQuestionById(
    id: string,
): Question | undefined {
    return questions.find((question) => question.id === id);
}