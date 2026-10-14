import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { DIFFICULTIES, SUBJECTS } from '../../frontend/src/models.js'

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(dataDir, 'output')
const publicDir = path.resolve(dataDir, '../frontend/public')
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function listFiles(directory: string, baseDir = directory): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(directory, entry.name)

      return entry.isDirectory()
        ? listFiles(filePath, baseDir)
        : [path.relative(baseDir, filePath)]
    }),
  )

  return files.flat().sort()
}

test('retained output matches the frontend data copy', async () => {
  for (const subdirectory of ['indexes', 'questions']) {
    const outputFiles = await listFiles(path.join(outputDir, subdirectory))
    const publicFiles = await listFiles(path.join(publicDir, subdirectory))

    assert.deepEqual(outputFiles, publicFiles, `${subdirectory} file lists differ`)

    for (const relativePath of outputFiles) {
      assert.deepEqual(
        await readFile(path.join(outputDir, subdirectory, relativePath)),
        await readFile(path.join(publicDir, subdirectory, relativePath)),
        `${subdirectory}/${relativePath} differs`,
      )
    }
  }
})

test('every indexed question UUID has a matching output question', async () => {
  const indexesDir = path.join(outputDir, 'indexes')
  const indexFiles = await listFiles(indexesDir)
  const indexedIds = new Set<string>()

  for (const relativePath of indexFiles) {
    if (path.extname(relativePath) !== '.json') continue

    const index: unknown = JSON.parse(
      await readFile(path.join(indexesDir, relativePath), 'utf8'),
    )

    function collectIds(value: unknown): void {
      if (Array.isArray(value)) {
        for (const item of value) collectIds(item)
        return
      }

      if (typeof value !== 'object' || value === null) return

      for (const [key, child] of Object.entries(value)) {
        if (key === 'id') {
          assert.ok(
            typeof child === 'string' && uuidPattern.test(child),
            `index ${relativePath} contains a non-UUID id`,
          )
          indexedIds.add(child)
        }
        collectIds(child)
      }
    }

    collectIds(index)
  }

  assert.ok(indexedIds.size > 0, 'expected generated indexes to contain questions')

  for (const id of indexedIds) {
    const question: unknown = JSON.parse(
      await readFile(path.join(outputDir, 'questions', id, 'question.json'), 'utf8'),
    )

    assert.equal(
      typeof question === 'object' &&
        question !== null &&
        'id' in question
        ? question.id
        : undefined,
      id,
      `index UUID ${id} must match its question file`,
    )
  }
})

test('every output question title has a question number from 136 to 180', async () => {
  const questionsDir = path.join(outputDir, 'questions')
  const questionDirs = await readdir(questionsDir, { withFileTypes: true })
  const outputQuestionDirs = questionDirs.filter((entry) => entry.isDirectory())

  assert.ok(outputQuestionDirs.length > 0, 'expected generated output questions')

  for (const entry of outputQuestionDirs) {
    const questionPath = path.join(questionsDir, entry.name, 'question.json')
    const question: unknown = JSON.parse(await readFile(questionPath, 'utf8'))
    const title =
      typeof question === 'object' && question !== null && 'title' in question
        ? question.title
        : undefined
    const match = typeof title === 'string' && title.match(/^Questão (\d+)\b/)

    assert.ok(match, `${questionPath} must have a numbered question title`)
    const number = Number(match[1])
    assert.ok(
      number >= 136 && number <= 180,
      `${questionPath} has question number ${number}; expected 136–180`,
    )
  }
})

test('warns when an ENEM year does not have all 45 mathematics questions', async (t) => {
  const sourceDir = path.join(dataDir, 'sources', 'enemSourceQuestions')
  const sourceYears = await readdir(sourceDir, { withFileTypes: true })
  const questionsDir = path.join(outputDir, 'questions')
  const outputQuestionDirs = (await readdir(questionsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
  const outputQuestions = await Promise.all(
    outputQuestionDirs.map(async (entry) => {
      const question: unknown = JSON.parse(
        await readFile(
          path.join(questionsDir, entry.name, 'question.json'),
          'utf8',
        ),
      )
      return question
    }),
  )

  for (const yearEntry of sourceYears) {
    if (!yearEntry.isDirectory() || !/^\d{4}$/.test(yearEntry.name)) continue

    const year = yearEntry.name
    const numbers = new Set<number>()

    for (const question of outputQuestions) {
      if (!isRecord(question) || question.source !== `enem ${year}`) continue
      if (typeof question.title !== 'string') continue

      const match = question.title.match(/^Questão (\d+)\b/)
      if (match) numbers.add(Number(match[1]))
    }

    const missing = Array.from({ length: 45 }, (_, index) => index + 136)
      .filter((number) => !numbers.has(number))

    if (missing.length > 0 || numbers.size !== 45) {
      t.diagnostic(
        `WARNING: ENEM ${year} has ${numbers.size}/45 mathematics questions; missing: ${
          missing.length > 0 ? missing.join(', ') : 'none'
        }`,
      )
    }
  }
})

test('every UUID question has its required content fields populated', async () => {
  const questionsDir = path.join(outputDir, 'questions')
  const questionDirs = (await readdir(questionsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())

  assert.ok(questionDirs.length > 0, 'expected generated output questions')

  const failures: string[] = []

  for (const entry of questionDirs) {
    const questionPath = path.join(questionsDir, entry.name, 'question.json')
    const question: unknown = JSON.parse(await readFile(questionPath, 'utf8'))

    if (!isRecord(question)) {
      failures.push(`${entry.name} (label unavailable): must contain a question object`)
      continue
    }

    const label =
      typeof question.label === 'number' ? String(question.label) : 'unavailable'
    const report = (condition: boolean, message: string): void => {
      if (!condition) failures.push(`${entry.name} (label ${label}): ${message}`)
    }

    report(question.id === entry.name, 'UUID must match its directory')
    report(
      question.difficulty === null ||
        DIFFICULTIES.some((difficulty) => difficulty === question.difficulty),
      'difficulty must be null or a supported difficulty',
    )
    report(
      question.subject === null ||
        SUBJECTS.some((subject) => subject === question.subject),
      'subject must be null or a supported subject',
    )
    report(isRecord(question.content), 'must contain question content')
    if (!isRecord(question.content)) continue

    const content = question.content
    for (const field of [
      'problem',
      'command',
      'alternatives',
      'correctAlternative',
      'explanation',
    ]) {
      report(
        Object.hasOwn(content, field),
        `is missing content.${field}`,
      )
    }

    report(
      typeof content.problem === 'string',
      'problem must be text',
    )
    report(
      (typeof content.problem === 'string' && content.problem.trim().length > 0) ||
        (typeof content.command === 'string' && content.command.trim().length > 0),
      'must contain question text in its problem or command',
    )
    report(
      content.command === null || typeof content.command === 'string',
      'command must be text or null',
    )
    report(
      Array.isArray(content.alternatives) && content.alternatives.length > 0,
      'must contain alternatives',
    )
    report(
      typeof content.correctAlternative === 'string' &&
        /^[a-e]$/.test(content.correctAlternative),
      'must have a valid correct alternative',
    )
    report(
      typeof content.explanation === 'string',
      'explanation must be text',
    )

    if (Object.hasOwn(content, 'files')) {
      report(Array.isArray(content.files), 'files must be an array')
    }

    let hasCorrectAlternative = false
    const alternatives = Array.isArray(content.alternatives)
      ? content.alternatives
      : []
    for (const [index, alternative] of alternatives.entries()) {
      if (!isRecord(alternative)) {
        report(false, `alternative ${index + 1} must be an object`)
        continue
      }
      report(
        typeof alternative.index === 'string' &&
          /^[a-e]$/.test(alternative.index),
        `alternative ${index + 1} must have a valid index`,
      )
      report(
        typeof alternative.text === 'string',
        `alternative ${index + 1} text must be present`,
      )
      report(
        (typeof alternative.text === 'string' &&
          alternative.text.trim().length > 0) ||
          isRecord(alternative.file),
        `alternative ${index + 1} must have text or an image`,
      )
      if (alternative.index === content.correctAlternative) {
        hasCorrectAlternative = true
      }
    }

    report(
      hasCorrectAlternative,
      'correct alternative must exist in the alternatives',
    )
  }

  assert.deepEqual(
    failures,
    [],
    `Questions with invalid content (UUID and label):\n${failures.join('\n')}`,
  )
})
