import {
  defaultCollectionCard,
  defaultCollectionSection,
  parseCollectionCard,
  parseCollectionSection,
  safeJsonParse,
  type CollectionCard,
  type CollectionSection
} from './palette-shared'

export { emptyLocalizedText, slugify, type LocalizedText } from './palette-shared'

export const MAINLINE_GROUP = 'products'
export const MAINLINE_COLLECTION_KEY = `${MAINLINE_GROUP}.mainline`

export type MainlineCard = CollectionCard

export interface MainlineCollection {
  section: CollectionSection
  cards: MainlineCard[]
}

export const defaultMainlineCollection = (): MainlineCollection => ({
  section: defaultCollectionSection(),
  cards: []
})

export const defaultMainlineCard = (): MainlineCard => defaultCollectionCard()

export const parseMainlineCollection = (raw: unknown): MainlineCollection => {
  const fromString = typeof raw === 'string' ? safeJsonParse(raw) : raw
  if (!fromString || typeof fromString !== 'object') return defaultMainlineCollection()
  const obj = fromString as Partial<MainlineCollection>
  const cards = Array.isArray(obj.cards) ? obj.cards : []
  return {
    section: parseCollectionSection(obj.section),
    cards: cards.map(parseCollectionCard)
  }
}
