import { emptyLocalizedText, parseLocalizedText, safeJsonParse, type LocalizedText } from './palette-shared'
import { ConfigKind, InputType, type Config } from './types'

export const B2B_SERVICES_GROUP = 'b2bServices'
export const B2B_SERVICES_KEY_PREFIX = `${B2B_SERVICES_GROUP}.`
// The overview page shares the group but has its own shape/editor, see b2b-overview-palette.ts.
export const B2B_OVERVIEW_KEY = `${B2B_SERVICES_GROUP}.overview`

export const B2B_SERVICE_SLUGS = [
  'outsourced',
  'events-mice',
  'office-subscription',
  'corporate-gifts',
  'brand-experience'
] as const
export type B2BServiceSlug = (typeof B2B_SERVICE_SLUGS)[number]

const GROUP_LC = B2B_SERVICES_GROUP.toLowerCase()
const PREFIX_LC = B2B_SERVICES_KEY_PREFIX.toLowerCase()

const groupMatches = (group: string): boolean => group.toLowerCase() === GROUP_LC
const hasServicePrefix = (key: string): boolean => key.toLowerCase().startsWith(PREFIX_LC)

export const matchesB2BServicesConfig = (config: Config): boolean =>
  groupMatches(config.value.group) &&
  config.kind === ConfigKind.content &&
  config.value.inputType === InputType.json &&
  hasServicePrefix(config.key) &&
  config.key.length > B2B_SERVICES_KEY_PREFIX.length

export const b2bServicesKeySuffix = (key: string): string =>
  hasServicePrefix(key) ? key.slice(B2B_SERVICES_KEY_PREFIX.length) : key

const OVERVIEW_KEY_LC = B2B_OVERVIEW_KEY.toLowerCase()
export const isB2BOverviewKey = (key: string): boolean => key.toLowerCase() === OVERVIEW_KEY_LC

const isServiceSlug = (value: unknown): value is B2BServiceSlug =>
  typeof value === 'string' && (B2B_SERVICE_SLUGS as readonly string[]).includes(value)

export interface RichItem {
  title: LocalizedText
  description: LocalizedText
}
export const defaultRichItem = (): RichItem => ({ title: emptyLocalizedText(), description: emptyLocalizedText() })
export const parseRichItem = (raw: Partial<RichItem> | undefined): RichItem => ({
  title: parseLocalizedText(raw?.title),
  description: parseLocalizedText(raw?.description)
})

export interface StatItem {
  value: LocalizedText
  label: LocalizedText
  caption: LocalizedText
}
export const defaultStatItem = (): StatItem => ({
  value: emptyLocalizedText(),
  label: emptyLocalizedText(),
  caption: emptyLocalizedText()
})
const parseStatItem = (raw: Partial<StatItem> | undefined): StatItem => ({
  value: parseLocalizedText(raw?.value),
  label: parseLocalizedText(raw?.label),
  caption: parseLocalizedText(raw?.caption)
})

export interface FaqItem {
  question: LocalizedText
  answer: LocalizedText
  hasZalo: boolean
}
export const defaultFaqItem = (): FaqItem => ({
  question: emptyLocalizedText(),
  answer: emptyLocalizedText(),
  hasZalo: false
})
const parseFaqItem = (raw: Partial<FaqItem> | undefined): FaqItem => ({
  question: parseLocalizedText(raw?.question),
  answer: parseLocalizedText(raw?.answer),
  hasZalo: Boolean(raw?.hasZalo)
})

// A section is "rendered" iff present AND (for list blocks) items.length > 0.
// `image` is an optional per-section visual (rendered as a divider/split image on the FE).
export interface ListBlock {
  heading: LocalizedText
  subIntro: LocalizedText
  items: RichItem[]
  closing: LocalizedText
  image?: string
}
export const defaultListBlock = (): ListBlock => ({
  heading: emptyLocalizedText(),
  subIntro: emptyLocalizedText(),
  items: [],
  closing: emptyLocalizedText(),
  image: ''
})
const parseListBlock = (raw: Partial<ListBlock> | undefined): ListBlock => ({
  heading: parseLocalizedText(raw?.heading),
  subIntro: parseLocalizedText(raw?.subIntro),
  items: Array.isArray(raw?.items) ? raw!.items.map(parseRichItem) : [],
  closing: parseLocalizedText(raw?.closing),
  image: typeof raw?.image === 'string' ? raw.image : ''
})

export interface BenefitsBlock {
  heading: LocalizedText
  items: RichItem[]
  image?: string
}
export const defaultBenefitsBlock = (): BenefitsBlock => ({ heading: emptyLocalizedText(), items: [], image: '' })
const parseBenefitsBlock = (raw: Partial<BenefitsBlock> | undefined): BenefitsBlock => ({
  heading: parseLocalizedText(raw?.heading),
  items: Array.isArray(raw?.items) ? raw!.items.map(parseRichItem) : [],
  image: typeof raw?.image === 'string' ? raw.image : ''
})

export interface StatsBlock {
  heading: LocalizedText
  items: StatItem[]
  image?: string
}
export const defaultStatsBlock = (): StatsBlock => ({ heading: emptyLocalizedText(), items: [], image: '' })
const parseStatsBlock = (raw: Partial<StatsBlock> | undefined): StatsBlock => ({
  heading: parseLocalizedText(raw?.heading),
  items: Array.isArray(raw?.items) ? raw!.items.map(parseStatItem) : [],
  image: typeof raw?.image === 'string' ? raw.image : ''
})

export interface MiceBlock {
  heading: LocalizedText
  intro: LocalizedText
  body: LocalizedText
  image?: string
}
export const defaultMiceBlock = (): MiceBlock => ({
  heading: emptyLocalizedText(),
  intro: emptyLocalizedText(),
  body: emptyLocalizedText(),
  image: ''
})
const parseMiceBlock = (raw: Partial<MiceBlock> | undefined): MiceBlock => ({
  heading: parseLocalizedText(raw?.heading),
  intro: parseLocalizedText(raw?.intro),
  body: parseLocalizedText(raw?.body),
  image: typeof raw?.image === 'string' ? raw.image : ''
})

export interface FaqBlock {
  heading: LocalizedText
  items: FaqItem[]
  image?: string
}
export const defaultFaqBlock = (): FaqBlock => ({ heading: emptyLocalizedText(), items: [], image: '' })
const parseFaqBlock = (raw: Partial<FaqBlock> | undefined): FaqBlock => ({
  heading: parseLocalizedText(raw?.heading),
  items: Array.isArray(raw?.items) ? raw!.items.map(parseFaqItem) : [],
  image: typeof raw?.image === 'string' ? raw.image : ''
})

export interface ClosingBlock {
  heading: LocalizedText
  paragraphs: LocalizedText[]
  image?: string
}
export const defaultClosingBlock = (): ClosingBlock => ({ heading: emptyLocalizedText(), paragraphs: [], image: '' })
const parseClosingBlock = (raw: Partial<ClosingBlock> | undefined): ClosingBlock => ({
  heading: parseLocalizedText(raw?.heading),
  paragraphs: Array.isArray(raw?.paragraphs) ? raw!.paragraphs.map(parseLocalizedText) : [],
  image: typeof raw?.image === 'string' ? raw.image : ''
})

// personalization has an extra `intro` on top of a ListBlock
export interface PersonalizationBlock extends ListBlock {
  intro: LocalizedText
}
export const defaultPersonalizationBlock = (): PersonalizationBlock => ({
  ...defaultListBlock(),
  intro: emptyLocalizedText()
})
const parsePersonalizationBlock = (raw: Partial<PersonalizationBlock> | undefined): PersonalizationBlock => ({
  ...parseListBlock(raw),
  intro: parseLocalizedText(raw?.intro)
})

export interface B2BServiceDetail {
  slug: B2BServiceSlug
  enabled: boolean
  showPackagesLink: boolean

  heroImage: string
  ogImage?: string
  introImage?: string

  // card copy (drives overview grid + detail H1 + related cards)
  card: { tag: LocalizedText; name: LocalizedText; description: LocalizedText }
  lede: LocalizedText

  seo: {
    metaTitle: LocalizedText
    metaDescription: LocalizedText
    keywords: LocalizedText // comma-separated per locale
    ogAlt: LocalizedText
    breadcrumb: LocalizedText
    serviceType: string // schema.org serviceType — locale-neutral
  }

  // sections (optional = not rendered)
  intro: LocalizedText[]
  inclusions?: ListBlock
  stats?: StatsBlock
  mice?: MiceBlock
  schedule?: ListBlock
  personalization?: PersonalizationBlock
  benefits?: BenefitsBlock
  process?: ListBlock
  audience?: ListBlock
  faq?: FaqBlock
  closing: ClosingBlock
}

export const defaultB2BServiceDetail = (slug: B2BServiceSlug): B2BServiceDetail => ({
  slug,
  enabled: true,
  showPackagesLink: false,
  heroImage: '',
  ogImage: '',
  introImage: '',
  card: { tag: emptyLocalizedText(), name: emptyLocalizedText(), description: emptyLocalizedText() },
  lede: emptyLocalizedText(),
  seo: {
    metaTitle: emptyLocalizedText(),
    metaDescription: emptyLocalizedText(),
    keywords: emptyLocalizedText(),
    ogAlt: emptyLocalizedText(),
    breadcrumb: emptyLocalizedText(),
    serviceType: ''
  },
  intro: [],
  closing: defaultClosingBlock()
})

// Returns undefined when the source key is absent, so optional blocks stay unrendered.
const opt = <T>(v: T | undefined, parse: (x: T | undefined) => T): T | undefined =>
  v === undefined || v === null ? undefined : parse(v)

export const parseB2BServiceDetail = (raw: unknown): B2BServiceDetail => {
  const obj = (typeof raw === 'string' ? safeJsonParse(raw) : raw) as Partial<B2BServiceDetail> | null
  const slug = isServiceSlug(obj?.slug) ? obj!.slug : 'outsourced'
  const base = defaultB2BServiceDetail(slug)
  if (!obj || typeof obj !== 'object') return base

  return {
    ...base,
    slug,
    enabled: obj.enabled ?? true,
    showPackagesLink: Boolean(obj.showPackagesLink),
    heroImage: obj.heroImage ?? '',
    ogImage: typeof obj.ogImage === 'string' ? obj.ogImage : '',
    introImage: typeof obj.introImage === 'string' ? obj.introImage : '',
    card: {
      tag: parseLocalizedText(obj.card?.tag),
      name: parseLocalizedText(obj.card?.name),
      description: parseLocalizedText(obj.card?.description)
    },
    lede: parseLocalizedText(obj.lede),
    seo: {
      metaTitle: parseLocalizedText(obj.seo?.metaTitle),
      metaDescription: parseLocalizedText(obj.seo?.metaDescription),
      keywords: parseLocalizedText(obj.seo?.keywords),
      ogAlt: parseLocalizedText(obj.seo?.ogAlt),
      breadcrumb: parseLocalizedText(obj.seo?.breadcrumb),
      serviceType: obj.seo?.serviceType ?? ''
    },
    intro: Array.isArray(obj.intro) ? obj.intro.map(parseLocalizedText) : [],
    inclusions: opt(obj.inclusions, parseListBlock),
    stats: opt(obj.stats, parseStatsBlock),
    mice: opt(obj.mice, parseMiceBlock),
    schedule: opt(obj.schedule, parseListBlock),
    personalization: opt(obj.personalization, parsePersonalizationBlock),
    benefits: opt(obj.benefits, parseBenefitsBlock),
    process: opt(obj.process, parseListBlock),
    audience: opt(obj.audience, parseListBlock),
    faq: opt(obj.faq, parseFaqBlock),
    closing: parseClosingBlock(obj.closing)
  }
}
