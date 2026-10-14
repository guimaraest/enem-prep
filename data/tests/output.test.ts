import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

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

  for (const entry of questionDirs) {
    const questionPath = path.join(questionsDir, entry.name, 'question.json')
    const question: unknown = JSON.parse(await readFile(questionPath, 'utf8'))

    assert.ok(isRecord(question), `${questionPath} must contain a question object`)
    assert.equal(question.id, entry.name, `${questionPath} UUID must match its directory`)
    assert.equal(question.difficulty, null, `${questionPath} difficulty must remain unset`)
    assert.equal(question.subject, null, `${questionPath} subject must remain unset`)
    assert.ok(isRecord(question.content), `${questionPath} must contain question content`)

    const content = question.content
    for (const field of [
      'problem',
      'command',
      'alternatives',
      'correctAlternative',
      'explanation',
    ]) {
      assert.ok(
        Object.hasOwn(content, field),
        `${questionPath} is missing content.${field}`,
      )
    }

    assert.ok(
      typeof content.problem === 'string',
      `${questionPath} problem must be text`,
    )
    assert.ok(
      content.problem.trim().length > 0 ||
        (typeof content.command === 'string' && content.command.trim().length > 0),
      `${questionPath} must contain question text in its problem or command`,
    )
    assert.ok(
      content.command === null || typeof content.command === 'string',
      `${questionPath} command must be text or null`,
    )
    assert.ok(
      Array.isArray(content.alternatives) && content.alternatives.length > 0,
      `${questionPath} must contain alternatives`,
    )
    assert.ok(
      typeof content.correctAlternative === 'string' &&
        /^[a-e]$/.test(content.correctAlternative),
      `${questionPath} must have a valid correct alternative`,
    )
    assert.equal(
      typeof content.explanation,
      'string',
      `${questionPath} explanation must be text`,
    )

    if (Object.hasOwn(content, 'files')) {
      assert.ok(Array.isArray(content.files), `${questionPath} files must be an array`)
    }

    let hasCorrectAlternative = false
    for (const [index, alternative] of content.alternatives.entries()) {
      assert.ok(
        isRecord(alternative),
        `${questionPath} alternative ${index + 1} must be an object`,
      )
      assert.ok(
        typeof alternative.index === 'string' &&
          /^[a-e]$/.test(alternative.index),
        `${questionPath} alternative ${index + 1} must have a valid index`,
      )
      assert.ok(
        typeof alternative.text === 'string',
        `${questionPath} alternative ${index + 1} text must be present`,
      )
      assert.ok(
        alternative.text.trim().length > 0 || isRecord(alternative.file),
        `${questionPath} alternative ${index + 1} must have text or an image`,
      )
      if (alternative.index === content.correctAlternative) {
        hasCorrectAlternative = true
      }
    }

    assert.ok(
      hasCorrectAlternative,
      `${questionPath} correct alternative must exist in the alternatives`,
    )
  }
})
