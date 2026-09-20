/** Document `banners.<suffix>`. */
import type { LocalizedText } from './localized'

export interface BannerItem {
  id: string
  /**
   * Khoá vị trí tự do (ví dụ "hero", "sidebar-top", "checkout-footer").
   * Component phía storefront lọc banner theo chuỗi này.
   */
  slot: string
  image: LocalizedText
  href: string
  openInNewTab: boolean
  alt: LocalizedText
  enabled: boolean
}

export interface BannerCollection {
  section: {
    enabled: boolean
  }
  items: BannerItem[]
}
