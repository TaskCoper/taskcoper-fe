import type { RatingValue } from '@/components/rating-field'
import { emptyLocalizedText, safeJsonParse } from './palette-shared'
import { FEEDBACK_SOURCES, type FeedbackCollection, type FeedbackItem, type FeedbackSource } from './types'

// Storefront vẽ ảnh này thành avatar tròn 40px (`testimonial-carousel.tsx`) nên bắt buộc phải vuông.
export const FEEDBACK_IMAGE_ASPECT = 1

export const FEEDBACKS_GROUP = 'feedbacks'
export const FEEDBACKS_KEY_PREFIX = `${FEEDBACKS_GROUP}.`

export const matchesFeedbacksKey = (key: string): boolean =>
  key.startsWith(FEEDBACKS_KEY_PREFIX) && key.length > FEEDBACKS_KEY_PREFIX.length

export const feedbacksKeySuffix = (key: string): string =>
  key.startsWith(FEEDBACKS_KEY_PREFIX) ? key.slice(FEEDBACKS_KEY_PREFIX.length) : key

export const MAX_FEATURED_FEEDBACKS = 6

const VALID_RATINGS: RatingValue[] = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

const genId = (): string => `fb_${Math.random().toString(36).slice(2, 8)}`

export const defaultFeedbackItem = (): FeedbackItem => ({
  id: genId(),
  customerName: '',
  area: '',
  content: emptyLocalizedText(),
  flowerType: '',
  image: '',
  postDate: new Date().toISOString().slice(0, 10),
  rating: 5,
  featured: false,
  source: 'other',
  sourceUrl: ''
})

export const defaultFeedbackCollection = (): FeedbackCollection => ({
  section: {
    title: emptyLocalizedText(),
    description: emptyLocalizedText(),
    enabled: true
  },
  items: []
})

export const countFeatured = (items: FeedbackItem[]): number => items.filter((i) => i.featured).length

export const parseFeedbackCollection = (raw: unknown): FeedbackCollection => {
  const fromString = typeof raw === 'string' ? safeJsonParse(raw) : raw
  if (!fromString || typeof fromString !== 'object') return defaultFeedbackCollection()
  const obj = fromString as Partial<FeedbackCollection>
  const section = obj.section ?? defaultFeedbackCollection().section
  const items = Array.isArray(obj.items) ? obj.items : []
  return {
    section: {
      title: { vi: section.title?.vi ?? '', en: section.title?.en ?? '' },
      description: { vi: section.description?.vi ?? '', en: section.description?.en ?? '' },
      enabled: section.enabled ?? true
    },
    items: items.map((item) => normalizeItem(item))
  }
}

const normalizeItem = (raw: unknown): FeedbackItem => {
  const base = defaultFeedbackItem()
  if (!raw || typeof raw !== 'object') return base
  const i = raw as Partial<FeedbackItem>
  const source: FeedbackSource = FEEDBACK_SOURCES.includes(i.source as FeedbackSource)
    ? (i.source as FeedbackSource)
    : 'other'
  const rating = VALID_RATINGS.includes(i.rating as RatingValue) ? (i.rating as RatingValue) : undefined
  return {
    ...base,
    ...i,
    id: typeof i.id === 'string' && i.id ? i.id : base.id,
    customerName: i.customerName ?? '',
    area: i.area ?? '',
    content: { vi: i.content?.vi ?? '', en: i.content?.en ?? '' },
    flowerType: i.flowerType ?? '',
    image: i.image ?? '',
    postDate: i.postDate ?? base.postDate,
    rating,
    featured: Boolean(i.featured),
    source,
    sourceUrl: i.sourceUrl ?? ''
  }
}
