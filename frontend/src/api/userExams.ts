export interface UserExamRecord {
    id: string;
    [key: string]: unknown;
}

const STORAGE_KEY = 'quiz:userExams:v1';

function readUserExams(): UserExamRecord[] {
    if (typeof window === 'undefined' || !('localStorage' in window)) return [];

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        const value: unknown = JSON.parse(stored);
        return Array.isArray(value)
            ? value.filter((item): item is UserExamRecord =>
                typeof item === 'object' && item !== null && 'id' in item && typeof item.id === 'string',
            )
            : [];
    } catch {
        return [];
    }
}

function writeUserExams(exams: UserExamRecord[]): void {
    if (typeof window === 'undefined' || !('localStorage' in window)) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
}

export function getAllUserExams(): Promise<UserExamRecord[]> {
    return Promise.resolve().then(readUserExams);
}

export function saveUserExam(exam: UserExamRecord): Promise<void> {
    return Promise.resolve().then(() => {
        const exams = readUserExams();
        writeUserExams([...exams.filter((stored) => stored.id !== exam.id), exam]);
    });
}

export function removeUserExam(id: string): Promise<void> {
    return Promise.resolve().then(() => {
        writeUserExams(readUserExams().filter((exam) => exam.id !== id));
    });
}
