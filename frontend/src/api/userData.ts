// implementação temporária vibecodada, o permanente será uma db

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

export function getAllUserQuestionData(): UserQuestionData[] {
    return Object.values(readUserQuestions());
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

export async function getBookmarkedQuestions(): Promise<QuestionSummary[]> {
    const userQuestions = readUserQuestions();

    const bookmarkedIds = new Set(
        Object.values(userQuestions)
            .filter((data) => data.isBookmarked)
            .map((data) => data.questionId),
    );

    const questions = await getAllQuestions()

    return questions.filter(
        (question) => bookmarkedIds.has(question.id),
    );
}

export async function getMissedQuestions(): Promise<QuestionSummary[]> {
    const userQuestions = readUserQuestions();

    const missedIds = new Set(
        Object.values(userQuestions)
            .filter((data) => data.attempts.some((attempt) => !attempt.isCorrect))
            .map((data) => data.questionId),
    );

    const questions = await getAllQuestions();

    return questions.filter(
        (question) => missedIds.has(question.id),
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