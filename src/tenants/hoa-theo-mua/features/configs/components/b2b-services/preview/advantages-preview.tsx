import { Sparkles } from 'lucide-react'
import { memo } from 'react'
import { type OverviewAdvantages } from '../../../types'
import { pick, resolveIcon, type PreviewLocale } from './preview-shared'

export const AdvantagesPreview = memo(function AdvantagesPreview({
  advantages,
  locale
}: {
  advantages: OverviewAdvantages
  locale: PreviewLocale
}) {
  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
      <div className='mx-auto w-full max-w-7xl space-y-1 sm:space-y-1.5 md:space-y-2'>
        <div className='flex justify-center'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-[0.625rem] font-semibold tracking-wide text-primary ring-1 ring-primary/15 sm:text-xs'>
            <Sparkles className='size-3.5' />
            {pick(advantages.eyebrow, locale)}
          </span>
        </div>

        <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold text-primary'>
          {pick(advantages.title, locale)}
        </h2>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {pick(advantages.description, locale)}
        </p>
      </div>

      <div className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'>
        {advantages.items.map((advantage, index) => {
          const Icon = resolveIcon(advantage.icon)
          return (
            <article
              key={advantage.id}
              className='group relative flex flex-col gap-2.5 overflow-hidden rounded-3xl bg-card p-4 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/10%)] ring-1 ring-foreground/5 sm:p-5'
            >
              <span
                aria-hidden='true'
                className='pointer-events-none absolute right-2.5 top-1.5 font-title text-2xl font-bold leading-none text-secondary/45 sm:text-3xl'
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className='grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md sm:size-12'>
                <Icon className='size-5 sm:size-6' />
              </div>

              <div className='space-y-1'>
                <h3 className='font-title text-base font-bold leading-tight text-primary sm:text-lg'>
                  {pick(advantage.title, locale)}
                </h3>
                <p className='text-xs leading-relaxed text-foreground'>{pick(advantage.description, locale)}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
})
