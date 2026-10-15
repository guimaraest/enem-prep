import { parseUUID } from '../models';
import type { Exam, UUID } from '../models';

const EXAMS_BASE_URL = '/indexes/provas';

let allExamsPromise: Promise<Exam[]> | null = null;

export function getAllExams(): Promise<Exam[]> {
    if (!allExamsPromise) {
        allExamsPromise = fetchJson<string[]>(`${EXAMS_BASE_URL}/index.json`)
            .then((files) => Promise.all(files.map((file) =>
                fetchJson<Exam>(`${EXAMS_BASE_URL}/${encodeURIComponent(file)}`),
            )))
            .then((exams) => exams.map((exam) => ({
                ...exam,
                examId: parseUUID(exam.examId),
                content: exam.content.map((question) => ({
                    ...question,
                    id: parseUUID(question.id),
                })),
            })))
            .catch((cause: unknown) => {
                allExamsPromise = null;
                throw cause;
            });
    }

    return allExamsPromise;
}

export async function getExamById(id: UUID): Promise<Exam | undefined> {
    const exams = await getAllExams();
    return exams.find((exam) => exam.examId === id);
}

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
}
