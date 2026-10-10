import { readdir, readFile, writeFile, appendFile } from 'node:fs/promises'
import path from 'node:path'
import {
  SUBJECTS,
  DIFFICULTIES,
  type Question,
  type Subject,
  type Difficulty,
} from '../../frontend/src/models.js'

export async function fillTemporaryMetadata(
  questionsDir: string,
  logPath: string,
): Promise<void> {
  const entries = await readdir(questionsDir, { withFileTypes: true })
  let updated = 0

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const filePath = path.join(questionsDir, entry.name, 'question.json')

    try {
      const question = JSON.parse(
        await readFile(filePath, 'utf8'),
      ) as Question

      let changed = false

      if (question.difficulty === null) {
        question.difficulty = randomItem(DIFFICULTIES) as Difficulty
        changed = true
      }

      if (question.subject === null) {
        question.subject = randomItem(SUBJECTS) as Subject
        changed = true
      }

      if (changed) {
        await writeFile(filePath, JSON.stringify(question, null, 2))
        updated++
      }
    } catch (error) {
      await appendFile(
        logPath,
        `[${new Date().toISOString()}] ERROR: Could not fill metadata for ${entry.name}: ${String(error)}\n`,
      )
    }
  }

  await appendFile(
    logPath,
    `[${new Date().toISOString()}] INFO: Temporarily filled metadata for ${updated} questions.\n`,
  )
}

function randomItem<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot select from an empty array')
  }

  return items[Math.floor(Math.random() * items.length)]!
}