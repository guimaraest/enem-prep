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
  const responseBody = await response.text()
  const contentType = response.headers.get('content-type') ?? 'unknown'
  const responseDetails = [
    `requested URL: ${url}`,
    `response URL: ${response.url || 'unknown'}`,
    `status: ${response.status} ${response.statusText}`,
    `content-type: ${contentType}`,
  ].join(', ')

  if (!response.ok) {
    throw new Error(
      `Failed to fetch JSON (${responseDetails}); response body: ${responseBody.slice(0, 200)}`,
    )
  }

  try {
    return JSON.parse(responseBody) as T
  } catch (cause) {
    throw new Error(
      `Invalid JSON response (${responseDetails}); response body: ${responseBody.slice(0, 200)}`,
      { cause },
    )
  }
}