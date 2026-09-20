import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { memo } from 'react'
import { type OverviewFaq, type OverviewFaqItem } from '../../../types'
import { pick, type PreviewContact, type PreviewLocale } from './preview-shared'

// Answers may embed a single `<zalo>…</zalo>` marker that becomes a Zalo deep-link.
const ZALO_MARKER = /<zalo>([\s\S]*?)<\/zalo>/

export const FaqPreview = memo(function FaqPreview({
  faq,
  contact,
  locale
}: {
  faq: OverviewFaq
  contact: PreviewContact
  locale: PreviewLocale
}) {
  const renderAnswer = (item: OverviewFaqItem): ReactNode => {
    const answer = pick(item.answer, locale)
    if (!item.hasZalo) return answer

    const match = answer.match(ZALO_MARKER)
    if (!match) return answer

    const [full, label] = match
    const start = match.index ?? 0
    const before = answer.slice(0, start)
    const after = answer.slice(start + full.length)
    return (
      <>
        {before}
        {contact.zaloUrl ? (
          <a
            href={contact.zaloUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='font-semibold text-primary underline underline-offset-2 hover:text-primary/80'
          >
            {label}
          </a>
        ) : (
          <span className='font-semibold text-primary underline underline-offset-2'>{label}</span>
        )}
        {after}
      </>
    )
  }

  return (
    <section className='relative mt-8 sm:mt-10 md:mt-12 lg:mt-14 px-4'>
      <div className='mx-auto w-full max-w-3xl space-y-1 sm:space-y-1.5 md:space-y-2'>
        <h2 className='shrink-0 text-center font-title text-2xl md:text-3xl lg:text-4xl font-bold text-primary'>
          {pick(faq.title, locale)}
        </h2>
        <p className='leading-relaxed mx-auto max-w-full sm:max-w-180 text-left sm:text-center text-xs sm:text-sm text-foreground'>
          {pick(faq.description, locale)}
        </p>
      </div>

      <div className='mx-auto mt-6 w-full max-w-3xl rounded-3xl bg-card px-5 py-2 shadow-[0_0.6rem_1.6rem_rgb(81_108_108/8%)] ring-1 ring-foreground/5 sm:px-6'>
        {/* Raw radix primitives styled like the public site's accordion (the admin one looks different). */}
        <AccordionPrimitive.Root type='single' collapsible className='w-full'>
          {faq.items.map((item, index) => (
            <AccordionPrimitive.Item
              key={item.id || index}
              value={item.id || String(index)}
              className='border-b border-foreground/10 last:border-b-0'
            >
              <AccordionPrimitive.Header className='flex'>
                <AccordionPrimitive.Trigger className='group flex flex-1 cursor-pointer items-start justify-between gap-4 py-4 text-left font-title text-sm font-semibold text-primary outline-none transition-colors hover:text-foreground sm:text-base'>
                  {pick(item.question, locale)}
                  <ChevronDown className='size-5 shrink-0 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180' />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className='overflow-hidden text-xs leading-relaxed text-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down sm:text-sm'>
                <div className='pt-0 pb-4'>{renderAnswer(item)}</div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>
      </div>
    </section>
  )
})
