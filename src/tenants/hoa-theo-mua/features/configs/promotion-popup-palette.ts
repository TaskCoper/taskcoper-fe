import { emptyLocalizedText, parseLocalizedText, safeJsonParse } from './palette-shared'
import {
  POPUP_FREQUENCIES,
  type PromotionCampaign,
  type PromotionPopupCollection,
  type PromotionPopupFrequency,
  type PromotionPopupSection
} from './types'

export const PROMOTION_POPUP_GROUP = 'promotions'
// Singleton: one popup slot; campaigns are items inside it.
export const PROMOTION_POPUP_KEY = `${PROMOTION_POPUP_GROUP}.popup`

export const isPromotionPopupKey = (key: string | null | undefined): boolean => key === PROMOTION_POPUP_KEY

export const MAX_VISIBLE_CAMPAIGNS = 5

export const DEFAULT_POPUP_FREQUENCY: PromotionPopupFrequency = 'once-per-session'

export const POLICY_PAGE_PATHS: readonly string[] = ['/delivery', '/ordering', '/privacy', '/returns', '/terms']

export const DEFAULT_POPUP_PAGES: readonly string[] = [
  '*',
  '!/products/*',
  ...POLICY_PAGE_PATHS.map((path) => `!${path}`)
]

// Matches the box `promotion-slide.tsx` reserves (`aspect-4/5`); that renderer uses `object-contain`
// over a blurred copy of itself, so this ratio isn't an enforced crop, just what avoids letterboxing.
export const PROMOTION_POPUP_IMAGE_ASPECT = 4 / 5

// Hosts allowed by the storefront's next/image config.
export const ALLOWED_IMAGE_HOSTS: readonly string[] = [
  'taskcoper.hcm.ss.bfcplatform.vn',
  'pos.nvncdn.com',
  'hoatheomua.net'
]

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const genId = (): string => `pp_${Math.random().toString(36).slice(2, 8)}`

export const defaultPromotionCampaign = (): PromotionCampaign => ({
  id: genId(),
  image: '',
  href: '',
  openInNewTab: false,
  alt: emptyLocalizedText(),
  startDate: '',
  endDate: '',
  enabled: true,
  pages: []
})

export const defaultPromotionPopup = (): PromotionPopupCollection => ({
  section: { enabled: true, frequency: DEFAULT_POPUP_FREQUENCY, pages: [...DEFAULT_POPUP_PAGES] },
  items: []
})

const asString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

// Unrecognised values fall back to the quieter default.
const parseFrequency = (raw: unknown): PromotionPopupFrequency =>
  POPUP_FREQUENCIES.includes(raw as PromotionPopupFrequency)
    ? (raw as PromotionPopupFrequency)
    : DEFAULT_POPUP_FREQUENCY

// `fallback` is `[]` for items, which is the sentinel for "inherit the section".
const parsePages = (raw: unknown, fallback: readonly string[]): string[] => {
  if (!Array.isArray(raw)) return [...fallback]
  const patterns = raw.map(asString).filter(Boolean)
  return patterns.length > 0 ? patterns : [...fallback]
}

// `index` gives a missing id a stable fallback so dismissal memory persists across parses.
const parseCampaign = (raw: unknown, index: number): PromotionCampaign => {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Partial<PromotionCampaign>

  return {
    id: asString(item.id) || `pp_fallback_${index}`,
    image: asString(item.image),
    href: asString(item.href),
    openInNewTab: item.openInNewTab === true,
    alt: parseLocalizedText(item.alt),
    startDate: asString(item.startDate),
    endDate: asString(item.endDate),
    enabled: item.enabled !== false,
    pages: parsePages(item.pages, [])
  }
}

// Degrades to an empty collection instead of throwing; unclear `enabled` defaults to off.
export const parsePromotionPopup = (raw: unknown): PromotionPopupCollection => {
  const parsed = typeof raw === 'string' ? safeJsonParse(raw) : raw
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return defaultPromotionPopup()

  const obj = parsed as { section?: Partial<PromotionPopupSection>; items?: unknown }

  return {
    section: {
      enabled: obj.section?.enabled === true,
      frequency: parseFrequency(obj.section?.frequency),
      pages: parsePages(obj.section?.pages, DEFAULT_POPUP_PAGES)
    },
    items: Array.isArray(obj.items) ? obj.items.map(parseCampaign) : []
  }
}

/**
 * Route scoping against locale-less paths: '/' exact, '/b2b/*' descendants only,
 * '*' everywhere, '!pattern' excludes. Mirrors `features/promotions/match-page.ts`.
 */
const normalizePath = (path: string): string => {
  const trimmed = path.trim()
  if (!trimmed) return ''

  const rooted = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return rooted.replace(/\/+$/, '') || '/'
}

const matchesPattern = (pattern: string, path: string): boolean => {
  if (pattern === '*') return true

  if (pattern.endsWith('/*')) {
    const base = normalizePath(pattern.slice(0, -2))
    // `'/*'` has no base left to compare against, so it can only mean "all".
    if (base === '' || base === '/') return true

    // Strict descendants only; excludes the page itself and siblings like /products-guide.
    return path.startsWith(`${base}/`)
  }

  return normalizePath(pattern) === path
}

// Exclusions are evaluated first and always win over includes.
export const matchesPages = (patterns: readonly string[], path: string): boolean => {
  const target = normalizePath(path) || '/'

  const includes: string[] = []
  const excludes: string[] = []

  for (const raw of patterns) {
    const value = typeof raw === 'string' ? raw.trim() : ''
    if (!value) continue

    if (value.startsWith('!')) {
      const negated = value.slice(1).trim()
      if (negated) excludes.push(negated)
      continue
    }

    includes.push(value)
  }

  if (excludes.some((pattern) => matchesPattern(pattern, target))) return false
  if (includes.length === 0) return true

  return includes.some((pattern) => matchesPattern(pattern, target))
}

// Every storefront header route, in nav order, then the shipped defaults so a
// cleared scope can be rebuilt from chips. Not exhaustive - any valid pattern is accepted.
export const PAGE_PATTERN_PRESETS: readonly string[] = [
  '*',
  '/',
  '/products',
  '/products/*',
  '/b2b',
  '/b2b/*',
  '/about',
  '/news',
  '/news/*',
  '/recruitment',
  '/recruitment/*',
  '/contact',
  '!/products/*',
  ...POLICY_PAGE_PATHS.map((path) => `!${path}`)
]

// Validates patterns at save time so typos can't silently misconfigure scope.
export const isValidPagePattern = (pattern: string): boolean => {
  const value = pattern.trim()
  const body = value.startsWith('!') ? value.slice(1).trim() : value
  if (!body) return false
  if (body === '*') return true
  if (!body.startsWith('/')) return false
  // Query strings and hashes never match, so reject them.
  if (/[\s?#]/.test(body)) return false
  // `*` is meaningful only as the trailing `/*` segment; `/pro*` is not a glob here.
  return !(body.endsWith('/*') ? body.slice(0, -2) : body).includes('*')
}

// Pinned to marketing's timezone so campaigns go live at the same moment worldwide.
export const BUSINESS_TIME_ZONE = 'Asia/Ho_Chi_Minh'

export const businessToday = (): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE }).format(new Date())

// Requires https and an allow-listed host that next/image can actually serve.
export const isRenderableImage = (image: string): boolean => {
  const value = image.trim()
  if (!value.startsWith('https://')) return false

  try {
    return ALLOWED_IMAGE_HOSTS.includes(new URL(value).hostname.toLowerCase())
  } catch {
    return false
  }
}

const isValidDateBound = (value: string): boolean => value === '' || ISO_DATE.test(value)

export type CampaignStatus = 'active' | 'disabled' | 'scheduled' | 'expired' | 'incomplete'

// Ignores route scope on purpose; that's applied separately by `selectActiveCampaigns`.
export const campaignStatus = (campaign: PromotionCampaign, today: string): CampaignStatus => {
  if (!campaign.enabled) return 'disabled'
  if (!campaign.image) return 'incomplete'
  // Only checked once the image is a real remote URL, not a `blob:` preview.
  if (/^https?:/i.test(campaign.image) && !isRenderableImage(campaign.image)) return 'incomplete'
  // A malformed date is surfaced as incomplete rather than guessed at.
  if (!isValidDateBound(campaign.startDate) || !isValidDateBound(campaign.endDate)) return 'incomplete'
  if (campaign.startDate && campaign.startDate > today) return 'scheduled'
  if (campaign.endDate && campaign.endDate < today) return 'expired'
  return 'active'
}

// True if the item would show today on some page, ignoring route scope.
const isLiveToday = (collection: PromotionPopupCollection, campaign: PromotionCampaign, today: string): boolean =>
  collection.section.enabled && campaignStatus(campaign, today) === 'active'

export const countLiveCampaigns = (collection: PromotionPopupCollection, today: string): number =>
  collection.items.filter((item) => isLiveToday(collection, item, today)).length

// Pure function; `path` is the locale-less path (`/b2b`, not `/en/b2b`).
export const selectActiveCampaigns = (
  collection: PromotionPopupCollection,
  today: string,
  path: string,
  maxVisible: number = MAX_VISIBLE_CAMPAIGNS
): PromotionCampaign[] => {
  if (!collection.section.enabled) return []

  return collection.items
    .filter((item) => {
      if (campaignStatus(item, today) !== 'active') return false

      // A non-empty item list replaces the section's; `[]` inherits it.
      const pages = item.pages.length > 0 ? item.pages : collection.section.pages
      return matchesPages(pages, path)
    })
    .slice(0, maxVisible)
}

// Converts stored `YYYY-MM-DD` to the ISO string DatePickerField expects, using local date parts.
export const ymdToPickerValue = (ymd: string): string | null => {
  if (!ISO_DATE.test(ymd)) return null
  const [year, month, day] = ymd.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export const pickerValueToYmd = (iso: string | null | undefined): string => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// Blocks the `javascript:` stored-XSS vector. Enforced again in the storefront on render.
export const isSafeHref = (href: string): boolean => {
  const value = href.trim()
  if (!value) return true

  // Blocks protocol-relative and backslash-variant URLs from hijacking the host.
  if (/^[/\\]{2}/.test(value)) return false
  if (value.startsWith('/')) return true

  try {
    // Also catches data:, vbscript:, and whitespace-injection variants.
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}
