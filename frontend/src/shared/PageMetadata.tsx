import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { updatePageMetadata } from './pageMetadata'

interface PageMetadataValues {
  title: string
  description: string
  canonicalPath: string
  robots?: string
}

function metadataForPath(pathname: string): PageMetadataValues {
  if (pathname === '/' || pathname === '/perguntas') {
    return {
      title: 'ENEM Prep | Questões do ENEM',
      description: 'Pratique para o ENEM com questões de provas anteriores, organize por matéria e dificuldade e acompanhe seu progresso.',
      canonicalPath: '/',
    }
  }

  if (pathname === '/politica-de-privacidade') {
    return {
      title: 'Política de Privacidade | ENEM Prep',
      description: 'Saiba como o ENEM Prep trata e protege os dados usados para salvar seu progresso de estudos.',
      canonicalPath: pathname,
    }
  }

  if (pathname.startsWith('/perguntas/')) {
    return {
      title: 'Questões do ENEM | ENEM Prep',
      description: 'Resolva questões de provas anteriores do ENEM e acompanhe seu progresso de estudos.',
      canonicalPath: pathname,
    }
  }

  const isManageDataPage = pathname === '/gerir-dados'
  return {
    title: isManageDataPage ? 'Gerir Dados | ENEM Prep' : 'Configurações | ENEM Prep',
    description: isManageDataPage
      ? 'Consulte e gerencie os dados de progresso salvos pelo ENEM Prep.'
      : 'Gerencie suas preferências e os dados salvos pelo ENEM Prep.',
    canonicalPath: pathname,
    robots: 'noindex, nofollow',
  }
}

export function PageMetadata() {
  const { pathname } = useLocation()

  useEffect(() => {
    updatePageMetadata(metadataForPath(pathname))
  }, [pathname])

  return null
}
