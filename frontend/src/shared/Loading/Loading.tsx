
import type { ReactNode } from 'react'
import './Loading.css'

interface LoadingProps {
  loading: boolean
  error: string | null
  children: ReactNode
  loadingMessage?: string
  empty?: boolean
  emptyMessage?: string
}

export function Loading({
  loading,
  error,
  children,
  loadingMessage = 'Carregando...',
  empty = false,
  emptyMessage = 'Nenhum resultado encontrado.',
}: LoadingProps) {
  if (loading) {
    return (
      <section className="loading-state" role="status">
        <span className="loading-spinner" aria-hidden="true" />
        <p>{loadingMessage}</p>
      </section>
    )
  }

  if (error || empty) {
    return (
      <section className="loading-message">
        <h1>{error || emptyMessage}</h1>
      </section>
    )
  }

  return <>{children}</>
}
