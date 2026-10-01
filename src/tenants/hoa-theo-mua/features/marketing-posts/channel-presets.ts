import { MarketingPostChannel } from './types'

// Giọng văn AI phải theo khi viết lại nội dung gốc cho từng nền tảng.
// Tỉ lệ ảnh KHÔNG nằm ở đây - admin chọn tỉ lệ riêng cho từng ảnh lúc tạo bài.
export const marketingPostChannelPresets: Record<MarketingPostChannel, { toneKey: string; promptKey: string }> = {
  [MarketingPostChannel.Facebook]: {
    toneKey: 'marketingPosts.channelPreset.facebook',
    promptKey: 'marketingPosts.systemPrompt.facebook'
  },
  [MarketingPostChannel.Instagram]: {
    toneKey: 'marketingPosts.channelPreset.instagram',
    promptKey: 'marketingPosts.systemPrompt.instagram'
  },
  [MarketingPostChannel.ZaloOa]: {
    toneKey: 'marketingPosts.channelPreset.zaloOa',
    promptKey: 'marketingPosts.systemPrompt.zaloOa'
  }
}
