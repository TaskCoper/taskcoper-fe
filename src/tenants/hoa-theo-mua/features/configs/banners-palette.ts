import { emptyLocalizedText, parseLocalizedText, safeJsonParse, type LocalizedText } from './palette-shared'

/** A banner shape: the ratio to frame against, plus how to describe it to an author. */
export interface BannerShape {
  aspect: number
  /** Written as a ratio, e.g. `16:5`. */
  label: string
  /** A concrete upload size at that ratio, e.g. `1920×600`. */
  example: string
}

const SHAPE_3_1: BannerShape = { aspect: 3, label: '3:1', example: '1800×600' }
const SHAPE_16_5: BannerShape = { aspect: 16 / 5, label: '16:5', example: '1920×600' }
const SHAPE_5_1: BannerShape = { aspect: 5, label: '5:1', example: '2800×560' }

/**
 * Banner shapes, by storefront slot. The storefront renders banners with `w-full h-auto` (no
 * fixed crop box), so these ratios are an upload guide matching each slot's fallback art, not an
 * enforced crop.
 */
export const BANNER_SLOT_SHAPE: Record<string, BannerShape> = {
  /** `banner-one.webp`, 2172×678. */
  'home.collection': SHAPE_16_5,
  /** `sale-banner.webp`, 2804×561. */
  'home.sale': SHAPE_5_1,
  /** Both fall back to `sale-banner.webp` through `ProductsPromiseSection`. */
  products: SHAPE_5_1,
  product: SHAPE_5_1
}

/** The slots the storefront names in `types/config.type.ts` → `BANNER_SLOTS`. */
export const KNOWN_BANNER_SLOTS: string[] = Object.keys(BANNER_SLOT_SHAPE)

/** Fallback for slots with no known box; 3:1 is the safe (widest) end of the design's actual 3.2:1-5:1 range. */
export const DEFAULT_BANNER_SHAPE = SHAPE_3_1

// Mirrors the storefront's own `normalizeSlot` (`hooks/use-banner-by-slot.ts`), so a slot typed as
// `Home_Collection` resolves here exactly as it will resolve there.
const normalizeSlot = (slot: string): string =>
  slot
    .trim()
    .toLowerCase()
    .replace(/[-_.\s]/g, '')

const SHAPE_BY_NORMALIZED_SLOT = new Map(
  Object.entries(BANNER_SLOT_SHAPE).map(([slot, shape]) => [normalizeSlot(slot), shape])
)

export const bannerShapeForSlot = (slot: string): BannerShape =>
  SHAPE_BY_NORMALIZED_SLOT.get(normalizeSlot(slot)) ?? DEFAULT_BANNER_SHAPE

export const BANNERS_GROUP = 'banners'
export const BANNERS_KEY_PREFIX = `${BANNERS_GROUP}.`

export const matchesBannerKey = (key: string): boolean =>
  key.startsWith(BANNERS_KEY_PREFIX) && key.length > BANNERS_KEY_PREFIX.length

export const bannerKeySuffix = (key: string): string =>
  key.startsWith(BANNERS_KEY_PREFIX) ? key.slice(BANNERS_KEY_PREFIX.length) : key

// Free-form slot key (e.g. "hero", "sidebar-top", "checkout-footer").
// Frontend components filter banners by this string.
export interface BannerItem {
  id: string
  slot: string
  image: LocalizedText
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
  image: emptyLocalizedText(),
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

const parseBannerItem = (raw: Partial<BannerItem> | undefined): BannerItem => {
  // Legacy items stored a single image URL; reuse it for both locales so existing banners keep rendering.
  const rawImage: unknown = raw?.image
  return {
    ...defaultBannerItem(),
    ...raw,
    id: typeof raw?.id === 'string' && raw.id ? raw.id : genId(),
    slot: raw?.slot ?? '',
    image:
      typeof rawImage === 'string'
        ? { vi: rawImage, en: rawImage }
        : parseLocalizedText(rawImage as Partial<LocalizedText> | undefined),
    href: raw?.href ?? '',
    openInNewTab: Boolean(raw?.openInNewTab),
    alt: parseLocalizedText(raw?.alt),
    enabled: raw?.enabled ?? true
  }
}

// Convenience: distinct slot keys already used in the collection (for autocomplete).
export const collectSlotKeys = (items: BannerItem[]): string[] => {
  const set = new Set<string>()
  for (const item of items) if (item.slot.trim()) set.add(item.slot.trim())
  return Array.from(set).sort()
}
