import { ArrowRight, Leaf, Sparkles } from 'lucide-react'
import { memo } from 'react'
import type { OverviewHero } from '../../../b2b-overview-palette'
import { pick, PreviewButton, type PreviewLocale } from './preview-shared'

export const HeroPreview = memo(function HeroPreview({ hero, locale }: { hero: OverviewHero; locale: PreviewLocale }) {
  const imageAlt = pick(hero.imageAlt, locale)
  const imageSrc = hero.image

  return (
    <section className='relative isolate overflow-hidden px-4 pt-6 pb-10 sm:pt-10 sm:pb-14 lg:min-h-[36rem] lg:pt-24 lg:pb-28'>
      {imageSrc ? (
        <div aria-label={imageAlt} className='absolute inset-0 -z-10 hidden lg:block'>
          <img src={imageSrc} alt={imageAlt} className='size-full object-cover object-center' />
          <span
            aria-hidden='true'
            className='absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/15'
          />
          <span
            aria-hidden='true'
            className='absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-primary/40'
          />
        </div>
      ) : null}

      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80%] bg-[radial-gradient(circle_at_25%_0%,rgb(188_208_199/45%),transparent_55%),radial-gradient(circle_at_85%_15%,rgb(245_220_220/35%),transparent_50%)] lg:hidden'
      />

      <div className='relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14'>
        <div className='space-y-5 lg:col-span-8 lg:max-w-2xl'>
          <div>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3.5 py-1.5 text-[0.625rem] font-semibold tracking-wide text-primary ring-1 ring-primary/15 shadow-[0_0.25rem_0.75rem_rgb(81_108_108/8%)] sm:text-xs lg:bg-white/12 lg:text-white lg:ring-white/30 lg:shadow-none lg:backdrop-blur-sm'>
              <Sparkles className='size-3.5' />
              {pick(hero.eyebrow, locale)}
            </span>
          </div>

          <h1 className='font-title text-[2.25rem] font-bold leading-[1.1] tracking-tight text-primary sm:text-5xl lg:text-[3.5rem] lg:text-white lg:[text-shadow:0_0.15rem_0.6rem_rgb(0_0_0/25%)]'>
            {pick(hero.title, locale)}
          </h1>

          <div className='flex items-center gap-3'>
            <svg
              viewBox='0 0 80 6'
              className='h-1.5 w-16 text-primary/40 sm:w-20 lg:text-white/50'
              fill='none'
              aria-hidden='true'
            >
              <path d='M0 3 Q 20 0, 40 3 T 80 3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
            <Leaf className='size-4 text-leaf/80 lg:text-white/80' />
            <svg
              viewBox='0 0 80 6'
              className='h-1.5 w-16 text-primary/40 sm:w-20 lg:text-white/50'
              fill='none'
              aria-hidden='true'
            >
              <path d='M0 3 Q 20 6, 40 3 T 80 3' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
            </svg>
          </div>

          <p className='max-w-xl text-sm leading-relaxed text-foreground sm:text-base lg:text-white/90'>
            {pick(hero.subtitle, locale)}
          </p>

          <p className='flex max-w-xl items-start gap-2 text-xs leading-relaxed italic text-muted-foreground sm:text-sm lg:text-white/75'>
            <span
              aria-hidden='true'
              className='mt-2 inline-block h-px w-2 shrink-0 bg-leaf/60 sm:mt-2.5 sm:w-3 lg:bg-white/60'
            />
            <span>{pick(hero.audienceLine, locale)}</span>
          </p>

          <div className='flex flex-col gap-2.5 pt-2 sm:flex-row sm:items-center'>
            <PreviewButton className='group w-full shadow-[0_0.5rem_1.5rem_rgb(81_108_108/22%)] sm:w-auto lg:bg-white lg:text-primary lg:hover:bg-white/90 lg:shadow-[0_0.6rem_1.8rem_rgb(0_0_0/25%)]'>
              {pick(hero.primaryCta, locale)}
              <ArrowRight className='transition-transform duration-300 group-hover:translate-x-1' />
            </PreviewButton>
            <PreviewButton
              variant='ghost'
              className='w-full text-primary hover:bg-primary/5 hover:text-primary sm:w-auto lg:text-white lg:hover:bg-white/10 lg:hover:text-white'
            >
              {pick(hero.secondaryCta, locale)}
            </PreviewButton>
          </div>
        </div>

        {imageSrc ? (
          <div className='relative aspect-4/3 w-full overflow-hidden rounded-[2rem] bg-card shadow-[0_1.5rem_3rem_rgb(81_108_108/22%)] ring-1 ring-primary/10 lg:hidden'>
            <img src={imageSrc} alt={imageAlt} className='size-full object-cover' />
            <span
              aria-hidden='true'
              className='absolute inset-0 bg-gradient-to-t from-primary/35 via-primary/0 to-primary/0'
            />
            <span aria-hidden='true' className='absolute inset-3 rounded-[1.5rem] ring-1 ring-card/40' />
          </div>
        ) : null}
      </div>
    </section>
  )
})
