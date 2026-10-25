import './question.css';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Loading } from '../shared/Loading/Loading'

import { api } from '../api';
import { parseUUID } from '../models'
import type { Alternative, Question, QuestionId } from '../models'
import { QuestionContainer } from './QuestionContainer';



export function QuestionRoute() {
  const { id } = useParams()

  const [question, setQuestion] = useState<Question | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [savingBookmark, setSavingBookmark] = useState(false)
  const [bookmarkError, setBookmarkError] = useState<string | null>(null)
  const [previousId, setPreviousId] = useState<QuestionId>()
  const [nextId, setNextId] = useState<QuestionId>()
  const [navigationLoading, setNavigationLoading] = useState(true)
  const [navigationError, setNavigationError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadQuestion() {
      let loadingStage = 'validating question id'
      setLoading(true)
      setError(null)
      setQuestion(undefined)
      setNavigationLoading(true)
      setNavigationError(false)
      setPreviousId(undefined)
      setNextId(undefined)
      setBookmarkError(null)

      if (!id) {
        setLoading(false)
        setNavigationLoading(false)
        return
      }

      try {
        const questionId = parseUUID(id)
        loadingStage = 'loading question data and saved progress'
        const [result, userData] = await Promise.all([
          api.questions.getById(questionId),
          api.userQuestions.getById(questionId),
        ])

        if (!result) {
          console.warn('question is not present in the question index:', {
            requestedId: id,
            normalizedId: questionId,
          })
        }

        if (!cancelled) {
          setQuestion(result)
          setBookmarked(userData.isBookmarked)
        }

        try {
          loadingStage = 'loading question navigation'
          const [previous, next] = await Promise.all([
            api.previousQuestion(),
            api.nextQuestion(),
          ])
          if (!cancelled) {
            setPreviousId(previous)
            setNextId(next)
          }
        } catch (cause) {
          console.error('failed to load question navigation:', cause)
          if (!cancelled) setNavigationError(true)
        } finally {
          if (!cancelled) setNavigationLoading(false)
        }
      } catch (cause) {
        console.error('failed to load individual question:', {
          requestedId: id,
          stage: loadingStage,
          cause,
        })
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

  const onToggleBookmark = useCallback(async () => {
    if (!question || savingBookmark) return
    const next = !bookmarked
    setSavingBookmark(true)
    setBookmarkError(null)
    try {
      await api.userQuestions.setBookmarked(question.id, next)
      setBookmarked(next)
    } catch (cause) {
      console.error('failed to update question bookmark:', cause)
      setBookmarkError('erro')
    } finally {
      setSavingBookmark(false)
    }
  }, [bookmarked, question, savingBookmark])

  const onAttempt = useCallback(async (selectedAlternativeIndex: Alternative['index'], isCorrect: boolean) => {
    if (!question) return
    try {
      await api.attempts.record(question.id, { selectedAlternativeIndex, isCorrect })
    } catch (cause) {
      console.error('failed to record question attempt:', cause)
    }
  }, [question])

  
  return (
    <Loading
      loading={loading}
      error={error}
      empty={!question}
      loadingMessage="Carregando questão"
      emptyMessage="Questão não encontrada"
    >
      <section className="question-page">
        <div className="question-parent">
          <QuestionContainer
            question={question!}
            bookmarked={bookmarked}
            savingBookmark={savingBookmark}
            bookmarkError={bookmarkError}
            onToggleBookmark={() => void onToggleBookmark()}
            onAttempt={(selected, isCorrect) => void onAttempt(selected, isCorrect)}
            previousId={previousId}
            nextId={nextId}
            navigationLoading={navigationLoading}
            navigationError={navigationError}
          />
        </div>
      </section>
    </Loading>
  )
}
