import * as questionsImpl from './questions';
import * as userQuestionsImpl from './userQuestions.ts';
import * as contextImpl from './questionsContext';
import * as userExamsContextImpl from './userExamsContext';
import * as userExamsImpl from './userExams';
import type { FilterSetting, QuestionsContextSnapshot } from './questionsContext';
import type { UserExamsSnapshot } from './userExamsContext';
import type { UserExamRecord } from './userExams';
import type {
    UUID,
    Question,
    QuestionId,
    QuestionAttempt,
    QuestionSummary,
    UserQuestionData,
    Exam,
} from '../models';

export interface Api {
    readonly questions: {
        getAll: () => Promise<QuestionSummary[]>;
        getById: (id: QuestionId) => Promise<Question | undefined>;
    };
    readonly questionsContext: {
        initialize: (force?: boolean) => Promise<void>;
        getSnapshot: () => QuestionsContextSnapshot;
        subscribe: (listener: () => void) => () => void;
        setFilterSetting: (filterSetting: FilterSetting) => void;
        setCurrentQuestion: (questionId: QuestionId) => void;
        nextQuestion: () => Promise<QuestionId | undefined>;
        previousQuestion: () => Promise<QuestionId | undefined>;
    };
    readonly userQuestions: {
        getAll: () => Promise<UserQuestionData[]>;
        getById: (id: QuestionId) => Promise<UserQuestionData>;
        setBookmarked: (id: QuestionId, isBookmarked: boolean) => Promise<void>;
        getBookmarkedIds: () => Promise<QuestionId[]>;
        getMissedIds: () => Promise<QuestionId[]>;
        readonly attempts: {
            record: (
                id: QuestionId,
                attempt: Pick<QuestionAttempt, 'selectedAlternativeIndex' | 'isCorrect'>,
            ) => Promise<QuestionAttempt>;
            getByQuestionId: (id: QuestionId) => Promise<QuestionAttempt[]>;
        };
    };
    readonly exams: {
        getAll: () => Promise<Exam[]>;
        getById: (id: UUID) => Promise<Exam | undefined>;
    };
    readonly userExams: {
        readonly context: {
            initialize: () => Promise<void>;
            getSnapshot: () => UserExamsSnapshot;
            subscribe: (listener: () => void) => () => void;
        };
        getAll: () => Promise<UserExamRecord[]>;
        save: (exam: UserExamRecord) => Promise<void>;
        remove: (id: string) => Promise<void>;
    };
}

export const api: Api = {
    questions: {
        getAll: questionsImpl.getAllQuestions,
        getById: questionsImpl.getQuestionById,
    },
    questionsContext: {
        initialize: contextImpl.initializeQuestionsContext,
        getSnapshot: contextImpl.getQuestionsContextSnapshot,
        subscribe: contextImpl.subscribeToQuestionsContext,
        setFilterSetting: contextImpl.setFilterSetting,
        setCurrentQuestion: contextImpl.setCurrentQuestion,
        nextQuestion: contextImpl.nextQuestion,
        previousQuestion: contextImpl.previousQuestion,
    },
    userQuestions: {
        getAll: userQuestionsImpl.getAllUserQuestionData,
        getById: userQuestionsImpl.getUserQuestionData,
        setBookmarked: userQuestionsImpl.setQuestionBookmarked,
        getBookmarkedIds: userQuestionsImpl.getBookmarkedQuestionIds,
        getMissedIds: userQuestionsImpl.getMissedQuestionIds,
        attempts: {
            record: userQuestionsImpl.recordAttempt,
            getByQuestionId: userQuestionsImpl.getAttemptsByQuestionId,
        },
    },
    userExams: {
        context: {
            initialize: userExamsContextImpl.initializeUserExamsContext,
            getSnapshot: userExamsContextImpl.getUserExamsSnapshot,
            subscribe: userExamsContextImpl.subscribeToUserExams,
        },
        getAll: userExamsImpl.getAllUserExams,
        save: userExamsImpl.saveUserExam,
        remove: userExamsImpl.removeUserExam,
    },
};
