import { ImageWithViewport } from '@/components/image-with-viewport'
import { memo } from 'react'
import { type OverviewTrustBar } from '../../../types'
import { buildMarqueeSet, Marquee, marqueeDuration, pick, type PreviewLocale } from './preview-shared'

export const TrustBarPreview = memo(function TrustBarPreview({
  trustBar,
  locale
}: {
  trustBar: OverviewTrustBar
  locale: PreviewLocale
}) {
  return (
    <section aria-label={pick(trustBar.logos.ariaLabel, locale)} className='relative mt-6 sm:mt-8 md:mt-10 px-4'>
      <div className='mx-auto w-full max-w-7xl'>
        <dl className='grid grid-cols-3 gap-2.5 rounded-3xl bg-card/90 p-4 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:gap-4 sm:p-5'>
          {trustBar.stats.map((stat) => (
            <div key={stat.id} className='space-y-0.5 text-center'>
              <dt className='order-2 text-[0.625rem] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs'>
                {pick(stat.label, locale)}
              </dt>
              <dd className='order-1 font-title text-2xl font-bold leading-none text-primary sm:text-3xl lg:text-4xl'>
                {pick(stat.value, locale)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className='relative mx-auto mt-5 w-full max-w-7xl space-y-3 sm:space-y-4'>
        <p className='text-center text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs'>
          {pick(trustBar.eyebrow, locale)}
        </p>

        {trustBar.logos.groups.map((group) => {
          const items = group.items.filter((item) => item.image)
          if (items.length === 0) return null
          const oneSet = buildMarqueeSet(items)
          const allItems = [...oneSet, ...oneSet]

          return (
            <div key={group.id} className='space-y-1.5'>
              <p className='text-center text-[0.625rem] font-medium uppercase tracking-widest text-primary/70 sm:text-left sm:px-2'>
                {pick(group.label, locale)}
              </p>

              <Marquee durationSeconds={marqueeDuration(oneSet.length)}>
                {allItems.map((item, index) => {
                  const name = pick(item.name, locale)
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className='flex py-3 pl-3 pr-10 items-center justify-center gap-3 rounded-2xl bg-card'
                    >
                      <div className='relative size-10 shrink-0 overflow-hidden rounded-xl bg-primary/5 sm:h-14 sm:w-14'>
                        <ImageWithViewport src={item.image} alt={name} className='size-full' />
                      </div>
                      <span className='whitespace-nowrap font-title text-sm font-semibold text-primary sm:text-base'>
                        {name}
                      </span>
                    </div>
                  )
                })}
              </Marquee>
            </div>
          )
        })}
      </div>
    </section>
  )
})
