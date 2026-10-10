import { rm, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { enemApiSourceEntry } from './source-enem-api.ts'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '../..')

const tempDir = path.join(projectRoot, 'data/temp')
const enemApiSourceDir = path.join(projectRoot, 'data/sources/enem-api')
const normalizationOutputDir = path.join(tempDir, 'normalized')
const logPath = path.join(projectRoot, 'data/build.log')

async function build(): Promise<void> {
  console.log('cleaning temporary files')
  await rm(tempDir, { recursive: true, force: true })
  await mkdir(tempDir, { recursive: true })

  console.log('normalizing enem api questions')
  await enemApiSourceEntry(enemApiSourceDir, normalizationOutputDir, logPath)

  console.log('build completed.')
}

build().catch((error: unknown) => {
  console.error('build failed:', error)
})