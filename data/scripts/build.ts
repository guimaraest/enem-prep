import { rm, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { enemApiSourceEntry } from './source-enem-api.ts'
import { generateIndexes } from './indexes.js'
import { fillTemporaryMetadata } from './fill-temporary-metadata.js'
import { assignQuestionUUIDs } from './uuid-factory.js'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '../..')

const dataDir = path.join(projectRoot, 'data')
const tempDir = path.join(dataDir, 'temp')
const sourceDir = path.join(dataDir, 'sources', 'enem-api')
const normalizationOutputDir = path.join(tempDir, 'normalized')

const publicDir = path.join(projectRoot, 'frontend/public')
const finalQuestionsDir = path.join(publicDir, 'questions')
const indexesOutputDir = path.join(publicDir, 'indexes')

const logPath = path.join(dataDir, 'build.log')

async function build(): Promise<void> {
  console.log('cleaning output directories')

  await Promise.all([
    rm(tempDir, { recursive: true, force: true }),
    rm(finalQuestionsDir, { recursive: true, force: true }),
    rm(indexesOutputDir, { recursive: true, force: true }),
  ])

  await Promise.all([
    mkdir(tempDir, { recursive: true }),
    mkdir(finalQuestionsDir, { recursive: true }),
    mkdir(indexesOutputDir, { recursive: true }),
  ])

  console.log('normalizing enem api questions')
  await enemApiSourceEntry(sourceDir, normalizationOutputDir, logPath)

  console.log('filling temporary metadata')
  await fillTemporaryMetadata(normalizationOutputDir, logPath)

  console.log('assigning stable question UUIDs and labels')
  await assignQuestionUUIDs(normalizationOutputDir, logPath)

  console.log('generating indexes')
  await generateIndexes({
    logPath,
    normalizedQuestionsDir: normalizationOutputDir,
    finalQuestionsDir,
    indexesOutputDir,
  })

  console.log('build completed.')
}

build().catch((error: unknown) => {
  console.error('build failed:', error)
  process.exitCode = 1
})