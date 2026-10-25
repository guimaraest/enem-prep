import { useEffect, useState, useSyncExternalStore } from 'react'
import { api } from '../api'
import { isFilterSetting } from '../api/context'
import { Dropdown } from '../shared/Dropdown/Dropdown'
import type { DropdownOption } from '../shared/Dropdown/Dropdown'
import { QuestionButton } from '../shared/QuestionButton/QuestionButton'
import type { UserQuestionData } from '../models'

const filterOptions: DropdownOption[] = [
  { value: 'subject', label: 'subject' },
  { value: 'difficulty', label: 'difficulty' },
  { value: 'missed', label: 'missed' },
  { value: 'bookmarked', label: 'bookmarked' },
]

export function BankContainer() {
  const context = useSyncExternalStore(
    api.context.subscribe,
    api.context.getSnapshot,
    api.context.getSnapshot,
  )
  const [userDataByQuestion, setUserDataByQuestion] = useState<Record<string, UserQuestionData>>({})
  const [showUserState] = useState(true)

  function handleFilterChange(value: string) {
    if (!isFilterSetting(value)) return

    api.context.setFilterSetting(value)
  }

  useEffect(() => {
    void api.context.initialize(true).catch((cause: unknown) => {
      console.error('failed to load question context:', cause)
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    void Promise.all(context.fullContext.map((question) => api.userQuestions.getById(question.id)))
      .then((userData) => {
        if (cancelled) return
        setUserDataByQuestion(Object.fromEntries(userData.map((data) => [data.questionId, data])))
      })
      .catch((cause: unknown) => {
        console.error('failed to load question user data:', cause)
      })
    return () => { cancelled = true }
  }, [context.fullContext])

  if (context.loading) {
    return <div className="bank-status">carregando seu progresso...</div>
  }

  if (context.error) {
    return <div className="bank-status">não foi possível carregar seu progresso.</div>
  }

  return (
    <div className="bank-container">
      <div className="bank-toolbar">
        <Dropdown
          label="group by"
          value={context.filterSetting}
          options={filterOptions}
          onChange={handleFilterChange}
        />
      </div>
      <div className="bank-groups">
        {context.filteredContext.map((group) => (
          <div className="bank-group" key={group.label}>
            <h2>{group.label}</h2>
            <div className="bank-grid">
              {group.questions.map((question) => (
                <QuestionButton
                  key={question.id}
                  questionId={question.id}
                  label={question.label}
                  difficulty={question.difficulty}
                  subject={question.subject}
                  userdata={userDataByQuestion[question.id] ?? {
                    questionId: question.id,
                    isBookmarked: question.isBookmarked,
                    attempts: [],
                  }}
                  showUserState={showUserState}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
