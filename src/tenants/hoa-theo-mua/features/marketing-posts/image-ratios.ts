import { MarketingPostRatioCode } from './types'

// Danh sách bám theo RatioCode của backend: 2:1 bên đó không có nên bỏ, 3:4 bên đó có nên thêm.
export const MarketingPostImageRatio = {
  Square: '1:1',
  Portrait: '4:5',
  PortraitClassic: '3:4',
  Story: '9:16',
  Landscape: '16:9'
} as const

export type MarketingPostImageRatio = (typeof MarketingPostImageRatio)[keyof typeof MarketingPostImageRatio]

export const marketingPostImageRatios = [
  MarketingPostImageRatio.Square,
  MarketingPostImageRatio.Portrait,
  MarketingPostImageRatio.PortraitClassic,
  MarketingPostImageRatio.Story,
  MarketingPostImageRatio.Landscape
]

// Tỉ lệ để dạng '4:5' cho cắm thẳng vào aspect-ratio của CSS, còn backend nhận mã chữ
export const marketingPostImageRatioCodes: Record<MarketingPostImageRatio, MarketingPostRatioCode> = {
  [MarketingPostImageRatio.Square]: MarketingPostRatioCode.Square1x1,
  [MarketingPostImageRatio.Portrait]: MarketingPostRatioCode.Portrait4x5,
  [MarketingPostImageRatio.PortraitClassic]: MarketingPostRatioCode.Portrait3x4,
  [MarketingPostImageRatio.Story]: MarketingPostRatioCode.Story9x16,
  [MarketingPostImageRatio.Landscape]: MarketingPostRatioCode.Landscape16x9
}

// Kích thước AI xuất ra cho từng tỉ lệ. Dùng để dựng ảnh mock và hiện gợi ý cho admin.
export const marketingPostImageRatioSizes: Record<MarketingPostImageRatio, { width: number; height: number }> = {
  [MarketingPostImageRatio.Square]: { width: 1080, height: 1080 },
  [MarketingPostImageRatio.Portrait]: { width: 1080, height: 1350 },
  [MarketingPostImageRatio.PortraitClassic]: { width: 1080, height: 1440 },
  [MarketingPostImageRatio.Story]: { width: 1080, height: 1920 },
  [MarketingPostImageRatio.Landscape]: { width: 1920, height: 1080 }
}

// Chiều ngược lại: đọc ảnh backend trả về thì chỉ có mã chữ, cần đổi lại thành tỉ lệ để dựng khung
export const marketingPostRatiosByCode = Object.fromEntries(
  Object.entries(marketingPostImageRatioCodes).map(([ratio, code]) => [code, ratio])
) as Record<MarketingPostRatioCode, MarketingPostImageRatio>
