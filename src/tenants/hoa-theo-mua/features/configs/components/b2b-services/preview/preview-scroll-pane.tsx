import { cn } from '@/shared/utils'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { type B2BOverview } from '../../../types'
import { B2B_SECTION_KEYS, renderB2BSection, type B2BSectionData } from './b2b-page-sections'
import { B2BPreviewFrame } from './b2b-preview-frame'
import { CASE_STUDIES_SUB_ANCHOR_ID, PREVIEW_DIM_GROUP, type PreviewSelection } from './preview-shared'

export type { PreviewSelection }

const DESIGN_WIDTH = 1280
// Visible sliver of the neighbouring sections above/below the focused one.
const PEEK = 40

// Renders the whole /b2b page at desktop width, scaled to fill the pane. Selecting a
// section smooth-scrolls it into view and dims the rest; the zoom itself never changes.
export function PreviewScrollPane({ selected, ...data }: B2BSectionData & { selected: PreviewSelection }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Partial<Record<keyof B2BOverview, HTMLDivElement | null>>>({})

  const [scale, setScale] = useState(0.5)
  const [innerHeight, setInnerHeight] = useState(0)

  // Fixed width-fit zoom, recomputed only when the pane or page content resizes.
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

  // Case-studies sub-blocks aren't full sections, so they're looked up by anchor id instead
  // of a section ref. Diffs getBoundingClientRect rather than offsetTop, which would resolve
  // against the nearest positioned ancestor instead of the scaled page root.
  useEffect(() => {
    const container = containerRef.current
    const subAnchorId = CASE_STUDIES_SUB_ANCHOR_ID[selected]
    const section = subAnchorId
      ? document.getElementById(subAnchorId)
      : sectionRefs.current[selected as keyof B2BOverview]
    if (!container || !section) return
    const containerRect = container.getBoundingClientRect()
    const sectionRect = section.getBoundingClientRect()
    const top = container.scrollTop + (sectionRect.top - containerRect.top)
    const height = sectionRect.height
    const target = Math.max(0, top - Math.max(PEEK, (container.clientHeight - height) / 2))
    container.scrollTo({ top: target, behavior: 'smooth' })
  }, [selected, scale])

  const dimGroup = PREVIEW_DIM_GROUP[selected]

  return (
    <div ref={containerRef} className='relative h-full overflow-y-auto overflow-x-hidden'>
      <div className='relative w-full' style={{ height: innerHeight * scale }}>
        <div
          ref={innerRef}
          className='absolute top-0 left-0'
          style={{ width: DESIGN_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <B2BPreviewFrame>
            {B2B_SECTION_KEYS.map((key) => (
              <div
                key={key}
                ref={(el) => {
                  sectionRefs.current[key] = el
                }}
                className={cn('transition-opacity duration-300', key !== dimGroup && 'opacity-40')}
              >
                {renderB2BSection(key, { ...data, selected })}
              </div>
            ))}
          </B2BPreviewFrame>
        </div>
      </div>
    </div>
  )
}
