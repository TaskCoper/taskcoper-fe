import { ArrowRight, Mail, PhoneCall, Sparkles } from 'lucide-react'
import { memo } from 'react'
import type { OverviewCta } from '../../../b2b-overview-palette'
import { pick, PreviewButton, type PreviewContact, type PreviewLocale } from './preview-shared'

// Shown when the tenant has no `contact.*` configs to pull real values from.
const PHONE_PLACEHOLDER = '1900 000 000'
const EMAIL_PLACEHOLDER = 'hello@hoatheomua.net'

export const CtaPreview = memo(function CtaPreview({
  cta,
  contact,
  locale
}: {
  cta: OverviewCta
  contact: PreviewContact
  locale: PreviewLocale
}) {
  const phone = contact.phone || PHONE_PLACEHOLDER
  const email = contact.email || EMAIL_PLACEHOLDER

  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4 pb-10 sm:pb-12 lg:pb-14'>
      <div className='relative mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-[0_1.2rem_3rem_rgb(81_108_108/18%)] sm:p-8 lg:p-10'>
        <span
          aria-hidden='true'
          className='pointer-events-none absolute -right-8 -bottom-10 font-title text-[10rem] font-bold leading-none text-primary-foreground/8 sm:text-[14rem]'
        >
          {pick(cta.eyebrow, locale)}
        </span>

        <div className='relative grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10'>
          <div className='space-y-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-widest text-primary-foreground ring-1 ring-primary-foreground/25 sm:text-xs'>
                <Sparkles className='size-3.5' />
                {pick(cta.eyebrow, locale)}
              </span>
            </div>

            {/* Explicit color: the preview frame's heading rule would otherwise paint this primary. */}
            <h2 className='font-title text-2xl font-bold leading-tight text-primary-foreground sm:text-3xl lg:text-4xl'>
              {pick(cta.title, locale)}
            </h2>

            <p className='text-sm leading-relaxed text-primary-foreground/85 sm:text-base'>
              {pick(cta.description, locale)}
            </p>

            <div className='flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-center'>
              <PreviewButton
                variant='secondary'
                className='w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto'
              >
                {pick(cta.primary, locale)}
                <ArrowRight />
              </PreviewButton>

              <PreviewButton
                variant='ghost'
                className='w-full text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto'
              >
                {pick(cta.secondary, locale)}
              </PreviewButton>
            </div>
          </div>

          <div className='flex flex-col gap-2.5'>
            <div className='flex items-center gap-3 rounded-2xl bg-primary-foreground/10 px-4 py-3 ring-1 ring-primary-foreground/20'>
              <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary-foreground text-primary'>
                <PhoneCall className='size-5' />
              </span>
              <span className='min-w-0 -space-y-0.5'>
                <span className='block text-[0.625rem] font-semibold uppercase tracking-widest text-primary-foreground/70'>
                  {pick(cta.callLabel, locale)}
                </span>
                <span className='block truncate font-title text-base font-bold text-primary-foreground sm:text-lg'>
                  {phone}
                </span>
              </span>
            </div>

            <div className='flex items-center gap-3 rounded-2xl bg-primary-foreground/10 px-4 py-3 ring-1 ring-primary-foreground/20'>
              <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-primary-foreground text-primary'>
                <Mail className='size-5' />
              </span>
              <span className='min-w-0 -space-y-0.5'>
                <span className='block text-[0.625rem] font-semibold uppercase tracking-widest text-primary-foreground/70'>
                  {pick(cta.emailLabel, locale)}
                </span>
                <span className='block truncate font-title text-base font-bold text-primary-foreground sm:text-lg'>
                  {email}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})
