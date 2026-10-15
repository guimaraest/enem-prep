// implementação temporária vibecodada, o permanente será uma db

import type {
    QuestionId,
    QuestionAttempt,
    UserQuestionData,
} from '../models';

// User-specific models

type QuestionAttemptInput = Pick<
    QuestionAttempt,
    'selectedAlternativeIndex' | 'isCorrect'
>;

// Storage implementation

const STORAGE_KEY = 'quiz:userQuestions:v2';

type StoredUserQuestions = Record<string, UserQuestionData>;

function readUserQuestions(): StoredUserQuestions {
    if (typeof window === 'undefined' || !('localStorage' in window)) {
        return {};
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
        return {};
    }

    try {
        return JSON.parse(stored) as StoredUserQuestions;
    } catch {
        return {};
    }
}

function writeUserQuestions(
    userQuestions: StoredUserQuestions,
): void {
    if (typeof window === 'undefined' || !('localStorage' in window)) {
        return;
    }

    window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(userQuestions),
    );
}

function readUserQuestionData(
    id: QuestionId,
): UserQuestionData {
    const userQuestions = readUserQuestions();

    return userQuestions[id] ?? {
        questionId: id,
        isBookmarked: false,
        attempts: [],
    };
}

export function getUserQuestionData(
    id: QuestionId,
): Promise<UserQuestionData> {
    return Promise.resolve().then(() => readUserQuestionData(id));
}

export function getAllUserQuestionData(): Promise<UserQuestionData[]> {
    return Promise.resolve().then(() => Object.values(readUserQuestions()));
}

function updateUserQuestionData(
    id: QuestionId,
    update: (data: UserQuestionData) => UserQuestionData,
): UserQuestionData {
    const userQuestions = readUserQuestions();

    const currentData = userQuestions[id] ?? {
        questionId: id,
        isBookmarked: false,
        attempts: [],
    };

    const updatedData = update(currentData);

    writeUserQuestions({
        ...userQuestions,
        [id]: updatedData,
    });

    return updatedData;
}

export function setQuestionBookmarked(
    id: QuestionId,
    isBookmarked: boolean,
): Promise<void> {
    return Promise.resolve().then(() => {
        updateUserQuestionData(id, (data) => ({
            ...data,
            isBookmarked,
        }));
    });
}

export function getBookmarkedQuestionIds(): Promise<QuestionId[]> {
    const userQuestions = readUserQuestions();

    return Promise.resolve(
        Object.values(userQuestions)
            .filter((data) => data.isBookmarked)
            .map((data) => data.questionId),
    );
}

export function getMissedQuestionIds(): Promise<QuestionId[]> {
    const userQuestions = readUserQuestions();

    return Promise.resolve(
        Object.values(userQuestions)
            .filter((data) => data.attempts.some((attempt) => !attempt.isCorrect))
            .map((data) => data.questionId),
    );
}

export function recordAttempt(
    id: QuestionId,
    attempt: QuestionAttemptInput,
): Promise<QuestionAttempt> {
    return Promise.resolve().then(() => {
        const recordedAttempt: QuestionAttempt = {
            index: readUserQuestionData(id).attempts.length,
            selectedAlternativeIndex: attempt.selectedAlternativeIndex,
            isCorrect: attempt.isCorrect,
            attemptedAt: new Date().toISOString(),
        };

        updateUserQuestionData(id, (data) => ({
            ...data,
            attempts: [...data.attempts, recordedAttempt],
        }));

        return recordedAttempt;
    });
}

export function getAttemptsByQuestionId(
    id: QuestionId,
): Promise<QuestionAttempt[]> {
    return Promise.resolve().then(() => readUserQuestionData(id).attempts);
}
