import { useEffect, useSyncExternalStore } from 'react'
import { api } from '../api'
import { isFilterSetting } from '../api/context'
import { Dropdown } from '../shared/Dropdown/Dropdown'
import type { DropdownOption } from '../shared/Dropdown/Dropdown'
import { QuestionButton } from '../shared/QuestionButton/QuestionButton'

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

  function handleFilterChange(value: string) {
    if (!isFilterSetting(value)) return

    api.context.setFilterSetting(value)
  }

  useEffect(() => {
    void api.context.initialize(true).catch((cause: unknown) => {
      console.error('failed to load question context:', cause)
    })
  }, [])

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
      {context.filteredContext.map((group) => (
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
