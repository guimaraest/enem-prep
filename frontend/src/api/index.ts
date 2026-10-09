import * as questionsImpl from './staticData';
import * as userDataImpl from './userData.ts';

class Api {
    readonly questions = {
        getAll: questionsImpl.getAllQuestions,
        getById: questionsImpl.getQuestionById,
    };

    readonly userQuestions = {
        getById: userDataImpl.getUserQuestionData,
        setBookmarked: userDataImpl.setQuestionBookmarked,
        getBookmarks: userDataImpl.getBookmarks,
    };

    readonly attempts = {
        record: userDataImpl.recordAttempt,
        getByQuestionId: userDataImpl.getAttemptsByQuestionId,
    };
}

export const api = new Api();