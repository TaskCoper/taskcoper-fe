export interface LocalizedText {
  vi: string
  en: string
}

export const emptyLocalizedText = (): LocalizedText => ({ vi: '', en: '' })

export const parseLocalizedText = (raw: Partial<LocalizedText> | undefined): LocalizedText => ({
  vi: raw?.vi ?? '',
  en: raw?.en ?? ''
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

export const safeJsonParse = (s: string): unknown => {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

// A collection section header — title/description/visibility — shared across product palettes.
export interface CollectionSection {
  title: LocalizedText
  description: LocalizedText
  enabled: boolean
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

// The product-card fields shared by every collection card. Sub-palettes can extend
// this with their own extra fields (e.g. occasions adds `campaigns`).
export interface CollectionCard {
  id: string
  image: string
  badge: LocalizedText
  name: LocalizedText
  description: LocalizedText
  categoryIds: string[]
  enabled: boolean
}

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
