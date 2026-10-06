import * as constants from './constants';

import { questions } from './data';

import type { Question, QuestionSummary } from './models';

class Api {
    baseURL: string;

    constructor() {
        this.baseURL = constants.BASEURL;
    }

    getQuestions(): QuestionSummary[];
    getQuestions(index: number): Question | undefined;

    getQuestions(index?: number) {
        if (index !== undefined) {
            return this.getQuestionByIndex(index);
        }

        return this.getAllQuestions();
    }

    private getQuestionByIndex(index: number) {
        return questions.find((question) => question.index === index);
    }

    private getAllQuestions(): QuestionSummary[] {
        return questions.map(({ index, title, difficulty, subject }) => ({
            index,
            title,
            difficulty,
            subject,
        }));
    }
}

export const api = new Api();