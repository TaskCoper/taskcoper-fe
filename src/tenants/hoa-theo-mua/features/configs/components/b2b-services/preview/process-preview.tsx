import { Sparkles } from 'lucide-react'
import { memo } from 'react'
import { type OverviewProcess } from '../../../types'
import { pick, resolveIcon, type PreviewLocale } from './preview-shared'

export const ProcessPreview = memo(function ProcessPreview({
  process,
  locale
}: {
  process: OverviewProcess
  locale: PreviewLocale
}) {
  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
      <div className='mx-auto w-full max-w-7xl space-y-1 sm:space-y-1.5 md:space-y-2'>
        <div className='flex justify-center'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-[0.625rem] font-semibold tracking-wide text-primary ring-1 ring-primary/15 sm:text-xs'>
            <Sparkles className='size-3.5' />
            {pick(process.eyebrow, locale)}
          </span>
        </div>

        <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold text-primary'>
          {pick(process.title, locale)}
        </h2>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {pick(process.description, locale)}
        </p>
      </div>

      <ol className='relative mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'>
        <span
          aria-hidden='true'
          className='pointer-events-none absolute top-7 left-12 right-12 hidden h-px bg-[repeating-linear-gradient(90deg,var(--primary)_0,var(--primary)_8px,transparent_8px,transparent_16px)] opacity-30 lg:block'
        />

        {process.steps.map((step, index) => {
          const Icon = resolveIcon(step.icon)
          return (
            <li
              key={step.id}
              className='group relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-card p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5'
            >
              <div className='relative flex items-center justify-between'>
                <div className='relative z-10 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-background'>
                  <Icon className='size-5' />
                </div>

                <span className='font-title text-3xl font-bold leading-none text-secondary/60 sm:text-4xl'>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className='space-y-1'>
                <p className='text-[0.625rem] font-semibold uppercase tracking-widest text-muted-foreground'>
                  {pick(step.label, locale)}
                </p>
                <h3 className='font-title text-base font-bold leading-tight text-primary sm:text-lg'>
                  {pick(step.title, locale)}
                </h3>
                <p className='text-xs leading-relaxed text-foreground'>{pick(step.description, locale)}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
})
