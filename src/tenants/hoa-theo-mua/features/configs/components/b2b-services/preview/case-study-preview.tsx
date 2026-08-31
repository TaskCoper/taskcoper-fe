import { cn } from '@/shared/utils'
import { Quote } from 'lucide-react'
import { memo } from 'react'
import type { CaseStudyItem, OverviewCaseStudies } from '../../../b2b-overview-palette'
import {
  buildMarqueeSet,
  CASE_STUDIES_SUB_ANCHOR_ID,
  Marquee,
  marqueeDuration,
  pick,
  SparkleDivider,
  type PreviewLocale,
  type PreviewSelection
} from './preview-shared'

const partnerInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

function CaseStudyCard({ item, locale }: { item: CaseStudyItem; locale: PreviewLocale }) {
  const hotelName = pick(item.logoAlt, locale)
  const oneSet = buildMarqueeSet(item.photos)
  const marqueeItems = [...oneSet, ...oneSet]

  return (
    <article className='relative w-full overflow-hidden rounded-3xl bg-card p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5 sm:p-6 lg:p-8'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8'>
        <div className='space-y-3 lg:col-span-7'>
          <div className='flex flex-wrap items-center gap-3'>
            <div
              aria-label={hotelName}
              className='flex items-center gap-2 rounded-xl bg-secondary/40 ring-1 ring-primary/10 py-1.5 pl-2 pr-3'
            >
              {item.logo && <img src={item.logo} alt={hotelName} width={35} height={35} className='rounded-md' />}
              <div className='flex flex-col -space-y-0.5'>
                <span className='font-title text-sm font-bold tracking-tight text-primary sm:text-base'>
                  {hotelName}
                </span>
                <span className='text-[0.625rem] font-semibold tracking-wide'>{pick(item.badge, locale)}</span>
              </div>
            </div>
          </div>

          <p className='text-xs leading-relaxed text-foreground sm:text-sm'>{pick(item.summary, locale)}</p>
        </div>

        <figure className='relative flex flex-col gap-3 rounded-2xl bg-secondary/30 p-5 ring-1 ring-primary/10 lg:col-span-5'>
          <Quote className='absolute -top-2 left-4 size-6 text-primary/40 sm:-top-3 sm:size-7' />
          <blockquote className='font-title text-sm italic leading-relaxed text-primary sm:text-base'>
            “{pick(item.quote, locale)}”
          </blockquote>
          <figcaption className='-space-y-0.5'>
            <span className='block font-title text-sm font-bold text-primary sm:text-base'>
              {pick(item.quoteAuthor, locale)}
            </span>
            <span className='block text-[0.6875rem] font-medium tracking-wide text-muted-foreground sm:text-xs'>
              {pick(item.quoteRole, locale)}
            </span>
          </figcaption>
        </figure>
      </div>

      {marqueeItems.length > 0 && (
        <div className='mt-6 -mx-5 sm:-mx-6 lg:-mx-8'>
          <Marquee durationSeconds={marqueeDuration(oneSet.length)}>
            {marqueeItems.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className='relative block h-40 shrink-0 overflow-hidden rounded-2xl ring-1 ring-foreground/5 shadow-[0_0.4rem_1rem_rgb(81_108_108/8%)] sm:h-48 md:h-56 lg:h-64'
              >
                <img
                  src={src}
                  alt={`${hotelName} - ${index + 1}`}
                  loading='lazy'
                  className='h-full w-auto object-cover transition-transform duration-500 hover:scale-105'
                />
              </div>
            ))}
          </Marquee>
        </div>
      )}
    </article>
  )
}

export const CaseStudyPreview = memo(function CaseStudyPreview({
  caseStudies,
  locale,
  selected
}: {
  caseStudies: OverviewCaseStudies
  locale: PreviewLocale
  selected?: PreviewSelection
}) {
  const { items, partners } = caseStudies

  // Only distinguish the two sub-blocks when this section itself is focused, so the
  // per-block dimming doesn't stack with the outer wrapper's dimming of unrelated sections.
  const caseCardsDimmed = selected === 'partners'
  const partnersDimmed = selected === 'caseStudies'

  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
      <div
        id={CASE_STUDIES_SUB_ANCHOR_ID.caseStudies}
        className={cn('transition-opacity duration-300', caseCardsDimmed && 'opacity-40')}
      >
        <div className='mx-auto w-full max-w-7xl space-y-1 sm:space-y-1.5 md:space-y-2'>
          <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold text-primary'>
            {pick(caseStudies.title, locale)}
          </h2>
          <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
            {pick(caseStudies.description, locale)}
          </p>
        </div>

        <div className='mx-auto mt-6 flex w-full max-w-7xl flex-col gap-6'>
          {items.map((item) => (
            <CaseStudyCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      </div>

      <div
        id={CASE_STUDIES_SUB_ANCHOR_ID.partners}
        className={cn('transition-opacity duration-300', partnersDimmed && 'opacity-40')}
      >
        <div className='mx-auto mt-10 w-full max-w-7xl space-y-1 sm:space-y-1.5 md:space-y-2 sm:mt-12'>
          <div className='flex items-center justify-start sm:justify-center gap-3'>
            <SparkleDivider className='min-w-0 max-w-72 flex-1 hidden sm:flex' iconClassName='sm:size-4 md:size-5' />
            <h3 className='shrink-0 text-center font-title text-xl md:text-2xl lg:text-3xl font-bold text-primary'>
              {pick(partners.title, locale)}
            </h3>
            <SparkleDivider
              className='min-w-0 max-w-72 flex-1 hidden sm:flex'
              iconClassName='sm:size-4 md:size-5'
              direction='rtl'
            />
          </div>
          <p className='mx-auto max-w-full text-left sm:max-w-200 sm:text-center text-xs leading-relaxed text-foreground sm:text-sm'>
            {pick(partners.description, locale)}
          </p>
        </div>

        <div className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'>
          {partners.items.map((partner) => {
            const name = pick(partner.name, locale)
            const logoAlt = pick(partner.logoAlt, locale)
            return (
              <article
                key={partner.id}
                className='group relative flex h-full flex-col gap-3 overflow-hidden rounded-3xl bg-card p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'
              >
                <div className='flex items-center gap-3'>
                  {partner.logo ? (
                    <span className='grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/90 ring-1 ring-primary/10'>
                      <img src={partner.logo} alt={logoAlt} width={35} height={35} className='object-contain' />
                    </span>
                  ) : (
                    <span
                      aria-label={logoAlt}
                      className='grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 font-title text-sm font-bold text-primary ring-1 ring-primary/10'
                    >
                      {partnerInitials(name)}
                    </span>
                  )}
                  <div className='min-w-0 -space-y-0.5'>
                    <h4 className='truncate font-title text-base font-bold text-primary sm:text-lg'>{name}</h4>
                    <p className='truncate text-[0.6875rem] font-medium tracking-wide text-muted-foreground sm:text-xs'>
                      {pick(partner.role, locale)}
                    </p>
                  </div>
                </div>

                <p className='text-xs leading-relaxed text-foreground sm:text-sm'>{pick(partner.summary, locale)}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
})
