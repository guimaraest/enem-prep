import generatedQuestions from './generated/questions.json';
import generatedIndexes from './generated/questions.index.json';

import type { Question, QuestionSource, QuestionSummary } from '../models';

const questions = generatedQuestions as Question[];
const questionIndex = generatedIndexes as {
    byId: Record<string, number>;
    bySource: Partial<Record<QuestionSource, number[]>>;
};

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
    const position = questionIndex.byId[id];
    return position === undefined ? undefined : questions[position];
}

export function getQuestionsBySource(
    source: QuestionSource,
): QuestionSummary[] {
    return (questionIndex.bySource[source] ?? []).map((position) => {
        const { id, label, title, source, difficulty, subject } =
            questions[position];

        return { id, label, title, source, difficulty, subject };
    });
}
