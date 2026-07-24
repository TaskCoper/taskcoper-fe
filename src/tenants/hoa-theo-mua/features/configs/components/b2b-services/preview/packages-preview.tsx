import { CircleCheck } from 'lucide-react'
import { memo } from 'react'
import type { OverviewPackages } from '../../../b2b-overview-palette'
import { pick, PreviewButton, resolveIcon, type PreviewLocale } from './preview-shared'

export const PackagesPreview = memo(function PackagesPreview({
  packages,
  locale
}: {
  packages: OverviewPackages
  locale: PreviewLocale
}) {
  const popular = pick(packages.popular, locale)
  const fromLabel = pick(packages.fromLabel, locale)
  const quarterlySuffix = pick(packages.quarterlySuffix, locale)
  const cta = pick(packages.cta, locale)

  const items = packages.items.map((item) => ({
    item,
    meta: { icon: resolveIcon(item.icon), featured: item.highlighted }
  }))

  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 overflow-hidden bg-secondary/40 py-6 sm:py-8 lg:py-10'>
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-25'
        style={{
          backgroundImage: "url('/images/about/pattern.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className='relative mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2 px-4'>
        <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold text-primary'>
          {pick(packages.title, locale)}
        </h2>
        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {pick(packages.description, locale)}
        </p>
      </div>

      <div className='relative mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-4 px-4 lg:grid-cols-3 lg:gap-5'>
        {items.map(({ item, meta }) => (
          <article
            key={item.id}
            className={`group relative flex flex-col gap-4 overflow-hidden rounded-3xl p-5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/10%)] sm:p-6 ${
              meta.featured
                ? 'bg-primary text-primary-foreground ring-1 ring-primary/20 lg:scale-[1.02]'
                : 'bg-card ring-1 ring-foreground/5'
            }`}
          >
            {meta.featured && (
              <span className='relative inline-flex w-fit items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-widest text-primary-foreground ring-1 ring-primary-foreground/25'>
                {popular}
              </span>
            )}

            <div className='relative flex items-center gap-3'>
              <div
                className={`grid size-12 place-items-center rounded-2xl shadow-sm ${
                  meta.featured
                    ? 'bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20'
                    : 'bg-secondary text-primary ring-1 ring-primary/10'
                }`}
              >
                <meta.icon className='size-6' />
              </div>

              <div className='-space-y-0.5'>
                <p
                  className={`text-[0.625rem] font-semibold uppercase tracking-widest ${
                    meta.featured ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {fromLabel}
                </p>
                <p
                  className={`font-title text-2xl font-bold leading-none ${meta.featured ? 'text-primary-foreground' : 'text-primary'}`}
                >
                  {pick(item.price, locale)}
                  <span
                    className={`ml-1 text-xs font-medium ${meta.featured ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                  >
                    {quarterlySuffix}
                  </span>
                </p>
              </div>
            </div>

            <div className='relative space-y-1.5'>
              <h3
                className={`font-title text-xl font-bold leading-tight ${meta.featured ? 'text-primary-foreground' : 'text-primary'}`}
              >
                {pick(item.name, locale)}
              </h3>
              <p
                className={`text-xs leading-relaxed ${meta.featured ? 'text-primary-foreground/85' : 'text-foreground'}`}
              >
                {pick(item.target, locale)}
              </p>
            </div>

            <ul className='relative flex-1 space-y-2'>
              {item.features.map((feature, index) => (
                <li key={index} className='flex items-start gap-2 text-xs sm:text-sm'>
                  <CircleCheck
                    className={`mt-0.5 size-4 shrink-0 ${meta.featured ? 'text-primary-foreground' : 'text-leaf'}`}
                  />
                  <span
                    className={`leading-relaxed ${meta.featured ? 'text-primary-foreground/90' : 'text-foreground'}`}
                  >
                    {pick(feature, locale)}
                  </span>
                </li>
              ))}
            </ul>

            <PreviewButton
              variant={meta.featured ? 'secondary' : 'default'}
              className={`relative w-full ${meta.featured ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' : ''}`}
            >
              {cta}
            </PreviewButton>
          </article>
        ))}
      </div>
    </section>
  )
})
