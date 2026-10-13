import { useEffect, useState } from 'react'
import { api } from '../api'
import type { QuestionSummary } from '../models'
import { BankContainer } from './BankContainer'
import './BankPage.css'

interface BankPageProps {
  questions: QuestionSummary[]
}

export function BankPage({ questions }: BankPageProps) {
  return (
    <section className="section">
      <BankContainer questions={questions} />
    </section>
  )
}

export function BankRoute() {
  const [questions, setQuestions] = useState<QuestionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadQuestions() {
      setLoading(true)
      setError(false)

      try {
        const result = await api.questions.getAll()
        if (!cancelled) setQuestions(result)
      } catch (cause: unknown) {
        console.error('failed to load questions:', cause)
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadQuestions()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <section><div><h1>carregando questões</h1></div></section>
  }

  if (error) {
    return <section><div><h1>não foi possível carregar as questões</h1></div></section>
  }

  return <BankPage questions={questions} />
}
