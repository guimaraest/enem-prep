import * as questionsImpl from './staticData';
import * as userDataImpl from './userData.ts';
import * as contextImpl from './context';
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
    readonly context: {
        initialize: (force?: boolean) => Promise<void>;
        getSnapshot: typeof contextImpl.getContextSnapshot;
        subscribe: typeof contextImpl.subscribeToContext;
        setFilterSetting: typeof contextImpl.setFilterSetting;
    };
    readonly nextQuestion: typeof contextImpl.nextQuestion;
    readonly previousQuestion: typeof contextImpl.previousQuestion;
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
        getById: (id) => {
            contextImpl.setCurrentQuestion(id);
            return questionsImpl.getQuestionById(id);
        },
    },
    context: {
        initialize: contextImpl.initializeContext,
        getSnapshot: contextImpl.getContextSnapshot,
        subscribe: contextImpl.subscribeToContext,
        setFilterSetting: contextImpl.setFilterSetting,
    },
    nextQuestion: contextImpl.nextQuestion,
    previousQuestion: contextImpl.previousQuestion,
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