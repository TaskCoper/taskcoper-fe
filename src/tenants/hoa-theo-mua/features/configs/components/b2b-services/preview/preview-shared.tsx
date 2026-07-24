/* eslint-disable react-refresh/only-export-components */
import { cn } from '@/shared/utils'
import {
  Building2,
  Calendar,
  Crown,
  Diamond,
  Flower2,
  Gift,
  HandHeart,
  Hotel,
  NotebookPen,
  Palette,
  Sparkles,
  Truck,
  type LucideIcon
} from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { useId } from 'react'
import type { B2BOverview } from '../../../b2b-overview-palette'
import type { LocalizedText } from '../../../palette-shared'

export type PreviewLocale = 'vi' | 'en'

// `partners` renders inside the case studies section but is independently selectable.
export type PreviewSelection = keyof B2BOverview | 'partners'

// Maps each selectable entry to the physical page section that should stay undimmed.
export const PREVIEW_DIM_GROUP: Record<PreviewSelection, keyof B2BOverview> = {
  hero: 'hero',
  trustBar: 'trustBar',
  services: 'services',
  caseStudies: 'caseStudies',
  partners: 'caseStudies',
  packages: 'packages',
  advantages: 'advantages',
  process: 'process',
  faq: 'faq',
  cta: 'cta'
}

// DOM anchor ids for the case-study-cards and partners sub-blocks, since neither has its
// own top-level section ref for `PreviewScrollPane` to scroll to.
export const CASE_STUDIES_SUB_ANCHOR_ID: Partial<Record<PreviewSelection, string>> = {
  caseStudies: 'b2b-preview-anchor-case-study-cards',
  partners: 'b2b-preview-anchor-partners'
}

// Mirrors the public site's `pick`: requested locale, then vi, then empty.
export const pick = (text: LocalizedText | undefined, locale: PreviewLocale): string => text?.[locale] || text?.vi || ''

// Service card copy comes from the per-service `card` docs, not the overview doc.
export interface ServiceCardData {
  tag: LocalizedText
  name: LocalizedText
  description: LocalizedText
}

// Contact values come from the `contact.*` configs on the public site; all optional here.
export interface PreviewContact {
  phone?: string
  email?: string
  zaloUrl?: string
}

export const SERVICE_META: ReadonlyArray<{
  id: string
  icon: LucideIcon
  accent: 'primary' | 'leaf'
  linkToPackages: boolean
}> = [
  { id: 'outsourced', icon: Hotel, accent: 'primary', linkToPackages: false },
  { id: 'events-mice', icon: Calendar, accent: 'primary', linkToPackages: false },
  { id: 'office-subscription', icon: Building2, accent: 'primary', linkToPackages: true },
  { id: 'corporate-gifts', icon: Gift, accent: 'primary', linkToPackages: false },
  { id: 'brand-experience', icon: Sparkles, accent: 'leaf', linkToPackages: false }
]

// Icon set admins pick from for advantages / process steps / packages.
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  flower: Flower2,
  crown: Crown,
  diamond: Diamond,
  gift: Gift,
  calendar: Calendar,
  handHeart: HandHeart,
  palette: Palette,
  notebookPen: NotebookPen,
  truck: Truck,
  hotel: Hotel,
  building: Building2
}
export const DEFAULT_ICON_KEY = 'sparkles'
export const resolveIcon = (key: string): LucideIcon => ICON_REGISTRY[key] ?? ICON_REGISTRY[DEFAULT_ICON_KEY]

// Non-interactive stand-in for the public site's Button (rounded-4xl, size lg).
export function PreviewButton({
  variant = 'default',
  className,
  children
}: {
  variant?: 'default' | 'secondary' | 'ghost'
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex h-10 shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-4xl border border-transparent px-4 text-sm font-medium transition-all [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/80',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground',
        variant === 'ghost' && 'hover:bg-muted hover:text-foreground',
        className
      )}
    >
      {children}
    </span>
  )
}

// Duplicated-track marquee with the public site's edge fade; pauses on hover.
export function Marquee({ children, durationSeconds }: { children: ReactNode; durationSeconds: number }) {
  return (
    <div
      className='group relative overflow-hidden'
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)'
      }}
    >
      <div
        className='animate-b2b-marquee flex w-max items-center gap-3 group-hover:[animation-play-state:paused] sm:gap-4'
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {children}
      </div>
    </div>
  )
}

// Repeats items until a set is at least `minPerSet` long; callers render two sets back to back.
export function buildMarqueeSet<T>(items: T[], minPerSet = 10): T[] {
  if (items.length === 0) return []
  const repeats = Math.max(1, Math.ceil(minPerSet / items.length))
  return Array.from({ length: repeats * items.length }, (_, i) => items[i % items.length])
}

export const marqueeDuration = (oneSetLength: number): number => Math.max(40, oneSetLength * 5.5)

// Port of the public site's SparkleDivider (dashed gradient line + hand-drawn sparkle).
export function SparkleDivider({
  color = '#516c6c',
  direction = 'ltr',
  className,
  iconClassName
}: {
  color?: CSSProperties['color']
  direction?: 'ltr' | 'rtl'
  className?: string
  iconClassName?: string
}) {
  const gradientId = useId().replace(/:/g, '')
  const isRtl = direction === 'rtl'

  const sparkle = (
    <svg
      className={cn('h-12 w-12 shrink-0 rotate-28', iconClassName)}
      viewBox='0 0 48 48'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M25 1 C24.4 12.3 22.2 17.1 17.9 19.6 C14.8 21.5 9.7 22.6 1 23.7 C9.5 25.2 14.5 26.8 17.6 29.6 C21.5 33 23.1 38.2 24.2 47 C25.9 38.8 27.8 33.4 31.2 30.1 C34.5 26.9 39.3 25.2 47 23.7 C39.4 22.5 34.6 20.9 31.5 18.1 C27.9 14.9 26.2 9.7 25 1 Z'
        fill='currentColor'
      />
    </svg>
  )

  const dashedLine = (
    <svg
      className='h-2 min-w-0 flex-1 overflow-visible'
      viewBox='0 0 1000 8'
      preserveAspectRatio='none'
      aria-hidden='true'
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1={isRtl ? '1000' : '0'}
          y1='0'
          x2={isRtl ? '0' : '1000'}
          y2='0'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.04' />
          <stop offset='18%' stopColor='currentColor' stopOpacity='0.18' />
          <stop offset='42%' stopColor='currentColor' stopOpacity='0.4' />
          <stop offset='68%' stopColor='currentColor' stopOpacity='0.67' />
          <stop offset='88%' stopColor='currentColor' stopOpacity='0.88' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='1' />
        </linearGradient>
      </defs>
      <path
        d='M0 4 H1000'
        stroke={`url(#${gradientId})`}
        strokeWidth='2'
        strokeDasharray='12 11'
        strokeLinecap='butt'
      />
    </svg>
  )

  return (
    <div className={cn('flex h-12 w-full items-center gap-0.75', className)} style={{ color }}>
      {isRtl ? (
        <>
          {sparkle}
          {dashedLine}
        </>
      ) : (
        <>
          {dashedLine}
          {sparkle}
        </>
      )}
    </div>
  )
}
