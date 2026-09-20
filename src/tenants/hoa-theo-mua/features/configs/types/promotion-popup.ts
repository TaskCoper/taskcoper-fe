/** Document `promotions.popup`: một ô popup, mỗi campaign là một item bên trong. */
import type { LocalizedText } from './localized'

/** Tần suất khách quay lại thấy cùng một campaign; `every-load` chỉ dùng để xem trước. */
export const POPUP_FREQUENCIES = ['once-per-session', 'every-load'] as const

export type PromotionPopupFrequency = (typeof POPUP_FREQUENCIES)[number]

/** Ngày dạng `YYYY-MM-DD`, so sánh theo thứ tự chuỗi. `''` = không giới hạn; `endDate` tính cả ngày đó. */
export interface PromotionCampaign {
  id: string
  image: string
  href: string
  openInNewTab: boolean
  alt: LocalizedText
  startDate: string
  endDate: string
  enabled: boolean
  // [] là thừa kế section.pages; danh sách khác rỗng sẽ thay thế hẳn.
  pages: string[]
}

export interface PromotionPopupSection {
  enabled: boolean
  frequency: PromotionPopupFrequency
  pages: string[]
}

export interface PromotionPopupCollection {
  section: PromotionPopupSection
  items: PromotionCampaign[]
}
