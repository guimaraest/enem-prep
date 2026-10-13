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
        getById: (id: string) => Promise<Question | undefined>;
    };
    readonly userQuestions: {
        getAll: () => Promise<UserQuestionData[]>;
        getById: (id: string) => Promise<UserQuestionData>;       
        setBookmarked: (id: string, isBookmarked: boolean) => Promise<void>;
    };
    readonly userIndexes: {
        getBookmarkedQuestions: () => Promise<QuestionId[]>;
        getMissedQuestions: () => Promise<QuestionId[]>;
    };
    readonly attempts: {
        record: (
            id: string,
            attempt: Pick<QuestionAttempt, 'selectedAlternativeIndex' | 'isCorrect'>,
        ) => Promise<QuestionAttempt>;
        getByQuestionId: (id: string) => Promise<QuestionAttempt[]>;
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