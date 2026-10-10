import { useEffect, useState } from 'react'
import './BankPage.css'
import { api } from '../api'
import { QuestionButton } from '../shared/QuestionButton/QuestionButton'
import type { QuestionSummary } from '../models'

export function BankPage() {
  const [questions, setQuestions] = useState<QuestionSummary[]>([])

  useEffect(() => {
    let cancelled = false

    api.questions.getAll()
      .then((result) => {
        if (!cancelled) setQuestions(result)
      })
      .catch((error: unknown) => {
        console.error('failed to load questions:', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="section">
      <div>
        <h1>temporário</h1>
      </div>
      <div className='bank-grid'>
        {questions.map((question) => (
          <QuestionButton
            key={question.id}
            questionId={question.id}
            label={question.label}
          />
        ))}
      </div>
    </section>
  )
}