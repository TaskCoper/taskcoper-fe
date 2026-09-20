import type { CollectionCard, CollectionSection, LocalizedText } from './types'

// normalize for consistent comparison
export const normalizeGroup = (group: string | null | undefined): string =>
  typeof group === 'string' ? group.trim().toLowerCase() : ''

// get default object for localized text
export const emptyLocalizedText = (): LocalizedText => ({ vi: '', en: '' })

// return translated text or empty string
export const parseLocalizedText = (raw: Partial<LocalizedText> | undefined): LocalizedText => ({
  vi: raw?.vi ?? '',
  en: raw?.en ?? ''
})

// turn string into slug (eg: this-is-a-slug)
export const slugify = (input: string): string =>
  input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// json parse with try catch
export const safeJsonParse = (s: string): unknown => {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

export const defaultCollectionSection = (): CollectionSection => ({
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  enabled: true
})

export const parseCollectionSection = (raw: Partial<CollectionSection> | undefined): CollectionSection => ({
  title: parseLocalizedText(raw?.title),
  description: parseLocalizedText(raw?.description),
  enabled: raw?.enabled ?? true
})

export const defaultCollectionCard = (): CollectionCard => ({
  id: '',
  image: '',
  badge: emptyLocalizedText(),
  name: emptyLocalizedText(),
  description: emptyLocalizedText(),
  categoryIds: [],
  enabled: true
})

export const parseCollectionCard = (raw: Partial<CollectionCard> | undefined): CollectionCard => ({
  ...defaultCollectionCard(),
  ...raw,
  badge: parseLocalizedText(raw?.badge),
  name: parseLocalizedText(raw?.name),
  description: parseLocalizedText(raw?.description),
  categoryIds: Array.isArray(raw?.categoryIds) ? raw.categoryIds.map(String) : [],
  enabled: raw?.enabled ?? true
})
