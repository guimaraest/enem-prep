import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { enemSourceQuestionsEntry } from '../scripts/enemSourceQuestions.js'

test('normalizes source questions without filtering by discipline or number', async (t) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'enem-prep-source-'))
  t.after(() => rm(tempDir, { recursive: true, force: true }))

  const inputDir = path.join(tempDir, 'source')
  const outputDir = path.join(tempDir, 'normalized')
  const logPath = path.join(tempDir, 'build.log')
  const questions = path.join(inputDir, '2024', 'questions')

  await mkdir(questions, { recursive: true })

  const writeSourceQuestion = async (
    directory: string,
    titleNumber: number,
  ): Promise<void> => {
    const questionDir = path.join(questions, directory)
    await mkdir(questionDir, { recursive: true })
    await writeFile(
      path.join(questionDir, 'details.json'),
      JSON.stringify({
        title: `Questão ${titleNumber} - ENEM 2024`,
        index: titleNumber,
        year: 2024,
        difficulty: null,
        subject: null,
        context: 'Question text',
        files: [],
        correctAlternative: 'A',
        alternativesIntroduction: null,
        alternatives: [
          { letter: 'A', text: 'Correct', file: null },
          { letter: 'B', text: 'Incorrect', file: null },
        ],
      }),
    )
  }

  await writeSourceQuestion('135', 135)
  await writeSourceQuestion('136', 136)
  await writeSourceQuestion('181', 181)

  await enemSourceQuestionsEntry(inputDir, outputDir, logPath)

  assert.deepEqual(await readdir(outputDir), ['2024-135', '2024-136', '2024-181'])

  const acceptedQuestion = JSON.parse(
    await readFile(path.join(outputDir, '2024-136', 'question.json'), 'utf8'),
  ) as { title: string }
  assert.equal(acceptedQuestion.title, 'Questão 136 - ENEM 2024')
})
