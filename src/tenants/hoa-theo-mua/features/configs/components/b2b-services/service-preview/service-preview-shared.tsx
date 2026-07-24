/* eslint-disable react-refresh/only-export-components */
import { cn } from '@/shared/utils'
import type { ReactNode } from 'react'
import type { LocalizedText } from '../../../palette-shared'
import { pick, type PreviewLocale } from '../preview/preview-shared'

export { pick }
export type { PreviewLocale }

// The 11 content sections rendered in the service detail main column, in page order.
export type SectionKey =
  | 'intro'
  | 'stats'
  | 'inclusions'
  | 'mice'
  | 'schedule'
  | 'personalization'
  | 'benefits'
  | 'process'
  | 'audience'
  | 'faq'
  | 'closing'

// Ordered manifest of the sections the /b2b/[service] page renders in its main column,
// mirroring `getServiceSections` on the public site. `hero` is the fixed masthead above
// the two-column layout; the rest live inside the main reading column.
export const SERVICE_SECTION_KEYS: SectionKey[] = [
  'intro',
  'stats',
  'inclusions',
  'mice',
  'schedule',
  'personalization',
  'benefits',
  'process',
  'audience',
  'faq',
  'closing'
]

// Sections whose heading falls back to a canonical default when the doc leaves it blank
// (ported from `b2b.serviceDetails.common.*`). Blank entries render no heading at all.
export const SECTION_DEFAULT_TITLE: Record<SectionKey, LocalizedText> = {
  intro: { vi: '', en: '' },
  stats: { vi: 'Những con số', en: 'By the numbers' },
  inclusions: { vi: 'Dịch vụ bao gồm', en: "What's included" },
  mice: { vi: '', en: '' },
  schedule: { vi: 'Linh hoạt theo lịch thay hoa', en: 'Flexible flower schedule' },
  personalization: { vi: '', en: '' },
  benefits: { vi: 'Lợi ích khi sử dụng dịch vụ', en: 'Benefits of the service' },
  process: { vi: 'Quy trình triển khai', en: 'Implementation process' },
  audience: { vi: 'Phù hợp với', en: 'Ideal for' },
  faq: { vi: 'Câu hỏi thường gặp', en: 'Frequently asked questions' },
  closing: { vi: '', en: '' }
}

export const SECTION_TOC_LABEL: Record<SectionKey, LocalizedText> = {
  intro: { vi: 'Tổng quan', en: 'Overview' },
  stats: { vi: 'Những con số', en: 'By the numbers' },
  inclusions: { vi: 'Bao gồm', en: "What's included" },
  mice: { vi: 'Hoa sự kiện MICE', en: 'MICE flowers' },
  schedule: { vi: 'Lịch hoa', en: 'Schedule' },
  personalization: { vi: 'Cá nhân hóa', en: 'Personalization' },
  benefits: { vi: 'Lợi ích', en: 'Benefits' },
  process: { vi: 'Quy trình', en: 'Process' },
  audience: { vi: 'Phù hợp với', en: 'Ideal for' },
  faq: { vi: 'Hỏi đáp', en: 'FAQ' },
  closing: { vi: 'Lời kết', en: 'In closing' }
}

// Standalone chrome strings the preview needs outside the section bodies.
export const CHROME_TEXT = {
  home: { vi: 'Trang chủ', en: 'Home' },
  backToOverview: { vi: 'Doanh nghiệp', en: 'For business' },
  primaryCta: { vi: 'Liên hệ tư vấn', en: 'Contact us' },
  secondaryCta: { vi: 'Xem gói dịch vụ', en: 'See service packages' },
  tocTitle: { vi: 'Nội dung trang', en: 'On this page' },
  sidebarRelatedTitle: { vi: 'Dịch vụ liên quan', en: 'Related services' },
  sidebarContactTitle: { vi: 'Liên hệ đội ngũ', en: 'Talk to our team' }
} satisfies Record<string, LocalizedText>

// ---- Editorial primitives (static ports of editorial.tsx, minus motion) -----

/** Petal surface: three soft corners and one pinched (top-left). */
export const petalCard =
  'rounded-[1.5rem] rounded-tl-[0.4375rem] border border-primary/10 bg-card/80 shadow-md shadow-primary/5'
export const petalCardHover =
  'transition-all duration-300 hover:-translate-y-0.5 hover:border-leaf/40 hover:shadow-lg hover:shadow-primary/10'

export function gridCols(count: number, max: 2 | 3): string {
  if (count <= 1) return 'grid-cols-1'
  if (count === 2 || max === 2) return 'sm:grid-cols-2'
  return 'sm:grid-cols-2 lg:grid-cols-3'
}

/** Left-aligned section header: display title over a leaf-marked rule. */
export function SectionHeading({ title, className }: { title: ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-2.5', className)}>
      <h2 className='text-pretty font-title text-[1.625rem] font-bold leading-[1.15] text-primary sm:text-3xl lg:text-[2.25rem]'>
        {title}
      </h2>
      <span aria-hidden='true' className='block h-px w-16 bg-gradient-to-r from-leaf/70 to-transparent' />
    </div>
  )
}

/** Full-width rounded photo band used between text passages. Renders nothing without a src. */
export function ServiceImageDivider({
  src,
  alt,
  className,
  ratio = 'aspect-[16/7]'
}: {
  src: string | null
  alt: string
  className?: string
  ratio?: string
}) {
  if (!src) return null
  return (
    <figure
      className={cn(
        'relative w-full overflow-hidden rounded-[1.75rem] rounded-tl-[0.5625rem] bg-muted shadow-lg shadow-primary/10 ring-1 ring-primary/10',
        ratio,
        className
      )}
    >
      <img src={src} alt={alt} className='absolute inset-0 size-full object-cover' />
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent'
      />
    </figure>
  )
}

/** Editorial image + text split. Text spans full width when there is no image. */
export function ServiceImageSplit({
  src,
  alt,
  reverse = false,
  children,
  className
}: {
  src: string | null
  alt: string
  reverse?: boolean
  children: ReactNode
  className?: string
}) {
  if (!src) return <div className={className}>{children}</div>
  return (
    <div className={cn('grid items-center gap-6 md:grid-cols-2 md:items-stretch md:gap-10', className)}>
      <div className={cn('relative md:h-full', reverse ? 'md:order-2' : 'md:order-1')}>
        <span
          aria-hidden='true'
          className={cn(
            'absolute -bottom-2 top-5 rounded-[1.75rem] bg-secondary/50',
            reverse ? '-left-2 right-5 rounded-tr-[0.625rem]' : '-right-2 left-5 rounded-tl-[0.625rem]'
          )}
        />
        <figure
          className={cn(
            'relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-muted shadow-lg shadow-primary/10 ring-1 ring-primary/10 sm:aspect-[4/3] md:aspect-auto md:h-full md:min-h-[16rem]',
            reverse ? 'rounded-tr-[0.5rem]' : 'rounded-tl-[0.5rem]'
          )}
        >
          <img src={src} alt={alt} className='absolute inset-0 size-full object-cover' />
        </figure>
      </div>
      <div className={cn('min-w-0', reverse ? 'md:order-1' : 'md:order-2')}>{children}</div>
    </div>
  )
}
