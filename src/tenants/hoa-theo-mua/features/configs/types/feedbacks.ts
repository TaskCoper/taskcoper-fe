/** Document `feedbacks.<suffix>`. */
import type { RatingValue } from '@/components/rating-field'
import type { LocalizedText } from './localized'

export const FEEDBACK_SOURCES = ['zalo', 'messenger', 'facebook', 'google', 'other'] as const

export type FeedbackSource = (typeof FEEDBACK_SOURCES)[number]

export interface FeedbackItem {
  id: string
  customerName: string
  area: string
  content: LocalizedText
  flowerType: string
  image: string
  postDate: string
  rating?: RatingValue
  featured: boolean
  source: FeedbackSource
  sourceUrl: string
}

export interface FeedbackCollection {
  section: {
    title: LocalizedText
    description: LocalizedText
    enabled: boolean
  }
  items: FeedbackItem[]
}
