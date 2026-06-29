export const OCCASIONS_GROUP = 'occasions'
export const OCCASIONS_COLLECTION_KEY = `${OCCASIONS_GROUP}.collection`

export interface LocalizedText {
  vi: string
  en: string
}

export interface OccasionCard {
  id: string
  image: string
  badge: LocalizedText
  name: LocalizedText
  description: LocalizedText
  categoryIds: string[]
  enabled: boolean
}

export interface OccasionCollection {
  section: {
    title: LocalizedText
    description: LocalizedText
    enabled: boolean
  }
  cards: OccasionCard[]
}

export const emptyLocalizedText = (): LocalizedText => ({ vi: '', en: '' })

export const defaultOccasionCollection = (): OccasionCollection => ({
  section: {
    title: emptyLocalizedText(),
    description: emptyLocalizedText(),
    enabled: true
  },
  cards: []
})

export const defaultOccasionCard = (): OccasionCard => ({
  id: '',
  image: '',
  badge: emptyLocalizedText(),
  name: emptyLocalizedText(),
  description: emptyLocalizedText(),
  categoryIds: [],
  enabled: true
})

// Strip diacritics + lowercase + kebab — used to derive a URL-safe id from the VI name.
export const slugify = (input: string): string =>
  input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const parseOccasionCollection = (raw: unknown): OccasionCollection => {
  const fromString = typeof raw === 'string' ? safeJsonParse(raw) : raw
  if (!fromString || typeof fromString !== 'object') return defaultOccasionCollection()
  const obj = fromString as Partial<OccasionCollection>
  const section = obj.section ?? defaultOccasionCollection().section
  const cards = Array.isArray(obj.cards) ? obj.cards : []
  return {
    section: {
      title: { vi: section.title?.vi ?? '', en: section.title?.en ?? '' },
      description: { vi: section.description?.vi ?? '', en: section.description?.en ?? '' },
      enabled: section.enabled ?? true
    },
    cards: cards.map((c) => ({
      ...defaultOccasionCard(),
      ...c,
      badge: { vi: c?.badge?.vi ?? '', en: c?.badge?.en ?? '' },
      name: { vi: c?.name?.vi ?? '', en: c?.name?.en ?? '' },
      description: { vi: c?.description?.vi ?? '', en: c?.description?.en ?? '' },
      categoryIds: Array.isArray(c?.categoryIds) ? c.categoryIds.map(String) : []
    }))
  }
}

const safeJsonParse = (s: string): unknown => {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}
