import type { ReactNode } from 'react'
import { type B2BOverview } from '../../../types'
import { AdvantagesPreview } from './advantages-preview'
import { CaseStudyPreview } from './case-study-preview'
import { CtaPreview } from './cta-preview'
import { FaqPreview } from './faq-preview'
import { HeroPreview } from './hero-preview'
import { PackagesPreview } from './packages-preview'
import type { PreviewContact, PreviewLocale, PreviewSelection, ServiceCardData } from './preview-shared'
import { ProcessPreview } from './process-preview'
import { ServicesPreview } from './services-preview'
import { TrustBarPreview } from './trust-bar-preview'

// Public page section order.
export const B2B_SECTION_KEYS: Array<keyof B2BOverview> = [
  'hero',
  'trustBar',
  'services',
  'caseStudies',
  'packages',
  'advantages',
  'process',
  'faq',
  'cta'
]

export interface B2BSectionData {
  overview: B2BOverview
  cards: Record<string, ServiceCardData>
  contact: PreviewContact
  locale: PreviewLocale
  // Only read by CaseStudyPreview, to dim its case-study-cards vs partners sub-block.
  selected?: PreviewSelection
}

export function renderB2BSection(
  key: keyof B2BOverview,
  { overview, cards, contact, locale, selected }: B2BSectionData
): ReactNode {
  switch (key) {
    case 'hero':
      return <HeroPreview hero={overview.hero} locale={locale} />
    case 'trustBar':
      return <TrustBarPreview trustBar={overview.trustBar} locale={locale} />
    case 'services':
      return <ServicesPreview services={overview.services} cards={cards} locale={locale} />
    case 'caseStudies':
      return <CaseStudyPreview caseStudies={overview.caseStudies} locale={locale} selected={selected} />
    case 'packages':
      return <PackagesPreview packages={overview.packages} locale={locale} />
    case 'advantages':
      return <AdvantagesPreview advantages={overview.advantages} locale={locale} />
    case 'process':
      return <ProcessPreview process={overview.process} locale={locale} />
    case 'faq':
      return <FaqPreview faq={overview.faq} contact={contact} locale={locale} />
    case 'cta':
      return <CtaPreview cta={overview.cta} contact={contact} locale={locale} />
  }
}
