const SITE_URL = 'https://enem-prep.pages.dev'

interface PageMetadataValues {
  title: string
  description: string
  canonicalPath: string
  robots?: string
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.content = content
}

export function updatePageMetadata({ title, description, canonicalPath, robots = 'index, follow' }: PageMetadataValues) {
  const canonicalUrl = new URL(canonicalPath, SITE_URL).href
  document.title = title
  setMeta('name', 'description', description)
  setMeta('name', 'robots', robots)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', canonicalUrl)
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)
  }
  canonical.href = canonicalUrl
}
