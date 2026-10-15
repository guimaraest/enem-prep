import {
  appendFile,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import type {
  Question,
  QuestionSummary,
  Exam,
  Subject,
  Difficulty,
} from '../../frontend/src/models.js'
import { createExamUUID } from './uuid-factory.js'
import {
  SUBJECTS,
  DIFFICULTIES,
} from '../../frontend/src/models.js'

type IndexOptions = {
  logPath: string
  normalizedQuestionsDir: string
  finalQuestionsDir: string
  indexesOutputDir: string
}

async function log(logPath: string, message: string): Promise<void> {
  await mkdir(path.dirname(logPath), { recursive: true })
  await appendFile(
    logPath,
    `[${new Date().toISOString()}] ${message}\n`,
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIndexedQuestion(value: unknown): value is Question {
  if (!isRecord(value) || !isRecord(value.content)) return false

  return (
    typeof value.id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.id) &&
    typeof value.label === 'number' &&
    Number.isInteger(value.label) &&
    value.label > 0 &&
    typeof value.title === 'string' &&
    typeof value.source === 'string' &&
    Array.isArray(value.content.files) &&
    typeof value.content.problem === 'string' &&
    Array.isArray(value.content.alternatives)
  )
}

function toSummary(question: Question): QuestionSummary {
  return {
    id: question.id,
    label: question.label,
    title: question.title,
    source: question.source,
    difficulty: question.difficulty,
    percentCorrectRate: question.percentCorrectRate,
    subject: question.subject,
    isMissed: false,
    isBookmarked: false,
  }
}

export async function generateIndexes({
  logPath,
  normalizedQuestionsDir,
  finalQuestionsDir,
  indexesOutputDir,
}: IndexOptions): Promise<void> {
  await mkdir(finalQuestionsDir, { recursive: true })

  const existingFinalDirs = new Set(await readdir(finalQuestionsDir))
  const usedIds = new Set(existingFinalDirs)
  const summaries: QuestionSummary[] = []
  const seenSourceDirs = new Set<string>()

  let entries

  try {
    entries = await readdir(normalizedQuestionsDir, {
      withFileTypes: true,
    })
  } catch (error) {
    await log(logPath, `ERROR: Cannot read normalized directory: ${String(error)}`)
    throw error
  }

  entries.sort((left, right) => left.name.localeCompare(right.name))

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const sourceDir = path.join(normalizedQuestionsDir, entry.name)
    const questionPath = path.join(sourceDir, 'question.json')

    try {
      const raw: unknown = JSON.parse(
        await readFile(questionPath, 'utf8'),
      )

      if (!isIndexedQuestion(raw)) {
        await log(logPath, `ERROR: Invalid UUID-assigned question: ${questionPath}`)
        continue
      }

      const question = raw
      const id = question.id

      if (usedIds.has(id)) {
        await log(
          logPath,
          `ERROR: Canonical ID collision "${id}" for ${questionPath}`,
        )
        continue
      }

      if (seenSourceDirs.has(entry.name)) {
        await log(logPath, `ERROR: Duplicate normalized directory "${entry.name}"`)
        continue
      }

      const destinationDir = path.join(finalQuestionsDir, id)

      // Persist the canonical ID before moving the question directory.
      await writeFile(
        questionPath,
        JSON.stringify(question, null, 2),
      )

      await rename(sourceDir, destinationDir)

      usedIds.add(id)
      seenSourceDirs.add(entry.name)
      summaries.push(toSummary(question))
    } catch (error) {
      await log(
        logPath,
        `ERROR: Failed to process "${questionPath}": ${String(error)}`,
      )
    }
  }

  // Sort consistently so generated indexes are deterministic.
  summaries.sort((a, b) => a.id.localeCompare(b.id))

  const exams = new Map<string, Exam>()

  for (const question of summaries) {
    if (!question.source.startsWith('enem ')) continue

    const year = question.source.slice(5)
    if (!/^\d{4}$/.test(year)) {
      await log(logPath, `WARNING: Unexpected ENEM source "${question.source}"`)
      continue
    }

    const examFile = `enem-${year}.json`
    const exam = exams.get(examFile) ?? {
      examId: createExamUUID(`official-inep-${year}`),
      type: 'official-inep',
      year,
      content: [],
    } satisfies Exam
    exam.content.push(question)
    exams.set(examFile, exam)
  }

  const byDifficulty: Record<string, QuestionSummary[]> = {}
  const bySubject: Record<string, QuestionSummary[]> = {}

  for (const difficulty of DIFFICULTIES) {
    byDifficulty[difficulty] = []
  }

  for (const subject of SUBJECTS) {
    bySubject[subject] = []
  }

  for (const question of summaries) {
    if (
      question.difficulty !== null &&
      DIFFICULTIES.includes(question.difficulty as Difficulty)
    ) {
      byDifficulty[question.difficulty].push(question)
    } else if (question.difficulty !== null) {
      await log(
        logPath,
        `WARNING: Unknown difficulty "${question.difficulty}" on "${question.id}"`,
      )
    }

    if (
      question.subject !== null &&
      SUBJECTS.includes(question.subject as Subject)
    ) {
      bySubject[question.subject].push(question)
    } else if (question.subject !== null) {
      await log(
        logPath,
        `WARNING: Unknown subject "${question.subject}" on "${question.id}"`,
      )
    }
  }

  // Rebuild generated indexes to remove stale files from previous runs.
  await rm(indexesOutputDir, { recursive: true, force: true })
  await mkdir(path.join(indexesOutputDir, 'provas'), { recursive: true })

  await writeJson(
    path.join(indexesOutputDir, 'allQuestions.json'),
    summaries,
  )
  await writeJson(
    path.join(indexesOutputDir, 'difficulty.json'),
    byDifficulty,
  )
  await writeJson(
    path.join(indexesOutputDir, 'subject.json'),
    bySubject,
  )

  const examFiles = [...exams.keys()].sort()

  for (const [filename, exam] of exams) {
    exam.content.sort((left, right) => {
      const leftNumber = Number(left.title.match(/^Questão (\d+)\b/)?.[1] ?? left.label)
      const rightNumber = Number(right.title.match(/^Questão (\d+)\b/)?.[1] ?? right.label)
      return leftNumber - rightNumber
    })
    await writeJson(
      path.join(indexesOutputDir, 'provas', filename),
      exam,
    )
  }

  await writeJson(path.join(indexesOutputDir, 'provas', 'index.json'), examFiles)

  await log(
    logPath,
    `INFO: Indexed ${summaries.length} questions across ${exams.size} ENEM exam indexes.`,
  )
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2))
}
