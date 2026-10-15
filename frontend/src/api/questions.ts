import { parseUUID } from '../models'
import type { Question, QuestionId, QuestionSummary } from '../models'

const INDEXES_BASE_URL = '/indexes'
const QUESTIONS_BASE_URL = '/questions'

let allQuestionsPromise: Promise<QuestionSummary[]> | null = null

export async function getAllQuestions(): Promise<QuestionSummary[]> {
  if (!allQuestionsPromise) {
    allQuestionsPromise = fetchJson<QuestionSummary[]>(
      `${INDEXES_BASE_URL}/allQuestions.json`,
    )
      .then((questions) =>
        questions.map((question) => ({
          ...question,
          id: parseUUID(question.id),
        })),
      )
      .catch((error: unknown) => {
        allQuestionsPromise = null
        throw error
      })
  }

  return allQuestionsPromise
}

export async function getQuestionById(
  id: QuestionId,
): Promise<Question | undefined> {
  const questions = await getAllQuestions()
  const exists = questions.some((question) => question.id === id)

  if (!exists) return undefined

  const question = await fetchJson<Question>(
    `${QUESTIONS_BASE_URL}/${encodeURIComponent(id)}/question.json`,
  )

  return {
    ...question,
    id: parseUUID(question.id),
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<T>
}