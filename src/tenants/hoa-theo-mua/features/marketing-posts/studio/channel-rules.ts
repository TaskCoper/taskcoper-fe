import { MarketingPostImageRatio } from '../image-ratios'
import { MarketingPostChannel } from '../types'

interface MarketingPostChannelRule {
  // Tỉ lệ nền tảng hiển thị đẹp nhất, XẾP THEO ĐỘ ƯU TIÊN - phần tử đầu là tỉ lệ được chọn
  // mặc định cho kênh. Ba kênh phải khác nhau ở vị trí đầu, không thì kênh nào cũng tick
  // đúng một ảnh và nhìn cứ như các kênh đang dùng chung lựa chọn.
  // Chỉ là gợi ý mềm: admin vẫn chọn được tỉ lệ khác, hệ thống nhắc chứ không chặn.
  preferredRatios: MarketingPostImageRatio[]
  // Tỉ lệ nền tảng từ chối hẳn, khác với "không đẹp": chọn vào là lần đăng hỏng chắc chắn
  unsupportedRatios: MarketingPostImageRatio[]
  // Đăng nhiều ảnh (album) thì mọi ảnh bắt buộc đúng tỉ lệ này. Null là không ràng buộc.
  albumRatio: MarketingPostImageRatio | null
  captionMax: number
  maxImages: number
}

export const marketingPostChannelRules: Record<MarketingPostChannel, MarketingPostChannelRule> = {
  [MarketingPostChannel.Facebook]: {
    preferredRatios: [
      MarketingPostImageRatio.Landscape,
      MarketingPostImageRatio.Square,
      MarketingPostImageRatio.PortraitClassic
    ],
    unsupportedRatios: [],
    albumRatio: null,
    captionMax: 5000,
    maxImages: 10
  },
  [MarketingPostChannel.Instagram]: {
    preferredRatios: [MarketingPostImageRatio.Portrait, MarketingPostImageRatio.Square],
    // Bài feed Instagram chỉ nhận tỉ lệ từ 4:5 tới 1.91:1. 9:16 là của Story/Reels và 3:4 hẹp hơn 4:5,
    // worker trả INSTAGRAM_IMAGE_DIMENSIONS_INVALID ngay bước chuẩn bị ảnh.
    unsupportedRatios: [MarketingPostImageRatio.Story, MarketingPostImageRatio.PortraitClassic],
    // Album Instagram chỉ nhận ảnh vuông (INSTAGRAM_CAROUSEL_SQUARE_REQUIRED)
    albumRatio: MarketingPostImageRatio.Square,
    captionMax: 2200,
    maxImages: 10
  },
  [MarketingPostChannel.ZaloOa]: {
    preferredRatios: [MarketingPostImageRatio.Square, MarketingPostImageRatio.Landscape],
    unsupportedRatios: [],
    albumRatio: null,
    captionMax: 1000,
    maxImages: 9
  }
}

export const isPreferredRatio = (channel: MarketingPostChannel, ratio: MarketingPostImageRatio) =>
  marketingPostChannelRules[channel].preferredRatios.includes(ratio)
