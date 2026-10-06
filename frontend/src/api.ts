import * as constants from './constants';

import { questions } from './data';

import type { Question, QuestionSummary } from './models';

class Api {
    baseURL: string;

    constructor() {
        this.baseURL = constants.BASEURL;
    }

    getQuestions(): QuestionSummary[] {
        return this.getAllQuestions();
    }

    getQuestion(id: string): Question | undefined {
        return questions.find((question) => question.id === id);
    }

    private getAllQuestions(): QuestionSummary[] {
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
}

export const api = new Api();