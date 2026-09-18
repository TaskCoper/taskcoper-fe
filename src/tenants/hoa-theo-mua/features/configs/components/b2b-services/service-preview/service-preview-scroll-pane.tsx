import { cn } from '@/shared/utils'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { type B2BServiceDetail, type OverviewCta } from '../../../types'
import { B2BPreviewFrame } from '../preview/b2b-preview-frame'
import { CtaPreview } from '../preview/cta-preview'
import type { PreviewContact } from '../preview/preview-shared'
import {
  ServiceBreadcrumbPreview,
  ServiceHeroPreview,
  ServiceSidebarPreview,
  type ServiceSibling
} from './service-chrome'
import type { PreviewLocale, SectionKey } from './service-preview-shared'
import { getServiceSectionKeys, renderServiceSection } from './service-sections'

const DESIGN_WIDTH = 1280
const PEEK = 40

// Nav entries without a physical section (settings/seo) focus the hero masthead.
export type ServicePreviewSelection = 'hero' | SectionKey

export interface ServicePreviewData {
  detail: B2BServiceDetail
  siblings: ServiceSibling[]
  contact: PreviewContact
  cta: OverviewCta
  locale: PreviewLocale
  zaloUrl?: string
}

// Renders the whole /b2b/[service] page at desktop width, scaled to fill the pane. Selecting
// a section smooth-scrolls it into view and dims the rest; the zoom itself never changes.
export function ServicePreviewScrollPane({
  selected,
  detail,
  siblings,
  contact,
  cta,
  locale,
  zaloUrl
}: ServicePreviewData & { selected: ServicePreviewSelection }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Partial<Record<ServicePreviewSelection, HTMLDivElement | null>>>({})

  const [scale, setScale] = useState(0.5)
  const [innerHeight, setInnerHeight] = useState(0)

  const sectionKeys = getServiceSectionKeys(detail)

  useLayoutEffect(() => {
    const inner = innerRef.current
    const container = containerRef.current
    if (!inner || !container) return
    const update = () => {
      setScale(Math.max(0.1, container.clientWidth / DESIGN_WIDTH))
      setInnerHeight(inner.offsetHeight)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(inner)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Diffs getBoundingClientRect rather than offsetTop, which would resolve against the nearest
  // positioned ancestor instead of the scaled page root.
  useEffect(() => {
    const container = containerRef.current
    const section = sectionRefs.current[selected]
    if (!container || !section) return
    const containerRect = container.getBoundingClientRect()
    const sectionRect = section.getBoundingClientRect()
    const top = container.scrollTop + (sectionRect.top - containerRect.top)
    const target = Math.max(0, top - Math.max(PEEK, (container.clientHeight - sectionRect.height) / 2))
    container.scrollTo({ top: target, behavior: 'smooth' })
  }, [selected, scale, sectionKeys.length])

  const dimClass = (key: ServicePreviewSelection) =>
    cn('transition-opacity duration-300', key !== selected && 'opacity-40')

  return (
    <div ref={containerRef} className='relative h-full overflow-y-auto overflow-x-hidden'>
      <div className='relative w-full' style={{ height: innerHeight * scale }}>
        <div
          ref={innerRef}
          className='absolute top-0 left-0'
          style={{ width: DESIGN_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <B2BPreviewFrame className='pb-4'>
            <div
              ref={(el) => {
                sectionRefs.current.hero = el
              }}
              className={dimClass('hero')}
            >
              <ServiceBreadcrumbPreview detail={detail} locale={locale} />
              <ServiceHeroPreview detail={detail} locale={locale} />
            </div>

            <div className='mx-auto mt-8 grid w-full max-w-7xl gap-8 px-4 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_21rem]'>
              <main className='min-w-0 space-y-8'>
                {sectionKeys.map((key) => (
                  <div
                    key={key}
                    ref={(el) => {
                      sectionRefs.current[key] = el
                    }}
                    className={cn('scroll-mt-28', dimClass(key))}
                  >
                    {renderServiceSection(key, detail, locale, zaloUrl)}
                  </div>
                ))}
              </main>
              <ServiceSidebarPreview sectionKeys={sectionKeys} siblings={siblings} contact={contact} locale={locale} />
            </div>

            <CtaPreview cta={cta} contact={contact} locale={locale} />
          </B2BPreviewFrame>
        </div>
      </div>
    </div>
  )
}
