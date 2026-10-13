import * as questionsImpl from './staticData';
import * as userDataImpl from './userData.ts';
import type {
    Question,
    QuestionId,
    QuestionAttempt,
    QuestionSummary,
    UserQuestionData,
} from '../models';

export interface Api {
    readonly questions: {
        getAll: () => Promise<QuestionSummary[]>;
        getById: (id: QuestionId) => Promise<Question | undefined>;
    };
    readonly userQuestions: {
        getAll: () => Promise<UserQuestionData[]>;
        getById: (id: QuestionId) => Promise<UserQuestionData>;
        setBookmarked: (id: QuestionId, isBookmarked: boolean) => Promise<void>;
    };
    readonly userIndexes: {
        getBookmarkedQuestions: () => Promise<QuestionId[]>;
        getMissedQuestions: () => Promise<QuestionId[]>;
    };
    readonly attempts: {
        record: (
            id: QuestionId,
            attempt: Pick<QuestionAttempt, 'selectedAlternativeIndex' | 'isCorrect'>,
        ) => Promise<QuestionAttempt>;
        getByQuestionId: (id: QuestionId) => Promise<QuestionAttempt[]>;
    };
}

export const api: Api = {
    questions: {
        getAll: questionsImpl.getAllQuestions,
        getById: questionsImpl.getQuestionById,
    },
    userQuestions: {
        getAll: userDataImpl.getAllUserQuestionData,
        getById: userDataImpl.getUserQuestionData,
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