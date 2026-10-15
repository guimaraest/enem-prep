import * as questionsImpl from './questions';
import * as userQuestionsImpl from './userQuestions.ts';
import { DIFFICULTIES, SUBJECTS } from '../models';
import type { QuestionId, QuestionSummary, Subject, Difficulty } from '../models';
import { difficultyMap, subjectMap } from '../constants';

export type FilterSetting = 'subject' | 'difficulty' | 'missed' | 'bookmarked';

export interface QuestionGroup {
    label: string;
    questions: QuestionSummary[];
}

export interface QuestionsContextSnapshot {
    filterSetting: FilterSetting;
    fullContext: QuestionSummary[];
    filteredContext: QuestionGroup[];
    loading: boolean;
    error: string | null;
}

const filterSettings: FilterSetting[] = [
    'subject',
    'difficulty',
    'missed',
    'bookmarked',
];

let snapshot: QuestionsContextSnapshot = {
    filterSetting: 'subject',
    fullContext: [],
    filteredContext: [],
    loading: true,
    error: null,
};
let currentQuestion: QuestionId | null = null;
let hasLoaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function sortGroups(groups: QuestionGroup[]): QuestionGroup[] {
    return groups.map((group) => ({
            ...group,
            questions: [...group.questions].sort((a, b) => a.label - b.label),
        }));
}

function getFilteredContext(
    filterSetting: FilterSetting,
    fullContext: QuestionSummary[],
): QuestionGroup[] {
    switch (filterSetting) {
        case 'subject': {
            const groups: QuestionGroup[] = SUBJECTS.map((subject: Subject) => ({
                label: subjectMap[subject].label,
                questions: fullContext.filter((question) => question.subject === subject),
            }));
            const unassigned = fullContext.filter((question) => question.subject === null);
            if (unassigned.length > 0) {
                groups.push({ label: 'null', questions: unassigned });
            }
            return sortGroups(groups);
        }
        case 'difficulty': {
            const groups: QuestionGroup[] = DIFFICULTIES.map((difficulty: Difficulty) => ({
                label: difficultyMap[difficulty].label,
                questions: fullContext.filter((question) => question.difficulty === difficulty),
            }));
            const unrated = fullContext.filter((question) => question.difficulty === null);
            if (unrated.length > 0) {
                groups.push({ label: 'null', questions: unrated });
            }
            return sortGroups(groups);
        }
        case 'missed':
            return sortGroups([{
                label: 'missed',
                questions: fullContext.filter((question) => question.isMissed),
            }]);
        case 'bookmarked':
            return sortGroups([{
                label: 'bookmarked',
                questions: fullContext.filter((question) => question.isBookmarked),
            }]);
    }
}

function updateSnapshot(update: Partial<QuestionsContextSnapshot>): void {
    const filterSetting = update.filterSetting ?? snapshot.filterSetting;
    const fullContext = update.fullContext ?? snapshot.fullContext;

    snapshot = {
        ...snapshot,
        ...update,
        filteredContext: getFilteredContext(filterSetting, fullContext),
    };

    listeners.forEach((listener) => listener());
}

export function isFilterSetting(value: string): value is FilterSetting {
    return filterSettings.includes(value as FilterSetting);
}

export function getQuestionsContextSnapshot(): QuestionsContextSnapshot {
    return snapshot;
}

export function subscribeToQuestionsContext(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function setFilterSetting(filterSetting: FilterSetting): void {
    if (snapshot.filterSetting === filterSetting) return;
    updateSnapshot({ filterSetting });
}

export function setCurrentQuestion(questionId: QuestionId): void {
    currentQuestion = questionId;
}

export function initializeQuestionsContext(force = false): Promise<void> {
    if (loadPromise) return loadPromise;
    if (hasLoaded && !force) return Promise.resolve();

    updateSnapshot({ loading: true, error: null });

    loadPromise = (async () => {
        try {
            const [questions, bookmarkedQuestions, missedQuestions] = await Promise.all([
                questionsImpl.getAllQuestions(),
                userQuestionsImpl.getBookmarkedQuestionIds(),
                userQuestionsImpl.getMissedQuestionIds(),
            ]);
            const bookmarkedIds = new Set(bookmarkedQuestions);
            const missedIds = new Set(missedQuestions);

            const fullContext = questions.map((question) => ({
                ...question,
                isBookmarked: bookmarkedIds.has(question.id),
                isMissed: missedIds.has(question.id),
            }));

            hasLoaded = true;
            updateSnapshot({ fullContext, loading: false, error: null });
        } catch (cause: unknown) {
            const message = cause instanceof Error
                ? cause.message
                : 'failed to load question user data';
            updateSnapshot({ loading: false, error: message });
            throw cause;
        } finally {
            loadPromise = null;
        }
    })();

    return loadPromise;
}

async function getCurrentQuestionGroupIndex(): Promise<{
    groupIndex: number;
    questionIndex: number;
} | undefined> {
    if (!hasLoaded) await initializeQuestionsContext();
    if (!currentQuestion) return undefined;

    const groupIndex = snapshot.filteredContext.findIndex((group) =>
        group.questions.some((question) => question.id === currentQuestion),
    );
    if (groupIndex === -1) return undefined;

    const questionIndex = snapshot.filteredContext[groupIndex].questions
        .findIndex((question) => question.id === currentQuestion);

    return { groupIndex, questionIndex };
}

export async function nextQuestion(): Promise<QuestionId | undefined> {
    const position = await getCurrentQuestionGroupIndex();
    if (!position) return undefined;

    const { filteredContext } = snapshot;
    const currentGroup = filteredContext[position.groupIndex];
    const nextInGroup = currentGroup.questions[position.questionIndex + 1];
    if (nextInGroup) return nextInGroup.id;

    const nextGroup = filteredContext
        .slice(position.groupIndex + 1)
        .find((group) => group.questions.length > 0);
    return nextGroup?.questions[0].id;
}

export async function previousQuestion(): Promise<QuestionId | undefined> {
    const position = await getCurrentQuestionGroupIndex();
    if (!position) return undefined;

    const { filteredContext } = snapshot;
    const currentGroup = filteredContext[position.groupIndex];
    const previousInGroup = currentGroup.questions[position.questionIndex - 1];
    if (previousInGroup) return previousInGroup.id;

    const previousGroup = filteredContext
        .slice(0, position.groupIndex)
        .reverse()
        .find((group) => group.questions.length > 0);
    return previousGroup?.questions.at(-1)?.id;
}
