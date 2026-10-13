import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { DIFFICULTIES, SUBJECTS } from '../models'
import type { QuestionSummary, UserQuestionData } from '../models'
import { Dropdown } from '../shared/Dropdown/Dropdown'
import type { DropdownOption } from '../shared/Dropdown/Dropdown'
import { QuestionButton } from '../shared/QuestionButton/QuestionButton'
import { difficultyMap, subjectMap } from '../constants'

type FilterSetting = 'subject' | 'difficulty' | 'missed' | 'bookmarked'

type DynamicQuestion = QuestionSummary & UserQuestionData

interface QuestionGroup {
  label: string
  questions: DynamicQuestion[]
}

interface BankContainerProps {
  questions: QuestionSummary[]
}

const filterOptions: DropdownOption[] = [
  { value: 'subject', label: 'subject' },
  { value: 'difficulty', label: 'difficulty' },
  { value: 'missed', label: 'missed' },
  { value: 'bookmarked', label: 'bookmarked' },
]

function isFilterSetting(value: string): value is FilterSetting {
  return filterOptions.some((option) => option.value === value)
}

function getFilteredContext(
  filterSetting: FilterSetting,
  fullContext: DynamicQuestion[],
): QuestionGroup[] {
  switch (filterSetting) {
    case 'subject': {
      const groups = SUBJECTS.map((subject) => ({
        label: `${subjectMap[subject].label}`,
        questions: fullContext.filter((question) => question.subject === subject),
      }))
      const unassigned = fullContext.filter((question) => question.subject === null)
      if (unassigned.length > 0) {
        groups.push({ label: 'null', questions: unassigned })
      }
      return groups
    }
    case 'difficulty': {
      const groups = DIFFICULTIES.map((difficulty) => ({
        label: `${difficultyMap[difficulty].label}`,
        questions: fullContext.filter((question) => question.difficulty === difficulty),
      }))
      const unrated = fullContext.filter((question) => question.difficulty === null)
      if (unrated.length > 0) {
        groups.push({ label: 'null', questions: unrated })
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

export function BankContainer({ questions }: BankContainerProps) {
  const [filterSetting, setFilterSetting] = useState<FilterSetting>('subject')
  const filterSettingRef = useRef(filterSetting)
  const [fullContext, setFullContext] = useState<DynamicQuestion[]>([])
  const [filteredContext, setFilteredContext] = useState<QuestionGroup[]>([])
  const [loadingUserData, setLoadingUserData] = useState(true)
  const [userDataError, setUserDataError] = useState(false)

  function handleFilterChange(value: string) {
    if (!isFilterSetting(value)) return

    filterSettingRef.current = value
    setFilterSetting(value)
    setFilteredContext(getFilteredContext(value, fullContext))
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
        <Dropdown
          label="group by"
          value={filterSetting}
          options={filterOptions}
          onChange={handleFilterChange}
        />
      </div>
      {filteredContext.map((group) => (
        <div className="bank-group" key={group.label}>
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
        </div>
      ))}
    </div>
  )
}
