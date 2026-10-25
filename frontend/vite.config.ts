import { readFile } from 'node:fs/promises'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const SITE_URL = 'https://enem-prep.pages.dev'

interface QuestionIndexEntry {
  id: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isQuestionIndex(value: unknown): value is QuestionIndexEntry[] {
  return Array.isArray(value) && value.every((question) => {
    if (!isRecord(question)) return false

    return typeof question.id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(question.id)
  })
}

function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    apply: 'build' as const,
    async generateBundle() {
      const indexPath = new URL('./public/indexes/allQuestions.json', import.meta.url)
      const index = JSON.parse(await readFile(indexPath, 'utf8')) as unknown

      if (!isQuestionIndex(index)) {
        throw new Error(`Invalid question index for sitemap generation: ${indexPath.pathname}`)
      }

      const urls = [
        `${SITE_URL}/perguntas`,
        `${SITE_URL}/politica-de-privacidade`,
        ...index.map(({ id }) => `${SITE_URL}/perguntas/${id}`),
      ]
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
        '</urlset>',
        '',
      ].join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: sitemap,
      })
    },
  }
}

export default defineConfig({
  publicDir: 'public',
  plugins: [react(), sitemapPlugin()],
})
