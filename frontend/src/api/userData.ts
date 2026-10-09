import type {
    QuestionSummary,
    QuestionAttempt,
    UserQuestionData,
} from '../models';

import { getAllQuestions } from './staticData';

// User-specific models

type QuestionAttemptInput = Pick<
    QuestionAttempt,
    'selectedAlternativeIndex' | 'isCorrect'
>;

// Storage implementation

const STORAGE_KEY = 'quiz:userQuestions:v1';

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

export function getUserQuestionData(
    id: string,
): UserQuestionData {
    const userQuestions = readUserQuestions();

    return userQuestions[id] ?? {
        questionId: id,
        isBookmarked: false,
        attempts: [],
    };
}

function updateUserQuestionData(
    id: string,
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
    id: string,
    isBookmarked: boolean,
): void {
    updateUserQuestionData(id, (data) => ({
        ...data,
        isBookmarked,
    }));
}

export function getBookmarks(): QuestionSummary[] {
    const userQuestions = readUserQuestions();

    const bookmarkedIds = new Set(
        Object.values(userQuestions)
            .filter((data) => data.isBookmarked)
            .map((data) => data.questionId),
    );

    return getAllQuestions().filter(
        (question) => bookmarkedIds.has(question.id),
    );
}

export function recordAttempt(
    id: string,
    attempt: QuestionAttemptInput,
): QuestionAttempt {
    const recordedAttempt: QuestionAttempt = {
        index: getUserQuestionData(id).attempts.length,
        selectedAlternativeIndex: attempt.selectedAlternativeIndex,
        isCorrect: attempt.isCorrect,
        attemptedAt: new Date().toISOString(),
    };

    updateUserQuestionData(id, (data) => ({
        ...data,
        attempts: [...data.attempts, recordedAttempt],
    }));

    return recordedAttempt;
}

export function getAttemptsByQuestionId(
    id: string,
): QuestionAttempt[] {
    return getUserQuestionData(id).attempts;
}