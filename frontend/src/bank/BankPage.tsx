import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { DIFFICULTIES, SUBJECTS } from '../models'
import type { QuestionSummary, UserQuestionData } from '../models'
import { QuestionButton } from '../shared/QuestionButton/QuestionButton'
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
    return <section className="section"><div className="bank-status">carregando questões...</div></section>
  }

  if (error) {
    return <section className="section"><div className="bank-status">não foi possível carregar as questões.</div></section>
  }

  return <BankPage questions={questions} />
}

type FilterSetting = 'subject' | 'difficulty' | 'missed' | 'bookmarked'

type QuestionWithUserData = QuestionSummary & UserQuestionData

interface QuestionGroup {
  label: string
  questions: QuestionWithUserData[]
}

function getFilteredContext(
  filterSetting: FilterSetting,
  fullContext: QuestionWithUserData[],
): QuestionGroup[] {
  switch (filterSetting) {
    case 'subject': {
      const groups = SUBJECTS.map((subject) => ({
        label: subject.replaceAll('_', ' '),
        questions: fullContext.filter((question) => question.subject === subject),
      }))
      const unassigned = fullContext.filter((question) => question.subject === null)
      if (unassigned.length > 0) {
        groups.push({ label: 'unspecified', questions: unassigned })
      }
      return groups
    }
    case 'difficulty': {
      const groups = DIFFICULTIES.map((difficulty) => ({
        label: `difficulty ${difficulty}`,
        questions: fullContext.filter((question) => question.difficulty === difficulty),
      }))
      const unrated = fullContext.filter((question) => question.difficulty === null)
      if (unrated.length > 0) {
        groups.push({ label: 'not rated', questions: unrated })
      }
      return groups
    }
    case 'missed':
      return [{
        label: 'missed',
        questions: fullContext.filter((question) =>
          question.attempts.some((attempt) => !attempt.isCorrect),
        ),
      }]
    case 'bookmarked':
      return [{
        label: 'bookmarked',
        questions: fullContext.filter((question) => question.isBookmarked),
      }]
  }
}

interface FilterDropdownProps {
  value: FilterSetting
  onChange: (setting: FilterSetting) => void
}

function isFilterSetting(value: string): value is FilterSetting {
  return ['subject', 'difficulty', 'missed', 'bookmarked'].includes(value)
}

function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  return (
    <label className="bank-filter">
      <span>group by</span>
      <select
        value={value}
        onChange={(event) => {
          if (isFilterSetting(event.target.value)) onChange(event.target.value)
        }}
      >
        <option value="subject">subject</option>
        <option value="difficulty">difficulty</option>
        <option value="missed">missed</option>
        <option value="bookmarked">bookmarked</option>
      </select>
    </label>
  )
}

function BankContainer({ questions }: BankPageProps) {
  const [filterSetting, setFilterSetting] = useState<FilterSetting>('subject')
  const filterSettingRef = useRef(filterSetting)
  const [fullContext, setFullContext] = useState<QuestionWithUserData[]>([])
  const [filteredContext, setFilteredContext] = useState<QuestionGroup[]>([])
  const [loadingUserData, setLoadingUserData] = useState(true)
  const [userDataError, setUserDataError] = useState(false)

  function handleFilterChange(setting: FilterSetting) {
    filterSettingRef.current = setting
    setFilterSetting(setting)
    setFilteredContext(getFilteredContext(setting, fullContext))
  }

  useEffect(() => {
    let cancelled = false

    async function loadQuestionData() {
      setLoadingUserData(true)
      setUserDataError(false)
      setFullContext([])
      setFilteredContext([])

      try {
        const enrichedQuestions = await Promise.all(
          questions.map(async (question) => ({
            ...question,
            ...await api.userQuestions.getById(question.id),
          })),
        )
        if (!cancelled) {
          setFullContext(enrichedQuestions)
          setFilteredContext(getFilteredContext(filterSettingRef.current, enrichedQuestions))
        }
      } catch (cause: unknown) {
        console.error('failed to load question user data:', cause)
        if (!cancelled) setUserDataError(true)
      } finally {
        if (!cancelled) setLoadingUserData(false)
      }
    }

    void loadQuestionData()
    return () => {
      cancelled = true
    }
  }, [questions])

  if (loadingUserData) {
    return <div className="bank-status">carregando seu progresso...</div>
  }

  if (userDataError) {
    return <div className="bank-status">não foi possível carregar seu progresso.</div>
  }

  return (
    <div className="bank-container">
      <div className="bank-toolbar">
        <FilterDropdown value={filterSetting} onChange={handleFilterChange} />
      </div>
      {filteredContext.map((group) => (
        <section className="bank-group" key={group.label}>
          <h2>{group.label}</h2>
          <div className="bank-grid">
            {group.questions.map((question) => (
              <QuestionButton
                key={question.id}
                questionId={question.id}
                label={question.label}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
