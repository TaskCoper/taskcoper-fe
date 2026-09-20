import { ArrowRight } from 'lucide-react'
import { memo } from 'react'
import { type OverviewServices } from '../../../types'
import { pick, SERVICE_META, SparkleDivider, type PreviewLocale, type ServiceCardData } from './preview-shared'

export const ServicesPreview = memo(function ServicesPreview({
  services,
  cards,
  locale
}: {
  services: OverviewServices
  cards: Record<string, ServiceCardData>
  locale: PreviewLocale
}) {
  const explore = pick(services.explore, locale)
  const viewPackages = pick(services.viewPackages, locale)

  const entries = SERVICE_META.map((service) => ({ ...service, card: cards[service.id] })).filter((service) =>
    Boolean(service.card)
  )

  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
      <div className='mx-auto w-full max-w-7xl space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2'>
        <div className='flex items-center justify-start sm:justify-center gap-3'>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
          />
          <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold'>
            {pick(services.title, locale)}
          </h2>
          <SparkleDivider
            className='min-w-0 max-w-96 flex-1 hidden sm:flex'
            iconClassName='sm:size-5 md:size-6 lg:size-7'
            direction='rtl'
          />
        </div>

        <p className='leading-relaxed mx-auto max-w-full sm:max-w-200 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {pick(services.description, locale)}
        </p>
      </div>

      <div className='mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5'>
        {entries.map((service, index) => {
          const isFeatured = index === 0
          const name = pick(service.card.name, locale)
          return (
            <article
              key={service.id}
              className={`group relative flex flex-col gap-3 overflow-hidden rounded-3xl ring-1 sm:col-span-1 ${
                isFeatured
                  ? 'bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground ring-primary/30 shadow-[0_1rem_2.5rem_rgb(81_108_108/28%)] sm:col-span-2 lg:col-span-2'
                  : 'bg-card ring-foreground/5 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)]'
              }`}
            >
              <div className={`relative flex h-full flex-col gap-3 p-5 sm:p-6 ${isFeatured ? 'lg:p-7' : ''}`}>
                {isFeatured && (
                  <>
                    <span
                      aria-hidden='true'
                      className='pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-leaf/25 blur-3xl'
                    />
                    <span
                      aria-hidden='true'
                      className='pointer-events-none absolute -top-32 -left-24 size-80 rounded-full bg-secondary/20 blur-3xl'
                    />
                  </>
                )}

                <span
                  aria-hidden='true'
                  className={`pointer-events-none absolute font-title font-bold leading-none ${
                    isFeatured
                      ? 'right-4 -top-2 text-5xl text-secondary/35 sm:right-5 sm:-top-3 sm:text-6xl lg:text-7xl'
                      : 'right-3 -top-1 text-5xl text-secondary/40 sm:right-4 sm:-top-2 sm:text-6xl'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className='relative flex items-center gap-3'>
                  <div
                    className={`grid shrink-0 place-items-center rounded-2xl shadow-md ${
                      isFeatured
                        ? 'size-12 bg-card text-primary sm:size-14'
                        : service.accent === 'leaf'
                          ? 'size-11 bg-leaf text-leaf-foreground sm:size-12'
                          : 'size-11 bg-primary text-primary-foreground sm:size-12'
                    }`}
                  >
                    <service.icon className={isFeatured ? 'size-6 sm:size-7' : 'size-5 sm:size-6'} />
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-wide ring-1 ${
                      isFeatured
                        ? 'bg-primary-foreground/12 text-primary-foreground ring-primary-foreground/25 backdrop-blur-sm sm:text-xs'
                        : service.accent === 'leaf'
                          ? 'bg-leaf/15 text-leaf ring-leaf/20'
                          : 'bg-secondary/60 text-primary ring-primary/10'
                    }`}
                  >
                    {pick(service.card.tag, locale)}
                  </span>
                </div>

                <div className='relative flex-1 space-y-1.5'>
                  <h3
                    className={`font-title font-bold leading-tight ${
                      isFeatured
                        ? 'text-primary-foreground text-xl sm:text-2xl lg:text-[1.75rem]'
                        : 'text-primary text-lg sm:text-xl'
                    }`}
                  >
                    {name}
                  </h3>
                  <p
                    className={`leading-relaxed ${
                      isFeatured
                        ? 'max-w-2xl text-primary-foreground/85 text-xs sm:text-sm lg:text-base'
                        : 'text-foreground text-xs sm:text-sm'
                    }`}
                  >
                    {pick(service.card.description, locale)}
                  </p>
                </div>

                <div className='relative mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5'>
                  <span
                    className={`inline-flex w-fit cursor-pointer items-center gap-1 font-semibold ${
                      isFeatured ? 'text-primary-foreground text-sm lg:text-base' : 'text-primary text-xs'
                    }`}
                  >
                    {explore}
                    <ArrowRight className={isFeatured ? 'size-4' : 'size-3'} />
                  </span>
                </div>
              </div>

              {service.linkToPackages && (
                <span className='relative mx-5 mb-4 -mt-1 inline-flex w-fit cursor-pointer items-center gap-1 text-xs font-semibold text-leaf sm:mx-6'>
                  {viewPackages}
                  <ArrowRight className='size-3' />
                </span>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
})
