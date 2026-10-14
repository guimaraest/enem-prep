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
