/** Document `b2bServices.overview`: trang landing B2B duy nhất nằm trên các trang từng dịch vụ. */
import type { LocalizedText } from './localized'

export interface OverviewHero {
  eyebrow: LocalizedText
  title: LocalizedText
  subtitle: LocalizedText
  audienceLine: LocalizedText
  primaryCta: LocalizedText
  secondaryCta: LocalizedText
  imageAlt: LocalizedText
  image: string
}

/** Khác `ServiceStatItem`: loại này có key và không có caption. */
export interface OverviewStatItem {
  id: string
  value: LocalizedText
  label: LocalizedText
}

export interface LogoItem {
  id: string
  name: LocalizedText
  image: string
}

export interface LogoGroup {
  id: string
  label: LocalizedText
  items: LogoItem[]
}

export interface OverviewTrustBar {
  eyebrow: LocalizedText
  stats: OverviewStatItem[]
  logos: { ariaLabel: LocalizedText; groups: LogoGroup[] }
}

/** Card dịch vụ lấy từ document `card` của từng dịch vụ, không lưu ở đây. */
export interface OverviewServices {
  title: LocalizedText
  description: LocalizedText
  explore: LocalizedText
  viewPackages: LocalizedText
}

export interface CaseStudyItem {
  id: string
  logo: string
  logoAlt: LocalizedText
  badge: LocalizedText
  summary: LocalizedText
  quote: LocalizedText
  quoteAuthor: LocalizedText
  quoteRole: LocalizedText
  photos: string[]
}

export interface PartnerItem {
  id: string
  logo: string
  name: LocalizedText
  role: LocalizedText
  summary: LocalizedText
  logoAlt: LocalizedText
}

export interface OverviewCaseStudies {
  title: LocalizedText
  description: LocalizedText
  items: CaseStudyItem[]
  partners: { title: LocalizedText; description: LocalizedText; items: PartnerItem[] }
}

export interface PackageItem {
  id: string
  icon: string // ICON_REGISTRY key (preview-shared.tsx)
  highlighted: boolean
  name: LocalizedText
  target: LocalizedText
  price: LocalizedText
  features: LocalizedText[]
}

export interface OverviewPackages {
  title: LocalizedText
  description: LocalizedText
  popular: LocalizedText
  fromLabel: LocalizedText
  cta: LocalizedText
  quarterlySuffix: LocalizedText
  items: PackageItem[]
}

export interface AdvantageItem {
  id: string
  icon: string // ICON_REGISTRY key (preview-shared.tsx)
  title: LocalizedText
  description: LocalizedText
}

export interface OverviewAdvantages {
  eyebrow: LocalizedText
  title: LocalizedText
  description: LocalizedText
  items: AdvantageItem[]
}

export interface ProcessStep {
  id: string
  icon: string // ICON_REGISTRY key (preview-shared.tsx)
  label: LocalizedText
  title: LocalizedText
  description: LocalizedText
}

export interface OverviewProcess {
  eyebrow: LocalizedText
  title: LocalizedText
  description: LocalizedText
  steps: ProcessStep[]
}

/** Câu trả lời có `hasZalo` nhúng marker `<zalo>…</zalo>` để FE thay bằng link Zalo. */
export interface OverviewFaqItem {
  id: string
  question: LocalizedText
  answer: LocalizedText
  hasZalo: boolean
}

export interface OverviewFaq {
  title: LocalizedText
  description: LocalizedText
  items: OverviewFaqItem[]
}

export interface OverviewCta {
  eyebrow: LocalizedText
  subEyebrow: LocalizedText
  title: LocalizedText
  description: LocalizedText
  callLabel: LocalizedText
  emailLabel: LocalizedText
  primary: LocalizedText
  secondary: LocalizedText
}

export interface B2BOverview {
  hero: OverviewHero
  trustBar: OverviewTrustBar
  services: OverviewServices
  caseStudies: OverviewCaseStudies
  packages: OverviewPackages
  advantages: OverviewAdvantages
  process: OverviewProcess
  faq: OverviewFaq
  cta: OverviewCta
}
