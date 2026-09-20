import { B2B_OVERVIEW_KEY } from './b2b-service-detail-palette'
import { emptyLocalizedText, parseLocalizedText, safeJsonParse } from './palette-shared'
import type {
  AdvantageItem,
  B2BOverview,
  CaseStudyItem,
  LocalizedText,
  LogoGroup,
  LogoItem,
  OverviewAdvantages,
  OverviewCaseStudies,
  OverviewCta,
  OverviewFaq,
  OverviewFaqItem,
  OverviewHero,
  OverviewPackages,
  OverviewProcess,
  OverviewServices,
  OverviewStatItem,
  OverviewTrustBar,
  PackageItem,
  PartnerItem,
  ProcessStep
} from './types'

export { B2B_OVERVIEW_KEY }

// Legacy ids, kept only to backfill logos/icons for docs saved before those became per-item fields.
export const OVERVIEW_STAT_IDS = ['clients', 'hotels', 'events'] as const
export const OVERVIEW_LOGO_GROUPS = [
  { id: 'hospitality', itemIds: ['indigo', 'fusion', 'eastin'] },
  { id: 'finance', itemIds: ['shinhan', 'mbbank', 'woori'] },
  { id: 'enterprise', itemIds: ['sevenEleven', 'datxanh', 'gsenc', 'tancang', 'gelex', 'masan'] }
] as const

const LEGACY_LOGO_SRC: Record<string, string> = {
  indigo: '/images/b2b/logos/hospitality/indigo.png',
  fusion: '/images/b2b/logos/hospitality/fusion.png',
  eastin: '/images/b2b/logos/hospitality/eastin.png',
  shinhan: '/images/b2b/logos/finance/shinhan.png',
  mbbank: '/images/b2b/logos/finance/mbbank.png',
  woori: '/images/b2b/logos/finance/woori.png',
  sevenEleven: '/images/b2b/logos/enterprise/seven-eleven.png',
  datxanh: '/images/b2b/logos/enterprise/datxanh.png',
  gsenc: '/images/b2b/logos/enterprise/gsenc.png',
  tancang: '/images/b2b/logos/enterprise/tancang.png',
  gelex: '/images/b2b/logos/enterprise/gelex.png',
  masan: '/images/b2b/logos/enterprise/masan.png'
}
const LEGACY_PARTNER_LOGO: Record<string, string> = {
  fusion: '/images/b2b/logos/hospitality/fusion.png',
  masan: '/images/b2b/logos/enterprise/masan.png',
  tanCang: '/images/b2b/logos/enterprise/tancang.png',
  eastin: '/images/b2b/logos/hospitality/eastin.png'
}
const LEGACY_INDIGO_CASE_LOGO = '/images/b2b/logos/hospitality/indigo.png'
const LEGACY_HERO_IMAGE = '/images/b2b/case-studies/indigo/20.jpg'
const LEGACY_PACKAGE_ICON: Record<string, string> = { nhuY: 'flower', locPhat: 'crown', thinhVuong: 'diamond' }
const LEGACY_PACKAGE_FEATURED_IDS = new Set(['locPhat'])
const LEGACY_ADVANTAGE_ICON: Record<string, string> = {
  onTime: 'calendar',
  singlePoc: 'handHeart',
  brandAligned: 'palette',
  transparent: 'notebookPen'
}
const LEGACY_STEP_ICON: Record<string, string> = {
  listen: 'notebookPen',
  propose: 'palette',
  sample: 'sparkles',
  produce: 'truck'
}
// Must match the `ICON_REGISTRY` default key in preview-shared.tsx.
const DEFAULT_ICON_KEY = 'sparkles'

const OVERVIEW_PARTNER_IDS = ['fusion', 'masan', 'tanCang', 'eastin'] as const
const OVERVIEW_PACKAGE_IDS = ['nhuY', 'locPhat', 'thinhVuong'] as const
const OVERVIEW_ADVANTAGE_IDS = ['onTime', 'singlePoc', 'brandAligned', 'transparent'] as const
const OVERVIEW_PROCESS_IDS = ['listen', 'propose', 'sample', 'produce'] as const
const OVERVIEW_FAQ_IDS = [
  'pricing',
  'quality',
  'moq',
  'contractTerm',
  'customization',
  'coverage',
  'flexibility'
] as const

const newItemId = (): string => crypto.randomUUID()

const defaultHero = (): OverviewHero => ({
  eyebrow: emptyLocalizedText(),
  title: emptyLocalizedText(),
  subtitle: emptyLocalizedText(),
  audienceLine: emptyLocalizedText(),
  primaryCta: emptyLocalizedText(),
  secondaryCta: emptyLocalizedText(),
  imageAlt: emptyLocalizedText(),
  image: LEGACY_HERO_IMAGE
})
const parseHero = (raw: Partial<OverviewHero> | undefined): OverviewHero => ({
  eyebrow: parseLocalizedText(raw?.eyebrow),
  title: parseLocalizedText(raw?.title),
  subtitle: parseLocalizedText(raw?.subtitle),
  audienceLine: parseLocalizedText(raw?.audienceLine),
  primaryCta: parseLocalizedText(raw?.primaryCta),
  secondaryCta: parseLocalizedText(raw?.secondaryCta),
  imageAlt: parseLocalizedText(raw?.imageAlt),
  image: typeof raw?.image === 'string' ? raw.image : LEGACY_HERO_IMAGE
})

export const defaultLogoItem = (): LogoItem => ({ id: newItemId(), name: emptyLocalizedText(), image: '' })
const defaultTrustBar = (): OverviewTrustBar => ({
  eyebrow: emptyLocalizedText(),
  stats: OVERVIEW_STAT_IDS.map((id) => ({ id, value: emptyLocalizedText(), label: emptyLocalizedText() })),
  logos: {
    ariaLabel: emptyLocalizedText(),
    groups: OVERVIEW_LOGO_GROUPS.map((g) => ({
      id: g.id,
      label: emptyLocalizedText(),
      items: g.itemIds.map((id) => ({ id, name: emptyLocalizedText(), image: LEGACY_LOGO_SRC[id] ?? '' }))
    }))
  }
})
const parseStat = (raw: Partial<OverviewStatItem> | undefined): OverviewStatItem => ({
  id: String(raw?.id ?? ''),
  value: parseLocalizedText(raw?.value),
  label: parseLocalizedText(raw?.label)
})
const parseLogoItem = (raw: Partial<LogoItem> | undefined): LogoItem => {
  const id = String(raw?.id ?? '') || newItemId()
  return {
    id,
    name: parseLocalizedText(raw?.name),
    image: typeof raw?.image === 'string' ? raw.image : (LEGACY_LOGO_SRC[id] ?? '')
  }
}
const parseLogoGroup = (raw: Partial<LogoGroup> | undefined): LogoGroup => ({
  id: String(raw?.id ?? ''),
  label: parseLocalizedText(raw?.label),
  items: Array.isArray(raw?.items) ? raw!.items.map(parseLogoItem) : []
})
const parseTrustBar = (raw: Partial<OverviewTrustBar> | undefined): OverviewTrustBar => {
  const base = defaultTrustBar()
  if (!raw) return base
  return {
    eyebrow: parseLocalizedText(raw.eyebrow),
    stats: Array.isArray(raw.stats) && raw.stats.length ? raw.stats.map(parseStat) : base.stats,
    logos: {
      ariaLabel: parseLocalizedText(raw.logos?.ariaLabel),
      groups:
        Array.isArray(raw.logos?.groups) && raw.logos!.groups.length
          ? raw.logos!.groups.map(parseLogoGroup)
          : base.logos.groups
    }
  }
}

const defaultServices = (): OverviewServices => ({
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  explore: emptyLocalizedText(),
  viewPackages: emptyLocalizedText()
})
const parseServices = (raw: Partial<OverviewServices> | undefined): OverviewServices => ({
  title: parseLocalizedText(raw?.title),
  description: parseLocalizedText(raw?.description),
  explore: parseLocalizedText(raw?.explore),
  viewPackages: parseLocalizedText(raw?.viewPackages)
})

export const defaultCaseStudyItem = (): CaseStudyItem => ({
  id: newItemId(),
  logo: '',
  logoAlt: emptyLocalizedText(),
  badge: emptyLocalizedText(),
  summary: emptyLocalizedText(),
  quote: emptyLocalizedText(),
  quoteAuthor: emptyLocalizedText(),
  quoteRole: emptyLocalizedText(),
  photos: []
})
export const defaultPartnerItem = (): PartnerItem => ({
  id: newItemId(),
  logo: '',
  name: emptyLocalizedText(),
  role: emptyLocalizedText(),
  summary: emptyLocalizedText(),
  logoAlt: emptyLocalizedText()
})
const defaultCaseStudies = (): OverviewCaseStudies => ({
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  items: [{ ...defaultCaseStudyItem(), id: 'indigo', logo: LEGACY_INDIGO_CASE_LOGO }],
  partners: {
    title: emptyLocalizedText(),
    description: emptyLocalizedText(),
    items: OVERVIEW_PARTNER_IDS.map((id) => ({
      id,
      logo: LEGACY_PARTNER_LOGO[id] ?? '',
      name: emptyLocalizedText(),
      role: emptyLocalizedText(),
      summary: emptyLocalizedText(),
      logoAlt: emptyLocalizedText()
    }))
  }
})
const parsePartner = (raw: Partial<PartnerItem> | undefined): PartnerItem => {
  const id = String(raw?.id ?? '') || newItemId()
  return {
    id,
    logo: typeof raw?.logo === 'string' ? raw.logo : (LEGACY_PARTNER_LOGO[id] ?? ''),
    name: parseLocalizedText(raw?.name),
    role: parseLocalizedText(raw?.role),
    summary: parseLocalizedText(raw?.summary),
    logoAlt: parseLocalizedText(raw?.logoAlt)
  }
}
const parseCaseStudyItem = (raw: Partial<CaseStudyItem> | undefined): CaseStudyItem => {
  const id = String(raw?.id ?? '') || newItemId()
  return {
    id,
    logo: typeof raw?.logo === 'string' ? raw.logo : id === 'indigo' ? LEGACY_INDIGO_CASE_LOGO : '',
    logoAlt: parseLocalizedText(raw?.logoAlt),
    badge: parseLocalizedText(raw?.badge),
    summary: parseLocalizedText(raw?.summary),
    quote: parseLocalizedText(raw?.quote),
    quoteAuthor: parseLocalizedText(raw?.quoteAuthor),
    quoteRole: parseLocalizedText(raw?.quoteRole),
    photos: Array.isArray(raw?.photos) ? raw!.photos.map(String).filter(Boolean) : []
  }
}
const parseCaseStudies = (
  raw: (Partial<OverviewCaseStudies> & { indigo?: unknown }) | undefined
): OverviewCaseStudies => {
  const base = defaultCaseStudies()
  if (!raw) return base
  // Legacy docs stored a single `indigo` object instead of an `items` array.
  const rawItems = Array.isArray(raw.items)
    ? raw.items
    : raw.indigo && typeof raw.indigo === 'object'
      ? [{ id: 'indigo', ...(raw.indigo as object) }]
      : null
  return {
    title: parseLocalizedText(raw.title),
    description: parseLocalizedText(raw.description),
    items: rawItems && rawItems.length ? rawItems.map(parseCaseStudyItem) : base.items,
    partners: {
      title: parseLocalizedText(raw.partners?.title),
      description: parseLocalizedText(raw.partners?.description),
      items:
        Array.isArray(raw.partners?.items) && raw.partners!.items.length
          ? raw.partners!.items.map(parsePartner)
          : base.partners.items
    }
  }
}

// Legacy key order for the old fixed pots/area/potSize/locations/care struct, migrated
// into the free `features: LocalizedText[]` list below.
const LEGACY_PACKAGE_FEATURE_KEYS = ['pots', 'area', 'potSize', 'locations', 'care'] as const

export const defaultPackageItem = (): PackageItem => ({
  id: newItemId(),
  icon: DEFAULT_ICON_KEY,
  highlighted: false,
  name: emptyLocalizedText(),
  target: emptyLocalizedText(),
  price: emptyLocalizedText(),
  features: []
})
const defaultPackages = (): OverviewPackages => ({
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  popular: emptyLocalizedText(),
  fromLabel: emptyLocalizedText(),
  cta: emptyLocalizedText(),
  quarterlySuffix: emptyLocalizedText(),
  items: OVERVIEW_PACKAGE_IDS.map((id) => ({
    id,
    icon: LEGACY_PACKAGE_ICON[id] ?? DEFAULT_ICON_KEY,
    highlighted: LEGACY_PACKAGE_FEATURED_IDS.has(id),
    name: emptyLocalizedText(),
    target: emptyLocalizedText(),
    price: emptyLocalizedText(),
    features: []
  }))
})
const parsePackage = (raw: Partial<PackageItem> | undefined): PackageItem => {
  const id = String(raw?.id ?? '') || newItemId()
  // Legacy docs stored a fixed { pots, area, potSize, locations, care } struct; fold its
  // non-empty values into the free list, in the old order.
  const legacyFeatures = raw?.features as
    | Partial<Record<(typeof LEGACY_PACKAGE_FEATURE_KEYS)[number], LocalizedText>>
    | undefined
  const features = Array.isArray(raw?.features)
    ? raw.features.map(parseLocalizedText)
    : legacyFeatures && typeof legacyFeatures === 'object'
      ? LEGACY_PACKAGE_FEATURE_KEYS.map((key) => parseLocalizedText(legacyFeatures[key])).filter(
          (text) => text.vi.trim() || text.en.trim()
        )
      : []
  return {
    id,
    icon: (typeof raw?.icon === 'string' && raw.icon) || LEGACY_PACKAGE_ICON[id] || DEFAULT_ICON_KEY,
    highlighted: typeof raw?.highlighted === 'boolean' ? raw.highlighted : LEGACY_PACKAGE_FEATURED_IDS.has(id),
    name: parseLocalizedText(raw?.name),
    target: parseLocalizedText(raw?.target),
    price: parseLocalizedText(raw?.price),
    features
  }
}
const parsePackages = (raw: Partial<OverviewPackages> | undefined): OverviewPackages => {
  const base = defaultPackages()
  if (!raw) return base
  return {
    title: parseLocalizedText(raw.title),
    description: parseLocalizedText(raw.description),
    popular: parseLocalizedText(raw.popular),
    fromLabel: parseLocalizedText(raw.fromLabel),
    cta: parseLocalizedText(raw.cta),
    quarterlySuffix: parseLocalizedText(raw.quarterlySuffix),
    items: Array.isArray(raw.items) && raw.items.length ? raw.items.map(parsePackage) : base.items
  }
}

export const defaultAdvantageItem = (): AdvantageItem => ({
  id: newItemId(),
  icon: DEFAULT_ICON_KEY,
  title: emptyLocalizedText(),
  description: emptyLocalizedText()
})
const defaultAdvantages = (): OverviewAdvantages => ({
  eyebrow: emptyLocalizedText(),
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  items: OVERVIEW_ADVANTAGE_IDS.map((id) => ({
    id,
    icon: LEGACY_ADVANTAGE_ICON[id] ?? DEFAULT_ICON_KEY,
    title: emptyLocalizedText(),
    description: emptyLocalizedText()
  }))
})
const parseAdvantageItem = (raw: Partial<AdvantageItem> | undefined): AdvantageItem => {
  const id = String(raw?.id ?? '') || newItemId()
  return {
    id,
    icon: (typeof raw?.icon === 'string' && raw.icon) || LEGACY_ADVANTAGE_ICON[id] || DEFAULT_ICON_KEY,
    title: parseLocalizedText(raw?.title),
    description: parseLocalizedText(raw?.description)
  }
}
const parseAdvantages = (raw: Partial<OverviewAdvantages> | undefined): OverviewAdvantages => {
  const base = defaultAdvantages()
  if (!raw) return base
  return {
    eyebrow: parseLocalizedText(raw.eyebrow),
    title: parseLocalizedText(raw.title),
    description: parseLocalizedText(raw.description),
    items: Array.isArray(raw.items) && raw.items.length ? raw.items.map(parseAdvantageItem) : base.items
  }
}

export const defaultProcessStep = (): ProcessStep => ({
  id: newItemId(),
  icon: DEFAULT_ICON_KEY,
  label: emptyLocalizedText(),
  title: emptyLocalizedText(),
  description: emptyLocalizedText()
})
const defaultProcess = (): OverviewProcess => ({
  eyebrow: emptyLocalizedText(),
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  steps: OVERVIEW_PROCESS_IDS.map((id) => ({
    id,
    icon: LEGACY_STEP_ICON[id] ?? DEFAULT_ICON_KEY,
    label: emptyLocalizedText(),
    title: emptyLocalizedText(),
    description: emptyLocalizedText()
  }))
})
const parseProcessStep = (raw: Partial<ProcessStep> | undefined): ProcessStep => {
  const id = String(raw?.id ?? '') || newItemId()
  return {
    id,
    icon: (typeof raw?.icon === 'string' && raw.icon) || LEGACY_STEP_ICON[id] || DEFAULT_ICON_KEY,
    label: parseLocalizedText(raw?.label),
    title: parseLocalizedText(raw?.title),
    description: parseLocalizedText(raw?.description)
  }
}
const parseProcess = (raw: Partial<OverviewProcess> | undefined): OverviewProcess => {
  const base = defaultProcess()
  if (!raw) return base
  return {
    eyebrow: parseLocalizedText(raw.eyebrow),
    title: parseLocalizedText(raw.title),
    description: parseLocalizedText(raw.description),
    steps: Array.isArray(raw.steps) && raw.steps.length ? raw.steps.map(parseProcessStep) : base.steps
  }
}

export const defaultOverviewFaqItem = (): OverviewFaqItem => ({
  id: newItemId(),
  question: emptyLocalizedText(),
  answer: emptyLocalizedText(),
  hasZalo: false
})
const defaultFaq = (): OverviewFaq => ({
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  items: OVERVIEW_FAQ_IDS.map((id) => ({
    id,
    question: emptyLocalizedText(),
    answer: emptyLocalizedText(),
    hasZalo: false
  }))
})
const parseFaqItem = (raw: Partial<OverviewFaqItem> | undefined): OverviewFaqItem => ({
  id: String(raw?.id ?? '') || newItemId(),
  question: parseLocalizedText(raw?.question),
  answer: parseLocalizedText(raw?.answer),
  hasZalo: Boolean(raw?.hasZalo)
})
const parseFaq = (raw: Partial<OverviewFaq> | undefined): OverviewFaq => {
  const base = defaultFaq()
  if (!raw) return base
  return {
    title: parseLocalizedText(raw.title),
    description: parseLocalizedText(raw.description),
    items: Array.isArray(raw.items) && raw.items.length ? raw.items.map(parseFaqItem) : base.items
  }
}

const defaultCta = (): OverviewCta => ({
  eyebrow: emptyLocalizedText(),
  subEyebrow: emptyLocalizedText(),
  title: emptyLocalizedText(),
  description: emptyLocalizedText(),
  callLabel: emptyLocalizedText(),
  emailLabel: emptyLocalizedText(),
  primary: emptyLocalizedText(),
  secondary: emptyLocalizedText()
})
const parseCta = (raw: Partial<OverviewCta> | undefined): OverviewCta => ({
  eyebrow: parseLocalizedText(raw?.eyebrow),
  subEyebrow: parseLocalizedText(raw?.subEyebrow),
  title: parseLocalizedText(raw?.title),
  description: parseLocalizedText(raw?.description),
  callLabel: parseLocalizedText(raw?.callLabel),
  emailLabel: parseLocalizedText(raw?.emailLabel),
  primary: parseLocalizedText(raw?.primary),
  secondary: parseLocalizedText(raw?.secondary)
})

export const defaultB2BOverview = (): B2BOverview => ({
  hero: defaultHero(),
  trustBar: defaultTrustBar(),
  services: defaultServices(),
  caseStudies: defaultCaseStudies(),
  packages: defaultPackages(),
  advantages: defaultAdvantages(),
  process: defaultProcess(),
  faq: defaultFaq(),
  cta: defaultCta()
})

export const parseB2BOverview = (raw: unknown): B2BOverview => {
  const obj = (typeof raw === 'string' ? safeJsonParse(raw) : raw) as Partial<B2BOverview> | null
  if (!obj || typeof obj !== 'object') return defaultB2BOverview()
  return {
    hero: parseHero(obj.hero),
    trustBar: parseTrustBar(obj.trustBar),
    services: parseServices(obj.services),
    caseStudies: parseCaseStudies(obj.caseStudies),
    packages: parsePackages(obj.packages),
    advantages: parseAdvantages(obj.advantages),
    process: parseProcess(obj.process),
    faq: parseFaq(obj.faq),
    cta: parseCta(obj.cta)
  }
}
