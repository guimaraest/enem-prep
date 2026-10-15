import * as userExamsImpl from './userExams';
import type { UserExamRecord } from './userExams';

export interface UserExamsSnapshot {
    exams: UserExamRecord[];
    loading: boolean;
    error: string | null;
}

let snapshot: UserExamsSnapshot = {
    exams: [],
    loading: true,
    error: null,
};
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function updateSnapshot(update: Partial<UserExamsSnapshot>): void {
    snapshot = { ...snapshot, ...update };
    listeners.forEach((listener) => listener());
}

export function getUserExamsSnapshot(): UserExamsSnapshot {
    return snapshot;
}

export function subscribeToUserExams(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function initializeUserExamsContext(): Promise<void> {
    if (loadPromise) return loadPromise;

    updateSnapshot({ loading: true, error: null });
    loadPromise = userExamsImpl.getAllUserExams()
        .then((exams) => updateSnapshot({ exams, loading: false, error: null }))
        .catch((cause: unknown) => {
            const error = cause instanceof Error ? cause.message : 'failed to load user exams';
            updateSnapshot({ loading: false, error });
            throw cause;
        })
        .finally(() => {
            loadPromise = null;
        });

    return loadPromise;
}
