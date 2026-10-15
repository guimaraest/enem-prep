import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { generateIndexes } from '../scripts/indexes.js'
import { parseUUID, type Question } from '../../frontend/src/models.js'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

test('generates question files and deterministic summary indexes', async (t) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'enem-prep-indexes-'))
  t.after(() => rm(tempDir, { recursive: true, force: true }))

  const normalizedQuestionsDir = path.join(tempDir, 'normalized')
  const finalQuestionsDir = path.join(tempDir, 'questions')
  const indexesOutputDir = path.join(tempDir, 'indexes')
  const logPath = path.join(tempDir, 'build.log')
  const questionId = parseUUID('9840a8c8-8d73-56c9-90b7-65669d38161a')
  const question: Question = {
    id: questionId,
    label: 1,
    title: 'Fixture question',
    source: 'enem 2023',
    difficulty: 2,
    percentCorrectRate: null,
    subject: 'algebra_and_equations',
    content: {
      files: [],
      problem: 'What is 1 + 1?',
      command: null,
      alternatives: [
        { index: 'a', text: '2' },
        { index: 'b', text: '3' },
      ],
      correctAlternative: 'a',
      explanation: '',
    },
  }

  const sourceQuestionDir = path.join(normalizedQuestionsDir, '2023-1')
  await mkdir(sourceQuestionDir, { recursive: true })
  await writeFile(
    path.join(sourceQuestionDir, 'question.json'),
    JSON.stringify(question),
  )

  await generateIndexes({
    logPath,
    normalizedQuestionsDir,
    finalQuestionsDir,
    indexesOutputDir,
  })

  const summary = JSON.parse(
    await readFile(path.join(indexesOutputDir, 'allQuestions.json'), 'utf8'),
  ) as Array<{ id: string; source: string }>
  const exam = JSON.parse(
    await readFile(
      path.join(indexesOutputDir, 'provas', 'enem-2023.json'),
      'utf8',
    ),
  ) as {
    examId: string
    type: string
    year: string | null
    content: Array<{ id: string }>
  }
  const examFiles = JSON.parse(
    await readFile(path.join(indexesOutputDir, 'provas', 'index.json'), 'utf8'),
  ) as string[]

  assert.deepEqual(summary, [
    {
      id: questionId,
      label: 1,
      title: 'Fixture question',
      source: 'enem 2023',
      difficulty: 2,
      percentCorrectRate: null,
      subject: 'algebra_and_equations',
      isMissed: false,
      isBookmarked: false,
    },
  ])
  assert.match(exam.examId, uuidPattern)
  assert.equal(exam.type, 'official-inep')
  assert.equal(exam.year, '2023')
  assert.deepEqual(exam.content.map(({ id }) => id), [questionId])
  assert.deepEqual(examFiles, ['enem-2023.json'])
  assert.deepEqual(
    await readdir(path.join(finalQuestionsDir, questionId)),
    ['question.json'],
  )
  await assert.rejects(readFile(path.join(sourceQuestionDir, 'question.json')))
})
