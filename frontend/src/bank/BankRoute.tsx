import { useEffect, useState } from 'react'
import { api } from '../api'
import type { QuestionSummary } from '../models'
import { BankContainer } from './BankContainer'
import { Loading } from '../shared/Loading/Loading'
import './bank.css'

export function BankRoute() {
  const [questions, setQuestions] = useState<QuestionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadQuestions() {
      setLoading(true)
      setError(null)

      try {
        const result = await api.questions.getAll()
        if (!cancelled) setQuestions(result)
      } catch (cause: unknown) {
        console.error('failed to load questions:', cause)
        if (!cancelled) {
          setError('Não foi possível carregar as questões.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadQuestions()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Loading
      loading={loading}
      error={error}
      loadingMessage="Carregando questões"
    >
      <section className="section">
        <BankContainer questions={questions} />
      </section>
    </Loading>
  )
}