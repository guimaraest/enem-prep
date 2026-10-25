import {
  appendFile,
  cp,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import {
  DIFFICULTIES,
  SUBJECTS,
  type Difficulty,
  type Question,
  type Subject,
} from '../../frontend/src/models.js'

type SourceAlternative = {
  letter: string
  text: string | null
  file: string | null
}

type SourceQuestion = {
  title: string | null
  index: number
  year: number
  difficulty: Difficulty | null
  subject: Subject | null
  context: string | null
  files: string[]
  correctAlternative: string
  alternativesIntroduction: string | null
  alternatives: SourceAlternative[]
}

export async function enemSourceQuestionsEntry(
  inputDir: string,
  outputDir: string,
  logPath: string,
): Promise<void> {
  await mkdir(outputDir, { recursive: true })
  await mkdir(path.dirname(logPath), { recursive: true })
  await writeFile(logPath, '')

  async function log(message: string): Promise<void> {
    await appendFile(
      logPath,
      `[${new Date().toISOString()}] ${message}\n`,
    )
  }

  function isRecord(value: unknown): value is Record<string, unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    )
  }

  function isDifficulty(value: unknown): value is Difficulty | null {
    return value === null || DIFFICULTIES.some((difficulty) => difficulty === value)
  }

  function isSubject(value: unknown): value is Subject | null {
    return value === null || SUBJECTS.some((subject) => subject === value)
  }

  function isSourceQuestion(value: unknown): value is SourceQuestion {
    if (!isRecord(value)) return false

    return (
      (typeof value.title === 'string' || value.title === null) &&
      Number.isInteger(value.index) &&
      Number.isInteger(value.year) &&
      isDifficulty(value.difficulty) &&
      isSubject(value.subject) &&
      (typeof value.context === 'string' || value.context === null) &&
      Array.isArray(value.files) &&
      value.files.every((file) => typeof file === 'string') &&
      typeof value.correctAlternative === 'string' &&
      (typeof value.alternativesIntroduction === 'string' ||
        value.alternativesIntroduction === null) &&
      Array.isArray(value.alternatives) &&
      value.alternatives.every(
        (alternative) =>
          isRecord(alternative) &&
          typeof alternative.letter === 'string' &&
          (typeof alternative.text === 'string' ||
            alternative.text === null) &&
          (typeof alternative.file === 'string' ||
            alternative.file === null),
      )
    )
  }

  let years

  try {
    years = await readdir(inputDir, { withFileTypes: true })
  } catch (error) {
    await log(
      `ERROR: Cannot read input directory "${inputDir}": ${String(error)}`,
    )
    throw error
  }

  const usedOutputDirs = new Set<string>()

  for (const yearEntry of years) {
    if (!yearEntry.isDirectory() || !/^\d{4}$/.test(yearEntry.name)) {
      continue
    }

    const questionsDir = path.join(inputDir, yearEntry.name, 'questions')

    let questionDirs

    try {
      questionDirs = await readdir(questionsDir, {
        withFileTypes: true,
      })
    } catch (error) {
      await log(
        `WARNING: Cannot read questions directory "${questionsDir}": ${String(error)}`,
      )
      continue
    }

    for (const entry of questionDirs) {
      if (!entry.isDirectory()) continue

      const sourceQuestionDir = path.join(questionsDir, entry.name)
      const detailsPath = path.join(sourceQuestionDir, 'details.json')

      let parsed: unknown

      try {
        parsed = JSON.parse(await readFile(detailsPath, 'utf8'))
      } catch (error) {
        await log(
          `ERROR: Cannot parse "${detailsPath}": ${String(error)}`,
        )
        continue
      }

      if (!isSourceQuestion(parsed)) {
        await log(
          `ERROR: Unexpected question structure in "${detailsPath}"`,
        )
        continue
      }

      const source = parsed

      if (source.title === null) continue

      if (String(source.year) !== yearEntry.name) {
        await log(
          `WARNING: Year mismatch in "${detailsPath}": directory=${yearEntry.name}, data=${source.year}`,
        )
      }

      const relativeOutput = `${source.year}-${source.index}`
      const questionDir = path.join(outputDir, relativeOutput)

      if (usedOutputDirs.has(relativeOutput)) {
        await log(
          `ERROR: Output directory collision: "${relativeOutput}"`,
        )
        continue
      }

      usedOutputDirs.add(relativeOutput)

      try {
        await mkdir(questionDir, { recursive: true })

        const imagesDir = path.join(questionDir, 'images')
        await mkdir(imagesDir, { recursive: true })

        await copyImages(
          sourceQuestionDir,
          imagesDir,
          source,
          detailsPath,
          log,
        )

        const question: Omit<Question, 'id'> = {
          label: 0,
          title: source.title,
          source: `enem ${source.year}` as Question['source'],
          difficulty: source.difficulty,
          percentCorrectRate: null,
          subject: source.subject,
          content: {
            files: source.files.map((url) => ({
              url: `images/${path.basename(url)}`,
              type: 'image',
            })),
            problem: source.context ?? '',
            command: source.alternativesIntroduction,
            alternatives: source.alternatives.map((alternative) => ({
              index: alternative.letter.toLowerCase() as
                | 'a'
                | 'b'
                | 'c'
                | 'd'
                | 'e',
              text: alternative.text ?? '',
              ...(alternative.file
                ? {
                    file: {
                      url: `images/${path.basename(alternative.file)}`,
                      type: 'image' as const,
                    },
                  }
                : {}),
            })),
            correctAlternative: source.correctAlternative.toLowerCase() as
              | 'a'
              | 'b'
              | 'c'
              | 'd'
              | 'e',
            explanation: '',
          },
        }

        await writeFile(
          path.join(questionDir, 'question.json'),
          JSON.stringify(question, null, 2),
        )
      } catch (error) {
        await log(
          `ERROR: Failed to normalize "${detailsPath}": ${String(error)}`,
        )
      }
    }
  }
}

async function copyImages(
  sourceDir: string,
  destinationDir: string,
  source: SourceQuestion,
  detailsPath: string,
  log: (message: string) => Promise<void>,
): Promise<void> {
  const entries = await readdir(sourceDir, { withFileTypes: true })

  const availableImages = new Set(
    entries
      .filter(
        (entry) =>
          entry.isFile() &&
          /\.(png|jpe?g|gif|webp|svg|bmp|latex)$/i.test(entry.name),
      )
      .map((entry) => entry.name),
  )

  const referencedImages = new Set([
    ...source.files,
    ...source.alternatives.flatMap((alternative) =>
      alternative.file ? [alternative.file] : [],
    ),
  ])

  for (const reference of referencedImages) {
    const filename = path.basename(reference)

    if (!availableImages.has(filename)) {
      await log(
        `ERROR: Referenced image "${reference}" not found beside "${detailsPath}"`,
      )
      throw new Error(`Missing referenced image: ${reference}`)
    }

    try {
      await cp(
        path.join(sourceDir, filename),
        path.join(destinationDir, filename),
      )
    } catch (error) {
      await log(
        `ERROR: Failed to copy image "${filename}" for "${detailsPath}": ${String(error)}`,
      )
      throw error
    }
  }
}