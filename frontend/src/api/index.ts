import * as questionsImpl from './staticData';
import * as userDataImpl from './userData.ts';
import type {
    Question,
    QuestionAttempt,
    QuestionSummary,
    UserQuestionData,
} from '../models';

export interface Api {
    readonly questions: {
        getAll: () => Promise<QuestionSummary[]>;
        getById: (id: string) => Promise<Question | undefined>;
    };
    readonly userQuestions: {
        getById: (id: string) => UserQuestionData;
        getAll: () => UserQuestionData[];
        setBookmarked: (id: string, isBookmarked: boolean) => void;
    };
    readonly userIndexes: {
        getBookmarkedQuestions: () => Promise<QuestionSummary[]>;
        getMissedQuestions: () => Promise<QuestionSummary[]>;
    };
    readonly attempts: {
        record: (
            id: string,
            attempt: Pick<QuestionAttempt, 'selectedAlternativeIndex' | 'isCorrect'>,
        ) => QuestionAttempt;
        getByQuestionId: (id: string) => QuestionAttempt[];
    };
}

export const api: Api = {
    questions: {
        getAll: questionsImpl.getAllQuestions,
        getById: questionsImpl.getQuestionById,
    },
    userQuestions: {
        getById: userDataImpl.getUserQuestionData,
        getAll: userDataImpl.getAllUserQuestionData,
        setBookmarked: userDataImpl.setQuestionBookmarked,
    },
    userIndexes: {
        getBookmarkedQuestions: userDataImpl.getBookmarkedQuestions,
        getMissedQuestions: userDataImpl.getMissedQuestions,
    },
    attempts: {
        record: userDataImpl.recordAttempt,
        getByQuestionId: userDataImpl.getAttemptsByQuestionId,
    },
};