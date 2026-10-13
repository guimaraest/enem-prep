import { createHash } from 'node:crypto'
import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseUUID, type Question } from '../../frontend/src/models.js'

const UUID_NAMESPACE = '5db4f1aa-9899-4faf-a3f1-14c85e8f6481'

type QuestionForIdentity = Omit<Question, 'id'>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function canonicalQuestionKey(source: string, directoryName: string): string {
  if (
    /^enem \d{4}$/.test(source) &&
    directoryName.startsWith(`${source.slice(5)}-`)
  ) {
    return `enem-${directoryName}`
  }

  const sourceSlug = source.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const directorySlug = directoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return `${sourceSlug}-${directorySlug}`
}

export function createQuestionUUID(canonicalKey: string): Question['id'] {
  const namespaceBytes = Buffer.from(UUID_NAMESPACE.replaceAll('-', ''), 'hex')
  const hash = createHash('sha1')
    .update(namespaceBytes)
    .update(canonicalKey, 'utf8')
    .digest()

  hash[6] = (hash[6]! & 0x0f) | 0x50
  hash[8] = (hash[8]! & 0x3f) | 0x80

  const hex = hash.subarray(0, 16).toString('hex')
  const uuid = [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-')

  return parseUUID(uuid)
}

export async function assignQuestionUUIDs(
  normalizedQuestionsDir: string,
  logPath: string,
): Promise<void> {
  const entries = await readdir(normalizedQuestionsDir, {
    withFileTypes: true,
  })
  const questions: Array<{
    directoryName: string
    filePath: string
    canonicalKey: string
    question: QuestionForIdentity
  }> = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const filePath = path.join(normalizedQuestionsDir, entry.name, 'question.json')
    let raw: unknown

    try {
      raw = JSON.parse(await readFile(filePath, 'utf8'))
    } catch (error) {
      await appendFile(
        logPath,
        `[${new Date().toISOString()}] ERROR: Cannot read normalized question "${filePath}": ${String(error)}\n`,
      )
      throw error
    }

    if (
      !isRecord(raw) ||
      typeof raw.source !== 'string' ||
      typeof raw.label !== 'number'
    ) {
      const error = new Error(`Invalid normalized question: ${filePath}`)
      await appendFile(
        logPath,
        `[${new Date().toISOString()}] ERROR: ${error.message}\n`,
      )
      throw error
    }

    questions.push({
      directoryName: entry.name,
      filePath,
      canonicalKey: canonicalQuestionKey(raw.source, entry.name),
      question: raw as QuestionForIdentity,
    })
  }

  questions.sort((left, right) =>
    left.canonicalKey < right.canonicalKey
      ? -1
      : left.canonicalKey > right.canonicalKey
        ? 1
        : 0,
  )

  const seenKeys = new Set<string>()
  const seenIds = new Set<string>()

  for (const entry of questions) {
    const id = createQuestionUUID(entry.canonicalKey)

    if (seenKeys.has(entry.canonicalKey) || seenIds.has(id)) {
      const error = new Error(`Duplicate canonical question key: ${entry.canonicalKey}`)
      await appendFile(
        logPath,
        `[${new Date().toISOString()}] ERROR: ${error.message}\n`,
      )
      throw error
    }

    seenKeys.add(entry.canonicalKey)
    seenIds.add(id)

    const question: Question = {
      ...entry.question,
      id,
    }

    await writeFile(entry.filePath, JSON.stringify(question, null, 2))
  }

  await appendFile(
    logPath,
    `[${new Date().toISOString()}] INFO: Assigned stable UUIDs to ${questions.length} questions.\n`,
  )
}
