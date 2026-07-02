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
import { ConfigKind, InputType, type Config } from './types'

export { emptyLocalizedText, slugify, type LocalizedText } from './palette-shared'

export const PRODUCT_COLLECTION_GROUP = 'products'
export const PRODUCT_COLLECTION_KEY_PREFIX = `${PRODUCT_COLLECTION_GROUP}.`

// A product-group config is a "collection" when it stores json content. That filters
// out any future non-collection products.* configs (e.g. products.priceCap as text).
export const matchesProductCollectionConfig = (config: Config): boolean =>
  config.value.group === PRODUCT_COLLECTION_GROUP &&
  config.kind === ConfigKind.content &&
  config.value.inputType === InputType.json &&
  config.key.startsWith(PRODUCT_COLLECTION_KEY_PREFIX) &&
  config.key.length > PRODUCT_COLLECTION_KEY_PREFIX.length

export const productCollectionKeySuffix = (key: string): string =>
  key.startsWith(PRODUCT_COLLECTION_KEY_PREFIX) ? key.slice(PRODUCT_COLLECTION_KEY_PREFIX.length) : key

export interface ProductCollectionCampaign {
  id: string
  campaignName: LocalizedText
  skuPrefix: string
  startDate: string
  endDate: string
  categoryIds: string[]
  badge: LocalizedText
  enabled: boolean
}

export interface ProductCollectionCard extends CollectionCard {
  // Always present so toggling hasCampaigns off/on in the editor preserves data.
  campaigns: ProductCollectionCampaign[]
}

export interface ProductCollection {
  section: CollectionSection
  hasCampaigns: boolean
  cards: ProductCollectionCard[]
}

export const defaultProductCollectionCampaign = (): ProductCollectionCampaign => ({
  id: '',
  campaignName: emptyLocalizedText(),
  skuPrefix: '',
  startDate: '',
  endDate: '',
  categoryIds: [],
  badge: emptyLocalizedText(),
  enabled: true
})

export const defaultProductCollectionCard = (): ProductCollectionCard => ({
  ...defaultCollectionCard(),
  campaigns: []
})

export const defaultProductCollection = (): ProductCollection => ({
  section: defaultCollectionSection(),
  hasCampaigns: false,
  cards: []
})

const parseCampaign = (raw: Partial<ProductCollectionCampaign> | undefined): ProductCollectionCampaign => ({
  ...defaultProductCollectionCampaign(),
  ...raw,
  campaignName: parseLocalizedText(raw?.campaignName),
  badge: parseLocalizedText(raw?.badge),
  categoryIds: Array.isArray(raw?.categoryIds) ? raw.categoryIds.map(String) : [],
  skuPrefix: typeof raw?.skuPrefix === 'string' ? raw.skuPrefix : '',
  startDate: typeof raw?.startDate === 'string' ? raw.startDate : '',
  endDate: typeof raw?.endDate === 'string' ? raw.endDate : '',
  enabled: raw?.enabled ?? true
})

export const parseProductCollection = (raw: unknown): ProductCollection => {
  const obj = (typeof raw === 'string' ? safeJsonParse(raw) : raw) as Partial<ProductCollection> | null
  if (!obj || typeof obj !== 'object') return defaultProductCollection()

  const rawCards = Array.isArray(obj.cards) ? obj.cards : []
  const cards: ProductCollectionCard[] = rawCards.map((c) => ({
    ...parseCollectionCard(c),
    campaigns: Array.isArray(c?.campaigns) ? c.campaigns.map(parseCampaign) : []
  }))

  // Legacy rows saved before the toggle existed: infer from data. New rows persist the flag.
  const hasCampaigns =
    typeof obj.hasCampaigns === 'boolean' ? obj.hasCampaigns : cards.some((c) => c.campaigns.length > 0)

  return {
    section: parseCollectionSection(obj.section),
    hasCampaigns,
    cards
  }
}
