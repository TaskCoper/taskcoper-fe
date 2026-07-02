import { emptyLocalizedText, parseLocalizedText, safeJsonParse, type LocalizedText } from './palette-shared'

export const BANNERS_GROUP = 'banners'
export const BANNERS_COLLECTION_KEY = `${BANNERS_GROUP}.collection`

// Free-form slot key (e.g. "hero", "sidebar-top", "checkout-footer").
// Frontend components filter banners by this string.
export interface BannerItem {
  id: string
  slot: string
  image: string
  href: string
  openInNewTab: boolean
  alt: LocalizedText
  enabled: boolean
}

export interface BannerCollection {
  section: {
    enabled: boolean
  }
  items: BannerItem[]
}

const genId = (): string => `bn_${Math.random().toString(36).slice(2, 8)}`

export const defaultBannerItem = (): BannerItem => ({
  id: genId(),
  slot: '',
  image: '',
  href: '',
  openInNewTab: false,
  alt: emptyLocalizedText(),
  enabled: true
})

export const defaultBannerCollection = (): BannerCollection => ({
  section: { enabled: true },
  items: []
})

export const parseBannerCollection = (raw: unknown): BannerCollection => {
  const fromString = typeof raw === 'string' ? safeJsonParse(raw) : raw
  if (!fromString || typeof fromString !== 'object') return defaultBannerCollection()
  const obj = fromString as Partial<BannerCollection>
  const items = Array.isArray(obj.items) ? obj.items : []
  return {
    section: { enabled: obj.section?.enabled ?? true },
    items: items.map(parseBannerItem)
  }
}

const parseBannerItem = (raw: Partial<BannerItem> | undefined): BannerItem => ({
  ...defaultBannerItem(),
  ...raw,
  id: typeof raw?.id === 'string' && raw.id ? raw.id : genId(),
  slot: raw?.slot ?? '',
  image: raw?.image ?? '',
  href: raw?.href ?? '',
  openInNewTab: Boolean(raw?.openInNewTab),
  alt: parseLocalizedText(raw?.alt),
  enabled: raw?.enabled ?? true
})

// Convenience: distinct slot keys already used in the collection (for autocomplete).
export const collectSlotKeys = (items: BannerItem[]): string[] => {
  const set = new Set<string>()
  for (const item of items) if (item.slot.trim()) set.add(item.slot.trim())
  return Array.from(set).sort()
}
