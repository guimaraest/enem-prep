import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Forminit } from 'forminit'
import { WarningTriangle, Xmark } from 'iconoir-react'

const FORM_ID = '27v8euj36gr'
const ISSUE_FIELD_ERRORS: Record<string, string> = {}
const forminit = new Forminit()

function getErrorMessage(error?: { error?: string; fieldName?: string; message?: string }): string {
  const field = error?.fieldName ?? /['"]([^'"]+)['"]/.exec(error?.message ?? '')?.[1]
  if (field && ISSUE_FIELD_ERRORS[field]) return ISSUE_FIELD_ERRORS[field]
  if (error?.error === 'TOO_MANY_REQUESTS') return 'Aguarde alguns segundos antes de tentar novamente.'
  return 'Não foi possível enviar o relato. Tente novamente.'
}

export function ReportIssueForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')
  const sendingRef = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sendingRef.current) return

    const form = event.currentTarget
    const formData = new FormData(form)
    sendingRef.current = true
    setSending(true)
    setStatus('')

    try {
      const { data, error } = await forminit.submit(FORM_ID, formData)
      if (error || typeof data?.hashId !== 'string') {
        console.error('Forminit:', error ?? data)
        setStatus(getErrorMessage(error))
        return
      }

      setStatus('Relato enviado. Obrigado por avisar!')
    } catch (cause) {
      console.error('Forminit:', cause)
      setStatus('Não foi possível enviar o relato. Tente novamente.')
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  function toggleForm() {
    setIsOpen((open) => !open)
    setStatus('')
  }

  return (
    <div className="report-issue">
      <button
        className="report-issue-trigger"
        type="button"
        aria-label="relatar problema nesta questão"
        aria-expanded={isOpen}
        aria-controls="report-issue-form"
        onClick={toggleForm}
      >
        <WarningTriangle aria-hidden="true" height={20} width={20} />
      </button>

      {isOpen && (
        <div className="report-issue-popover">
          <div className="report-issue-heading">
            <span>relatar problema</span>
            <button
              className="report-issue-close"
              type="button"
              aria-label="fechar formulário de relato"
              onClick={toggleForm}
            >
              <Xmark aria-hidden="true" height={16} width={16} />
            </button>
          </div>
          <form id="report-issue-form" onSubmit={(event) => void handleSubmit(event)}>
            <label className="report-issue-label" htmlFor="report-issue-text">
              qual é o erro nesta questão?
            </label>
            <textarea
              id="report-issue-text"
              name="fi-text-issue"
              maxLength={500}
              required
              aria-label="qual é o erro nesta questão?"
            />
            <button className="report-issue-submit" type="submit" disabled={sending}>
              enviar relato
            </button>
            <p className="report-issue-status" role="status">{status}</p>
          </form>
        </div>
      )}
    </div>
  )
}
