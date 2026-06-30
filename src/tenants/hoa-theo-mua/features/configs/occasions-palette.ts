export const OCCASIONS_GROUP = 'occasions'
export const OCCASIONS_COLLECTION_KEY = `${OCCASIONS_GROUP}.collection`

export interface LocalizedText {
  vi: string
  en: string
}

export interface OccasionCampaign {
  // Slug unique within the parent card, e.g. 'thang-2-valentine'.
  id: string
  // Used for SEO <title>/meta and SKU naming — not for the on-card label, which stays fixed.
  campaignName: LocalizedText
  // SKU pattern matched against the catalog, e.g. 'MH02-VAL'.
  skuPrefix: string
  // ISO YYYY-MM-DD, inclusive on both ends.
  startDate: string
  endDate: string
  // When the campaign is active, these override the parent card's categoryIds.
  categoryIds: string[]
  // Optional badge override (e.g. 'Valentine' instead of 'Đặc biệt'). Empty → falls back to card.badge.
  badge: LocalizedText
  enabled: boolean
}

export interface OccasionCard {
  id: string
  image: string
  badge: LocalizedText
  name: LocalizedText
  description: LocalizedText
  categoryIds: string[]
  enabled: boolean
  // Seasonal rotations under the card. Empty for non-seasonal cards.
  campaigns: OccasionCampaign[]
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
  enabled: true,
  campaigns: []
})

export const defaultOccasionCampaign = (): OccasionCampaign => ({
  id: '',
  campaignName: emptyLocalizedText(),
  skuPrefix: '',
  startDate: '',
  endDate: '',
  categoryIds: [],
  badge: emptyLocalizedText(),
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
      categoryIds: Array.isArray(c?.categoryIds) ? c.categoryIds.map(String) : [],
      campaigns: Array.isArray((c as Partial<OccasionCard>)?.campaigns)
        ? ((c as OccasionCard).campaigns as Partial<OccasionCampaign>[]).map((ca) => ({
            ...defaultOccasionCampaign(),
            ...ca,
            campaignName: { vi: ca?.campaignName?.vi ?? '', en: ca?.campaignName?.en ?? '' },
            badge: { vi: ca?.badge?.vi ?? '', en: ca?.badge?.en ?? '' },
            categoryIds: Array.isArray(ca?.categoryIds) ? ca.categoryIds.map(String) : [],
            skuPrefix: typeof ca?.skuPrefix === 'string' ? ca.skuPrefix : '',
            startDate: typeof ca?.startDate === 'string' ? ca.startDate : '',
            endDate: typeof ca?.endDate === 'string' ? ca.endDate : '',
            enabled: ca?.enabled ?? true
          }))
        : []
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
