import './QuestionPage.css';

import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { api } from '../api';
import type { Question } from '../models'
import { QuestionContainer } from './QuestionContainer';



export function QuestionPage() {
  const { id } = useParams()

  const [question, setQuestion] = useState<Question | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadQuestion() {
      setLoading(true)
      setError(null)
      setQuestion(undefined)

      if (!id) {
        setLoading(false)
        return
      }

      try {
        const result = await api.questions.getById(id)

        if (!cancelled) {
          setQuestion(result)
        }
      } catch {
        if (!cancelled) {
          setError('não foi possível carregar a questão.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadQuestion()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <section>
        <div>
            <h1>carregando</h1>
        </div>
    </section>
  }

  if (error) {
    return (
        <section>
            <div>
                <h1>{error}</h1>
            </div>
        </section>
    )
  }

  if (!question) {
    return (
        <section>
            <div>
                <h1>questão não encontrada</h1>
            </div>
        </section>
    )
  }

  return (
    <section>
      <div className="question-parent">
        <QuestionContainer question={question} />
      </div>
    </section>
  )
}