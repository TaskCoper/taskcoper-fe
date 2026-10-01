import { MarketingPostChannel, MarketingPostPlatform } from './types'

// Khung preview và phần cấu hình prompt bên frontend gọi Zalo OA là `zaloOa`, backend gọi `zalo`.
// Gom hai chiều quy đổi về một chỗ để không mỗi nơi tự map một kiểu.
export const platformChannels: Record<MarketingPostPlatform, MarketingPostChannel> = {
  [MarketingPostPlatform.Facebook]: MarketingPostChannel.Facebook,
  [MarketingPostPlatform.Instagram]: MarketingPostChannel.Instagram,
  [MarketingPostPlatform.Zalo]: MarketingPostChannel.ZaloOa
}

export const channelPlatforms: Record<MarketingPostChannel, MarketingPostPlatform> = {
  [MarketingPostChannel.Facebook]: MarketingPostPlatform.Facebook,
  [MarketingPostChannel.Instagram]: MarketingPostPlatform.Instagram,
  [MarketingPostChannel.ZaloOa]: MarketingPostPlatform.Zalo
}
