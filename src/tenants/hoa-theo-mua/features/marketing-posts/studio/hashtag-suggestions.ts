import { MarketingPostChannel } from '../types'

// Bộ hashtag hay dùng của shop, gợi ý sẵn để admin bấm thay vì gõ lại mỗi lần.
// Instagram sống nhờ hashtag nên để nhiều, Zalo OA gần như không dùng nên để ít.
const channelHashtagSuggestions: Record<MarketingPostChannel, string[]> = {
  [MarketingPostChannel.Facebook]: ['#hoatheomua', '#hoatuoi', '#giaohoanhanh', '#quatang', '#hoasinhnhat', '#hoacuoi'],
  [MarketingPostChannel.Instagram]: [
    '#hoatheomua',
    '#hoatuoi',
    '#hoadep',
    '#giaohoanhanh',
    '#flowerlover',
    '#flowerstagram',
    '#bouquet',
    '#hoasinhnhat',
    '#hoacuoi'
  ],
  [MarketingPostChannel.ZaloOa]: ['#hoatheomua', '#hoatuoi', '#uudai', '#giaohoanhanh']
}

export const getMarketingHashtagSuggestions = (channel: MarketingPostChannel, current: string[]) =>
  channelHashtagSuggestions[channel].filter((hashtag) => !current.includes(hashtag))
