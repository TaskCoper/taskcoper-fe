/** Document `b2bServices.<slug>`: mỗi dịch vụ một trang giới thiệu. */
import type { LocalizedText } from './localized'

export const B2B_SERVICE_SLUGS = [
  'outsourced',
  'events-mice',
  'office-subscription',
  'corporate-gifts',
  'brand-experience'
] as const

export type B2BServiceSlug = (typeof B2B_SERVICE_SLUGS)[number]

export interface RichItem {
  title: LocalizedText
  description: LocalizedText
}

/** Khác `OverviewStatItem`: loại này có caption và không có key. */
export interface ServiceStatItem {
  value: LocalizedText
  label: LocalizedText
  caption: LocalizedText
}

export interface FaqItem {
  question: LocalizedText
  answer: LocalizedText
  hasZalo: boolean
}

export interface ListBlock {
  heading: LocalizedText
  subIntro: LocalizedText
  items: RichItem[]
  closing: LocalizedText
  image?: string
}

export interface BenefitsBlock {
  heading: LocalizedText
  items: RichItem[]
  image?: string
}

export interface StatsBlock {
  heading: LocalizedText
  items: ServiceStatItem[]
  image?: string
}

export interface MiceBlock {
  heading: LocalizedText
  intro: LocalizedText
  body: LocalizedText
  image?: string
}

export interface FaqBlock {
  heading: LocalizedText
  items: FaqItem[]
  image?: string
}

export interface ClosingBlock {
  heading: LocalizedText
  paragraphs: LocalizedText[]
  image?: string
}

export interface PersonalizationBlock extends ListBlock {
  intro: LocalizedText
}

export interface B2BServiceDetail {
  slug: B2BServiceSlug
  enabled: boolean
  showPackagesLink: boolean

  heroImage: string
  ogImage?: string
  introImage?: string

  card: { tag: LocalizedText; name: LocalizedText; description: LocalizedText }
  lede: LocalizedText

  seo: {
    metaTitle: LocalizedText
    metaDescription: LocalizedText
    keywords: LocalizedText // mỗi locale một chuỗi, ngăn bằng dấu phẩy
    ogAlt: LocalizedText
    breadcrumb: LocalizedText
    serviceType: string // serviceType của schema.org - không theo locale
  }

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
