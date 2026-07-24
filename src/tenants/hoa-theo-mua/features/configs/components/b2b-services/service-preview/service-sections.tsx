/* eslint-disable react-refresh/only-export-components */
import { cn } from '@/shared/utils'
import { Building2, Calendar, CheckCircle2, Quote } from 'lucide-react'
import type { ReactNode } from 'react'
import type { B2BServiceDetail } from '../../../b2b-service-detail-palette'
import {
  gridCols,
  petalCard,
  petalCardHover,
  pick,
  SECTION_DEFAULT_TITLE,
  SectionHeading,
  ServiceImageDivider,
  ServiceImageSplit,
  type PreviewLocale,
  type SectionKey
} from './service-preview-shared'

// Presence rules mirror `getServiceSections` on the public site: a section renders iff its
// block exists AND carries content. Drives both the rendered set and the TOC.
const listHas = (block?: { items: unknown[] }): boolean => (block?.items.length ?? 0) > 0
const hasText = (text?: { vi: string; en: string }): boolean => Boolean(text && (text.vi || text.en))

export function getServiceSectionKeys(detail: B2BServiceDetail): SectionKey[] {
  const order: { key: SectionKey; enabled: boolean }[] = [
    { key: 'intro', enabled: detail.intro.length > 0 },
    { key: 'stats', enabled: listHas(detail.stats) },
    { key: 'inclusions', enabled: listHas(detail.inclusions) },
    { key: 'mice', enabled: Boolean(detail.mice && (hasText(detail.mice.intro) || hasText(detail.mice.body))) },
    { key: 'schedule', enabled: listHas(detail.schedule) },
    { key: 'personalization', enabled: listHas(detail.personalization) },
    { key: 'benefits', enabled: listHas(detail.benefits) },
    { key: 'process', enabled: listHas(detail.process) },
    { key: 'audience', enabled: listHas(detail.audience) },
    { key: 'faq', enabled: listHas(detail.faq) },
    { key: 'closing', enabled: detail.closing.paragraphs.length > 0 }
  ]
  return order.filter((s) => s.enabled).map((s) => s.key)
}

const headingFor = (key: SectionKey, raw: { vi: string; en: string } | undefined, locale: PreviewLocale): string =>
  pick(raw, locale) || pick(SECTION_DEFAULT_TITLE[key], locale)

type SectionProps = { detail: B2BServiceDetail; locale: PreviewLocale }

function IntroSection({ detail, locale }: SectionProps) {
  const intro = detail.intro.map((p) => pick(p, locale)).filter(Boolean)
  if (intro.length === 0) return null
  const [lead, ...rest] = intro
  const serviceName = pick(detail.card.name, locale)
  return (
    <div className='space-y-6'>
      <p className='text-justify font-title text-xl leading-normal text-primary sm:text-[1.375rem] sm:leading-normal'>
        {lead}
      </p>
      {rest.length > 0 ? (
        <div className='space-y-4'>
          {rest.map((p, i) => (
            <p key={i} className='text-justify text-base leading-relaxed text-foreground/90'>
              {p}
            </p>
          ))}
        </div>
      ) : null}
      {detail.introImage ? (
        <div className='mt-8'>
          <ServiceImageDivider src={detail.introImage} alt={serviceName} />
        </div>
      ) : null}
    </div>
  )
}

function StatsSection({ detail, locale }: SectionProps) {
  const block = detail.stats
  const items = (block?.items ?? []).map((item) => ({
    value: pick(item.value, locale),
    label: pick(item.label, locale),
    caption: pick(item.caption, locale)
  }))
  if (items.length === 0) return null
  const heading = headingFor('stats', block!.heading, locale)
  const serviceName = pick(detail.card.name, locale)
  return (
    <div>
      <div className='relative overflow-hidden rounded-[1.75rem] rounded-tl-[0.5625rem] bg-gradient-to-br from-primary via-primary to-primary/85 p-6 text-primary-foreground shadow-xl shadow-primary/20 sm:p-8 lg:p-10'>
        <h2 className='relative font-title text-primary-foreground text-xl font-bold leading-tight sm:text-2xl'>
          {heading}
        </h2>
        <dl
          className={cn(
            'relative mt-6 grid gap-6 sm:mt-8',
            items.length >= 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'
          )}
        >
          {items.map((item, i) => (
            <div key={i} className='border-t-2 border-secondary/40 pt-4'>
              <dd className='font-title text-3xl font-bold leading-none tracking-tight sm:text-4xl lg:text-[2.75rem]'>
                {item.value}
              </dd>
              <dt className='mt-2 text-sm leading-snug text-primary-foreground/80'>{item.label}</dt>
              {item.caption ? <p className='mt-1 text-xs text-primary-foreground/60'>{item.caption}</p> : null}
            </div>
          ))}
        </dl>
      </div>
      {block?.image ? (
        <div className='mt-10'>
          <ServiceImageDivider src={block.image} alt={serviceName} ratio='aspect-[16/6]' />
        </div>
      ) : null}
    </div>
  )
}

function InclusionsSection({ detail, locale }: SectionProps) {
  const block = detail.inclusions
  const items = block?.items ?? []
  if (items.length === 0) return null
  const heading = headingFor('inclusions', block!.heading, locale)
  const subIntro = pick(block!.subIntro, locale)
  const closing = pick(block!.closing, locale)
  const serviceName = pick(detail.card.name, locale)

  const checklist = (
    <ul className='space-y-3'>
      {items.map((item, i) => {
        const title = pick(item.title, locale)
        const description = pick(item.description, locale)
        const lead = description ? title : null
        const body = description || title
        return (
          <li key={i} className='flex items-start gap-3'>
            <span className='mt-0.5 grid size-6 shrink-0 place-items-center rounded-full rounded-tl-[0.1875rem] bg-leaf/15 text-leaf'>
              <CheckCircle2 className='size-4' />
            </span>
            <div className='min-w-0'>
              {lead ? (
                <p className='font-title text-sm font-bold leading-tight text-primary sm:text-base'>{lead}</p>
              ) : null}
              <span className='text-sm leading-relaxed text-foreground'>{body}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className='space-y-6'>
      <SectionHeading title={heading} />
      {subIntro ? <p className='text-base leading-relaxed text-foreground'>{subIntro}</p> : null}
      <ServiceImageSplit src={block?.image || null} alt={serviceName} reverse>
        {checklist}
      </ServiceImageSplit>
      {closing ? (
        <p className='border-l-2 border-leaf/50 pl-4 font-title text-[0.9375rem] italic leading-relaxed text-primary/80'>
          {closing}
        </p>
      ) : null}
    </div>
  )
}

function MiceSection({ detail, locale }: SectionProps) {
  const block = detail.mice
  const intro = pick(block?.intro, locale)
  const body = pick(block?.body, locale)
  if (!intro && !body) return null
  const heading = pick(block?.heading, locale)
  const serviceName = pick(detail.card.name, locale)
  return (
    <div className='space-y-6'>
      {heading ? <SectionHeading title={heading} /> : null}
      <ServiceImageSplit src={block?.image || null} alt={serviceName}>
        <div className='space-y-4'>
          {intro ? <p className='text-base leading-relaxed text-foreground'>{intro}</p> : null}
          {body ? (
            <blockquote className='rounded-r-2xl border-l-4 border-leaf bg-leaf/10 py-4 pl-5 pr-5 font-title text-lg italic leading-relaxed text-primary sm:text-xl'>
              {body}
            </blockquote>
          ) : null}
        </div>
      </ServiceImageSplit>
    </div>
  )
}

function ScheduleSection({ detail, locale }: SectionProps) {
  const block = detail.schedule
  const items = (block?.items ?? [])
    .map((item) => pick(item.title, locale) || pick(item.description, locale))
    .filter(Boolean)
  if (items.length === 0) return null
  const heading = headingFor('schedule', block!.heading, locale)
  const subIntro = pick(block!.subIntro, locale)
  const closing = pick(block!.closing, locale)
  const serviceName = pick(detail.card.name, locale)
  return (
    <div className='space-y-6'>
      <SectionHeading title={heading} />
      {subIntro ? <p className='text-base leading-relaxed text-foreground'>{subIntro}</p> : null}
      <ServiceImageSplit src={block?.image || null} alt={serviceName}>
        <ul className='grid gap-3 sm:grid-cols-2'>
          {items.map((item, i) => (
            <li key={i} className={cn(petalCard, petalCardHover, 'flex items-start gap-3 p-4')}>
              <span className='grid size-9 shrink-0 place-items-center rounded-xl rounded-tl-[0.3125rem] bg-secondary/50 text-primary'>
                <Calendar className='size-4.5' />
              </span>
              <span className='pt-1 text-sm leading-relaxed text-foreground'>{item}</span>
            </li>
          ))}
        </ul>
      </ServiceImageSplit>
      {closing ? (
        <p className='border-l-2 border-leaf/50 pl-4 font-title text-[0.9375rem] italic leading-relaxed text-primary/80'>
          {closing}
        </p>
      ) : null}
    </div>
  )
}

function PersonalizationSection({ detail, locale }: SectionProps) {
  const block = detail.personalization
  const items = (block?.items ?? []).map((item) => ({
    title: pick(item.title, locale),
    description: pick(item.description, locale)
  }))
  if (items.length === 0) return null
  const heading = pick(block!.heading, locale)
  const intro = pick(block!.intro, locale)
  const subIntro = pick(block!.subIntro, locale)
  const serviceName = pick(detail.card.name, locale)
  return (
    <div className='space-y-6'>
      {heading ? <SectionHeading title={heading} /> : null}
      <ServiceImageSplit src={block?.image || null} alt={serviceName} reverse>
        <div className='space-y-4'>
          {intro ? <p className='text-base leading-relaxed text-foreground'>{intro}</p> : null}
          {subIntro ? <p className='text-base leading-relaxed text-foreground'>{subIntro}</p> : null}
          <ul className='space-y-2.5 pt-1'>
            {items.map((item, i) => {
              const title = item.description ? item.title : null
              const body = item.description || item.title
              return (
                <li key={i} className='flex items-start gap-3'>
                  <span className='mt-0.5 grid size-6 shrink-0 place-items-center rounded-full rounded-tl-[0.1875rem] bg-leaf/15 text-leaf'>
                    <CheckCircle2 className='size-4' />
                  </span>
                  <div className='min-w-0'>
                    {title ? (
                      <p className='font-title text-sm font-bold leading-tight text-primary sm:text-base'>{title}</p>
                    ) : null}
                    <span className='text-sm leading-relaxed text-foreground'>{body}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </ServiceImageSplit>
    </div>
  )
}

function BenefitsSection({ detail, locale }: SectionProps) {
  const block = detail.benefits
  const items = (block?.items ?? []).map((item) => ({
    title: pick(item.title, locale),
    description: pick(item.description, locale)
  }))
  if (items.length === 0) return null
  const heading = headingFor('benefits', block!.heading, locale)
  const allPlain = items.every((item) => !item.description)
  const serviceName = pick(detail.card.name, locale)
  return (
    <div className='space-y-6'>
      <SectionHeading title={heading} />
      {allPlain ? (
        <ul className={cn('grid gap-3', gridCols(items.length, 2))}>
          {items.map((item, i) => (
            <li key={i} className={cn(petalCard, petalCardHover, 'flex items-start gap-3 p-4')}>
              <span className='mt-0.5 grid size-7 shrink-0 place-items-center rounded-full rounded-tl-[0.25rem] bg-leaf/15 text-leaf'>
                <CheckCircle2 className='size-4' />
              </span>
              <span className='pt-0.5 text-sm leading-relaxed text-foreground'>{item.title}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className={cn('grid gap-4', gridCols(items.length, 3))}>
          {items.map((item, i) => {
            const description = item.description || item.title
            const title = item.description ? item.title : ''
            return (
              <article
                key={i}
                className={cn(petalCard, petalCardHover, 'group relative flex flex-col gap-3 overflow-hidden p-5')}
              >
                <span className='flex items-baseline gap-3'>
                  <span className='font-title text-3xl font-bold italic leading-none text-leaf/50 transition-colors group-hover:text-leaf'>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden='true' className='h-px flex-1 bg-gradient-to-r from-leaf/30 to-transparent' />
                </span>
                <div className='space-y-1.5'>
                  {title ? (
                    <h3 className='font-title text-base font-bold leading-tight text-primary sm:text-lg'>{title}</h3>
                  ) : null}
                  <p className='text-sm leading-relaxed text-foreground'>{description}</p>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {block?.image ? (
        <div className='mt-10'>
          <ServiceImageDivider src={block.image} alt={serviceName} ratio='aspect-[16/6]' />
        </div>
      ) : null}
    </div>
  )
}

function ProcessSection({ detail, locale }: SectionProps) {
  const block = detail.process
  const steps = (block?.items ?? [])
    .map((item) => pick(item.title, locale) || pick(item.description, locale))
    .filter(Boolean)
  if (steps.length === 0) return null
  const heading = headingFor('process', block!.heading, locale)
  const serviceName = pick(detail.card.name, locale)
  return (
    <div className='space-y-6'>
      <SectionHeading title={heading} />
      <ol className='mt-2'>
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          return (
            <li key={i} className='relative flex gap-5 pb-8 last:pb-0'>
              {!isLast ? (
                <span
                  aria-hidden='true'
                  className='absolute left-[1.375rem] top-12 h-[calc(100%-3rem)] w-px bg-gradient-to-b from-leaf/50 to-primary/15'
                />
              ) : null}
              <span className='relative z-10 grid size-11 shrink-0 place-items-center rounded-full rounded-tl-[0.4375rem] bg-primary font-title text-base font-bold text-primary-foreground shadow-md shadow-primary/15 ring-4 ring-background'>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className='pt-2.5 text-sm leading-relaxed text-foreground sm:text-base'>{step}</p>
            </li>
          )
        })}
      </ol>
      {block?.image ? (
        <div className='mt-8'>
          <ServiceImageDivider src={block.image} alt={serviceName} />
        </div>
      ) : null}
    </div>
  )
}

function AudienceSection({ detail, locale }: SectionProps) {
  const block = detail.audience
  const items = (block?.items ?? [])
    .map((item) => ({ title: pick(item.title, locale), description: pick(item.description, locale) }))
    .filter((item) => item.title || item.description)
  if (items.length === 0) return null
  const heading = headingFor('audience', block!.heading, locale)
  const subIntro = pick(block!.subIntro, locale)
  const serviceName = pick(detail.card.name, locale)
  return (
    <div className='space-y-6'>
      <SectionHeading title={heading} />
      {subIntro ? <p className='text-base leading-relaxed text-foreground'>{subIntro}</p> : null}
      <ul className={cn('grid gap-3', gridCols(items.length, 3))}>
        {items.map((item, i) => {
          const label = item.title || item.description
          const description = item.title ? item.description : ''
          return (
            <li key={i} className={cn(petalCard, petalCardHover, 'flex items-start gap-3 p-4')}>
              <span className='grid size-9 shrink-0 place-items-center rounded-xl rounded-tl-[0.3125rem] bg-secondary/50 text-primary'>
                <Building2 className='size-4.5' />
              </span>
              <div className='min-w-0'>
                <span className='text-sm font-medium leading-snug text-foreground'>{label}</span>
                {description ? (
                  <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>{description}</p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
      {block?.image ? (
        <div className='mt-8'>
          <ServiceImageDivider src={block.image} alt={serviceName} />
        </div>
      ) : null}
    </div>
  )
}

// Answers may embed a single `<zalo>…</zalo>` marker the FE swaps for the Zalo link.
const ZALO_MARKER = /<zalo>([\s\S]*?)<\/zalo>/

function FaqSection({ detail, locale, zaloUrl }: SectionProps & { zaloUrl?: string }) {
  const items = detail.faq?.items ?? []
  if (items.length === 0) return null
  const heading = headingFor('faq', detail.faq!.heading, locale)
  const serviceName = pick(detail.card.name, locale)

  const renderAnswer = (answer: string, hasZalo: boolean): ReactNode => {
    if (!hasZalo) return answer
    const match = answer.match(ZALO_MARKER)
    if (!match) return answer
    const [full, label] = match
    const start = match.index ?? 0
    return (
      <>
        {answer.slice(0, start)}
        {zaloUrl ? (
          <a
            href={zaloUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='font-semibold text-primary underline underline-offset-2 hover:text-primary/80'
          >
            {label}
          </a>
        ) : (
          <span className='font-semibold text-primary'>{label}</span>
        )}
        {answer.slice(start + full.length)}
      </>
    )
  }

  return (
    <div className='space-y-6'>
      <SectionHeading title={heading} />
      <div className={cn(petalCard, 'divide-y divide-primary/10 px-5 py-1 sm:px-6')}>
        {items.map((item, i) => (
          <div key={i} className='py-3.5'>
            <p className='flex items-start gap-2 text-sm font-medium text-foreground sm:text-base'>
              {pick(item.question, locale)}
            </p>
            <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
              {renderAnswer(pick(item.answer, locale), item.hasZalo)}
            </p>
          </div>
        ))}
      </div>
      {detail.faq?.image ? <ServiceImageDivider src={detail.faq.image} alt={serviceName} /> : null}
    </div>
  )
}

function ClosingSection({ detail, locale }: SectionProps) {
  const paragraphs = detail.closing.paragraphs.map((p) => pick(p, locale)).filter(Boolean)
  if (paragraphs.length === 0) return null
  const heading = pick(detail.closing.heading, locale)
  const serviceName = pick(detail.card.name, locale)
  return (
    <div className='space-y-8'>
      <div className='relative overflow-hidden rounded-[1.75rem] rounded-tl-[0.5625rem] border border-primary/10 bg-gradient-to-br from-secondary/50 via-card/40 to-leaf/15 p-6 shadow-md shadow-primary/5 sm:p-10'>
        <span aria-hidden='true' className='pointer-events-none absolute -right-6 -top-4 text-primary/10'>
          <Quote className='size-28 sm:size-36' />
        </span>
        <div className='relative border-l-4 border-leaf pl-5 sm:pl-6'>
          {heading ? <h2 className='font-title text-xl font-bold text-primary sm:text-2xl'>{heading}</h2> : null}
          <div className='mt-3 space-y-3'>
            {paragraphs.map((p, i) => (
              <p key={i} className='font-title text-lg italic leading-relaxed text-primary sm:text-xl'>
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
      {detail.closing.image ? <ServiceImageDivider src={detail.closing.image} alt={serviceName} /> : null}
    </div>
  )
}

export function renderServiceSection(
  key: SectionKey,
  detail: B2BServiceDetail,
  locale: PreviewLocale,
  zaloUrl?: string
): ReactNode {
  switch (key) {
    case 'intro':
      return <IntroSection detail={detail} locale={locale} />
    case 'stats':
      return <StatsSection detail={detail} locale={locale} />
    case 'inclusions':
      return <InclusionsSection detail={detail} locale={locale} />
    case 'mice':
      return <MiceSection detail={detail} locale={locale} />
    case 'schedule':
      return <ScheduleSection detail={detail} locale={locale} />
    case 'personalization':
      return <PersonalizationSection detail={detail} locale={locale} />
    case 'benefits':
      return <BenefitsSection detail={detail} locale={locale} />
    case 'process':
      return <ProcessSection detail={detail} locale={locale} />
    case 'audience':
      return <AudienceSection detail={detail} locale={locale} />
    case 'faq':
      return <FaqSection detail={detail} locale={locale} zaloUrl={zaloUrl} />
    case 'closing':
      return <ClosingSection detail={detail} locale={locale} />
  }
}
