import { ImageWithViewport } from '@/components/image-with-viewport'
import { cn } from '@/shared/utils'
import { ArrowRight, ChevronRight, Mail, Phone } from 'lucide-react'
import { type B2BServiceDetail, type LocalizedText } from '../../../types'
import { PreviewButton, type PreviewContact } from '../preview/preview-shared'
import {
  CHROME_TEXT,
  petalCard,
  pick,
  SECTION_TOC_LABEL,
  type PreviewLocale,
  type SectionKey
} from './service-preview-shared'

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v']
const isVideoSrc = (src: string): boolean => {
  const path = src.split('?')[0].toLowerCase()
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext))
}

export interface ServiceSibling {
  slug: string
  name: LocalizedText
}

export function ServiceBreadcrumbPreview({ detail, locale }: { detail: B2BServiceDetail; locale: PreviewLocale }) {
  return (
    <div className='mx-auto w-full max-w-7xl px-4 pt-4 sm:pt-6'>
      <nav className='flex items-center gap-1.5 text-sm text-muted-foreground'>
        <span>{pick(CHROME_TEXT.home, locale)}</span>
        <ChevronRight className='size-3.5' />
        <span>{pick(CHROME_TEXT.backToOverview, locale)}</span>
        <ChevronRight className='size-3.5' />
        <span className='font-medium text-foreground'>{pick(detail.card.name, locale)}</span>
      </nav>
    </div>
  )
}

export function ServiceHeroPreview({ detail, locale }: { detail: B2BServiceDetail; locale: PreviewLocale }) {
  const name = pick(detail.card.name, locale)
  const lede = pick(detail.lede, locale)
  const hasHeroMedia = Boolean(detail.heroImage)

  return (
    <section className={cn('relative mt-6 px-4 sm:mt-8', !hasHeroMedia && 'pb-10 sm:pb-14')}>
      <div className='mx-auto w-full max-w-7xl'>
        <h1 className='mt-5 text-pretty font-title text-4xl font-bold leading-[1.08] tracking-[-0.01em] text-primary sm:text-5xl lg:text-6xl'>
          {name}
        </h1>
        <p className='mt-5 text-base leading-relaxed text-foreground/90 sm:text-lg'>{lede}</p>
        <div className='mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center'>
          <PreviewButton className='w-full sm:w-auto'>
            {pick(CHROME_TEXT.primaryCta, locale)}
            <ArrowRight />
          </PreviewButton>
          {detail.showPackagesLink ? (
            <PreviewButton variant='ghost' className='w-full text-primary sm:w-auto'>
              {pick(CHROME_TEXT.secondaryCta, locale)}
            </PreviewButton>
          ) : null}
        </div>

        {hasHeroMedia ? (
          <div className='relative mt-10'>
            <span
              aria-hidden='true'
              className='absolute -bottom-2.5 -right-2.5 left-6 top-6 rounded-[2.75rem] rounded-tl-[0.875rem] bg-secondary/50 sm:-bottom-3.5 sm:-right-3.5'
            />
            <figure className='relative aspect-[16/10] w-full overflow-hidden rounded-[2.5rem] rounded-tl-[0.75rem] bg-muted shadow-xl shadow-primary/10 ring-1 ring-primary/10 sm:aspect-[16/8] lg:aspect-[16/7]'>
              {isVideoSrc(detail.heroImage) ? (
                <video
                  src={detail.heroImage}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className='absolute inset-0 size-full object-cover'
                />
              ) : (
                <ImageWithViewport
                  src={detail.heroImage}
                  alt={name}
                  className='absolute inset-0 size-full'
                  loading='eager'
                />
              )}
              <span
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/15 to-transparent'
              />
            </figure>
          </div>
        ) : null}
      </div>
    </section>
  )
}

// Static port of the sticky editorial sidebar: TOC + related services + contact card.
export function ServiceSidebarPreview({
  sectionKeys,
  siblings,
  contact,
  locale
}: {
  sectionKeys: SectionKey[]
  siblings: ServiceSibling[]
  contact: PreviewContact
  locale: PreviewLocale
}) {
  return (
    <aside className='hidden lg:block'>
      <div className='flex flex-col gap-5'>
        <div className={cn(petalCard, 'p-5')}>
          <p className='mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-primary/60'>
            {pick(CHROME_TEXT.tocTitle, locale)}
          </p>
          <ul className='space-y-0.5'>
            {sectionKeys.map((key, index) => {
              const isActive = index === 0
              return (
                <li key={key}>
                  <span
                    className={cn(
                      'group flex items-center gap-2.5 rounded-lg py-1.5 pl-3 pr-2 text-sm',
                      isActive ? 'bg-secondary/30 font-semibold text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <span
                      aria-hidden='true'
                      className={cn('h-4 w-0.5 shrink-0 rounded-full', isActive ? 'bg-leaf' : 'bg-transparent')}
                    />
                    {pick(SECTION_TOC_LABEL[key], locale)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        {siblings.length > 0 ? (
          <div className={cn(petalCard, 'p-5')}>
            <p className='relative mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-primary/70'>
              {pick(CHROME_TEXT.sidebarRelatedTitle, locale)}
            </p>
            <ul className='space-y-0.5'>
              {siblings.map((sibling) => (
                <li key={sibling.slug}>
                  <span className='group flex items-center gap-2.5 rounded-lg px-2 py-1.5'>
                    <span className='flex-1 text-sm font-medium leading-tight text-foreground'>
                      {pick(sibling.name, locale)}
                    </span>
                    <ArrowRight className='size-4 shrink-0 text-primary/40' />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className='relative overflow-hidden rounded-[1.5rem] rounded-tl-[0.4375rem] bg-gradient-to-br from-primary via-primary to-primary/85 p-5 text-primary-foreground shadow-lg shadow-primary/20'>
          <p className='relative mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-primary-foreground/70'>
            {pick(CHROME_TEXT.sidebarContactTitle, locale)}
          </p>
          <div className='relative mb-4 space-y-2 text-sm'>
            {contact.phone ? (
              <span className='flex items-center gap-2 text-primary-foreground/90'>
                <Phone className='size-4 shrink-0' />
                {contact.phone}
              </span>
            ) : null}
            {contact.email ? (
              <span className='flex items-center gap-2 break-all text-primary-foreground/90'>
                <Mail className='size-4 shrink-0' />
                {contact.email}
              </span>
            ) : null}
          </div>
          <PreviewButton
            variant='secondary'
            className='w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90'
          >
            {pick(CHROME_TEXT.primaryCta, locale)}
            <ArrowRight />
          </PreviewButton>
        </div>
      </div>
    </aside>
  )
}
