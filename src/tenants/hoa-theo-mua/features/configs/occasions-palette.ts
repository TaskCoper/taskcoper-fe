import {
  defaultCollectionCard,
  defaultCollectionSection,
  emptyLocalizedText,
  parseCollectionCard,
  parseCollectionSection,
  parseLocalizedText,
  safeJsonParse,
  type CollectionCard,
  type CollectionSection,
  type LocalizedText
} from './palette-shared'

export { emptyLocalizedText, slugify, type LocalizedText } from './palette-shared'

export const OCCASIONS_GROUP = 'products'
export const OCCASIONS_COLLECTION_KEY = `${OCCASIONS_GROUP}.occasions`

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

export interface OccasionCard extends CollectionCard {
  // Seasonal rotations under the card. Empty for non-seasonal cards.
  campaigns: OccasionCampaign[]
}

export interface OccasionCollection {
  section: CollectionSection
  cards: OccasionCard[]
}

export const defaultOccasionCollection = (): OccasionCollection => ({
  section: defaultCollectionSection(),
  cards: []
})

export const defaultOccasionCard = (): OccasionCard => ({
  ...defaultCollectionCard(),
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

export const parseOccasionCollection = (raw: unknown): OccasionCollection => {
  const fromString = typeof raw === 'string' ? safeJsonParse(raw) : raw
  if (!fromString || typeof fromString !== 'object') return defaultOccasionCollection()
  const obj = fromString as Partial<OccasionCollection>
  const cards = Array.isArray(obj.cards) ? obj.cards : []
  return {
    section: parseCollectionSection(obj.section),
    cards: cards.map((c) => ({
      ...parseCollectionCard(c),
      campaigns: Array.isArray(c?.campaigns) ? c.campaigns.map(parseOccasionCampaign) : []
    }))
  }
}

const parseOccasionCampaign = (raw: Partial<OccasionCampaign> | undefined): OccasionCampaign => ({
  ...defaultOccasionCampaign(),
  ...raw,
  campaignName: parseLocalizedText(raw?.campaignName),
  badge: parseLocalizedText(raw?.badge),
  categoryIds: Array.isArray(raw?.categoryIds) ? raw.categoryIds.map(String) : [],
  skuPrefix: typeof raw?.skuPrefix === 'string' ? raw.skuPrefix : '',
  startDate: typeof raw?.startDate === 'string' ? raw.startDate : '',
  endDate: typeof raw?.endDate === 'string' ? raw.endDate : '',
  enabled: raw?.enabled ?? true
})
