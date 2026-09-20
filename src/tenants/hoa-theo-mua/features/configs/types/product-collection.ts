/** Document collection `products.<suffix>`. */
import type { CollectionCard, CollectionSection, LocalizedText } from './localized'

export interface ProductCollectionCampaign {
  id: string
  campaignName: LocalizedText
  skuPrefix: string
  startDate: string
  endDate: string
  categoryIds: string[]
  badge: LocalizedText
  enabled: boolean
}

export interface ProductCollectionCard extends CollectionCard {
  // Luôn có mặt để bật/tắt hasCampaigns trong editor không làm mất dữ liệu.
  campaigns: ProductCollectionCampaign[]
}

export interface ProductCollection {
  section: CollectionSection
  hasCampaigns: boolean
  cards: ProductCollectionCard[]
}
