import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  DIFFICULTIES,
  SUBJECTS,
  parseUUID,
  type Difficulty,
  type Question,
  type Subject,
} from '../../frontend/src/models.js'

type LabelEntry = {
  filePath: string
  id: Question['id']
  subject: Subject | null
  difficulty: Difficulty | null
  question: Record<string, unknown>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isSubject(value: unknown): value is Subject {
  return typeof value === 'string' && SUBJECTS.some((subject) => subject === value)
}

function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.some((difficulty) => difficulty === value)
}

function compareRankedValues<T extends string | number>(
  left: T | null,
  right: T | null,
  values: readonly T[],
): number {
  const rank = (value: T | null) =>
    value === null ? values.length : values.indexOf(value)

  return rank(left) - rank(right)
}

export async function assignQuestionLabels(
  questionsDir: string,
  logPath: string,
): Promise<void> {
  const entries = await readdir(questionsDir, { withFileTypes: true })
  const questions: LabelEntry[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const filePath = path.join(questionsDir, entry.name, 'question.json')
    let raw: unknown

    try {
      raw = JSON.parse(await readFile(filePath, 'utf8'))
    } catch (error) {
      await appendFile(
        logPath,
        `[${new Date().toISOString()}] ERROR: Cannot read question for label assignment "${filePath}": ${String(error)}\n`,
      )
      throw error
    }

    if (
      !isRecord(raw) ||
      typeof raw.id !== 'string' ||
      typeof raw.label !== 'number' ||
      (raw.subject !== null && !isSubject(raw.subject)) ||
      (raw.difficulty !== null && !isDifficulty(raw.difficulty))
    ) {
      const error = new Error(`Invalid question for label assignment: ${filePath}`)
      await appendFile(
        logPath,
        `[${new Date().toISOString()}] ERROR: ${error.message}\n`,
      )
      throw error
    }

    questions.push({
      filePath,
      id: parseUUID(raw.id),
      subject: raw.subject,
      difficulty: raw.difficulty,
      question: raw,
    })
  }

  questions.sort((left, right) =>
    compareRankedValues(left.subject, right.subject, SUBJECTS) ||
    compareRankedValues(left.difficulty, right.difficulty, DIFFICULTIES) ||
    left.id.localeCompare(right.id),
  )

  for (const [index, entry] of questions.entries()) {
    await writeFile(
      entry.filePath,
      JSON.stringify({ ...entry.question, label: index + 1 }, null, 2),
    )
  }

  await appendFile(
    logPath,
    `[${new Date().toISOString()}] INFO: Assigned subject/difficulty-ordered labels to ${questions.length} questions.\n`,
  )
}
