import { cp, rm, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { enemSourceQuestionsEntry } from './enemSourceQuestions.ts'
import { generateIndexes } from './indexes.js'
import { assignQuestionUUIDs } from './uuid-factory.js'
import { assignQuestionLabels } from './labels.js'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '../..')

const dataDir = path.join(projectRoot, 'data')
const tempDir = path.join(dataDir, 'temp')
const sourceDir = path.join(dataDir, 'sources', 'enemSourceQuestions')
const normalizationOutputDir = path.join(tempDir, 'normalized')
const outputDir = path.join(dataDir, 'output')
const finalQuestionsDir = path.join(outputDir, 'questions')
const indexesOutputDir = path.join(outputDir, 'indexes')

const publicDir = path.join(projectRoot, 'frontend/public')
const publicQuestionsDir = path.join(publicDir, 'questions')
const publicIndexesDir = path.join(publicDir, 'indexes')

const logPath = path.join(dataDir, 'build.log')

async function build(): Promise<void> {
  console.log('cleaning output directories')

  await Promise.all([
    rm(tempDir, { recursive: true, force: true }),
    rm(outputDir, { recursive: true, force: true }),
    rm(publicQuestionsDir, { recursive: true, force: true }),
    rm(publicIndexesDir, { recursive: true, force: true }),
  ])

  await Promise.all([
    mkdir(tempDir, { recursive: true }),
    mkdir(finalQuestionsDir, { recursive: true }),
    mkdir(indexesOutputDir, { recursive: true }),
    mkdir(publicQuestionsDir, { recursive: true }),
    mkdir(publicIndexesDir, { recursive: true }),
  ])

  console.log('normalizing ENEM source questions')
  await enemSourceQuestionsEntry(sourceDir, normalizationOutputDir, logPath)

  console.log('assigning stable question UUIDs')
  await assignQuestionUUIDs(normalizationOutputDir, logPath)

  console.log('assigning question labels by subject and difficulty')
  await assignQuestionLabels(normalizationOutputDir, logPath)

  console.log('generating indexes')
  await generateIndexes({
    logPath,
    normalizedQuestionsDir: normalizationOutputDir,
    finalQuestionsDir,
    indexesOutputDir,
  })

  await Promise.all([
    cp(finalQuestionsDir, publicQuestionsDir, { recursive: true }),
    cp(indexesOutputDir, publicIndexesDir, { recursive: true }),
  ])

  console.log('build completed.')
}

build().catch((error: unknown) => {
  console.error('build failed:', error)
  process.exitCode = 1
})