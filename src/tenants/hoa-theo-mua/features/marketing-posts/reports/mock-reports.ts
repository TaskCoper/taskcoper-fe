import { listMockMarketingPosts, marketingPostChannels } from '../mock-data'
import { MarketingPostChannel, MarketingPostStatus, type MarketingPostItem } from '../types'
import {
  MarketingReportRange,
  type GetMarketingReportParams,
  type MarketingPostMetrics,
  type MarketingReport,
  type MarketingReportChannelRow
} from './types'

const DAY_MS = 24 * 60 * 60 * 1000

// Số giả phải cố định theo id bài: random thật thì mỗi lần render ra một con số khác,
// nhìn như số liệu đang nhảy loạn. Thay bằng API thật thì bỏ cả khối này.
const seedFrom = (value: string) => {
  let seed = 0
  for (let index = 0; index < value.length; index += 1) seed = (seed * 31 + value.charCodeAt(index)) % 2147483647

  return seed || 1
}

const pseudoRandom = (seed: number, step: number) => ((seed * 9301 + step * 49297) % 233280) / 233280

// Quy mô người theo dõi của từng kênh khác nhau nên lượt tiếp cận không thể cùng một thang
const channelReachBase: Record<MarketingPostChannel, number> = {
  [MarketingPostChannel.Facebook]: 4200,
  [MarketingPostChannel.Instagram]: 2600,
  [MarketingPostChannel.ZaloOa]: 1500
}

const buildMetrics = (post: MarketingPostItem): MarketingPostMetrics => {
  const seed = seedFrom(post.id)
  const base = channelReachBase[post.channel]

  const reach = Math.round(base * (0.55 + pseudoRandom(seed, 1) * 0.9))
  // Một người thường thấy bài vài lần nên hiển thị luôn lớn hơn tiếp cận
  const impressions = Math.round(reach * (1.2 + pseudoRandom(seed, 2) * 0.6))
  const engagements = Math.round(reach * (0.02 + pseudoRandom(seed, 3) * 0.06))
  const clicks = Math.round(engagements * (0.1 + pseudoRandom(seed, 4) * 0.25))

  return {
    postId: post.id,
    title: post.title,
    channel: post.channel,
    publishedAt: post.publishedAt ?? post.createdAt,
    reach,
    impressions,
    engagements,
    clicks
  }
}

const toRate = (engagements: number, reach: number) => (reach > 0 ? Math.round((engagements / reach) * 1000) / 10 : 0)

const buildDayRange = (days: number) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: days }, (_, index) =>
    new Date(today.getTime() - (days - 1 - index) * DAY_MS).toISOString().slice(0, 10)
  )
}

export const getMockMarketingReport = async ({
  range = MarketingReportRange.Month,
  channel
}: GetMarketingReportParams): Promise<MarketingReport> => {
  const dayKeys = buildDayRange(Number(range))
  const since = new Date(`${dayKeys[0]}T00:00:00`).getTime()

  // Chỉ bài đã lên kênh mới có số liệu - bài nháp và bài đang chờ lịch thì nền tảng chưa biết đến
  const metrics = listMockMarketingPosts()
    .filter((post) => {
      if (post.status !== MarketingPostStatus.Published || !post.publishedAt) return false

      return (!channel || post.channel === channel) && new Date(post.publishedAt).getTime() >= since
    })
    .map(buildMetrics)

  const sum = (pick: (item: MarketingPostMetrics) => number) => metrics.reduce((total, item) => total + pick(item), 0)
  const reach = sum((item) => item.reach)
  const engagements = sum((item) => item.engagements)

  const reachByDay = new Map<string, number>()
  metrics.forEach((item) => {
    const key = item.publishedAt.slice(0, 10)
    reachByDay.set(key, (reachByDay.get(key) ?? 0) + item.reach)
  })

  const byChannel: MarketingReportChannelRow[] = marketingPostChannels.map((item) => {
    const rows = metrics.filter((metric) => metric.channel === item)
    const channelReach = rows.reduce((total, metric) => total + metric.reach, 0)
    const channelEngagements = rows.reduce((total, metric) => total + metric.engagements, 0)

    return {
      channel: item,
      posts: rows.length,
      reach: channelReach,
      engagements: channelEngagements,
      engagementRate: toRate(channelEngagements, channelReach)
    }
  })

  return {
    totals: {
      posts: metrics.length,
      reach,
      impressions: sum((item) => item.impressions),
      engagements,
      clicks: sum((item) => item.clicks),
      engagementRate: toRate(engagements, reach)
    },
    daily: dayKeys.map((date) => ({ date, reach: reachByDay.get(date) ?? 0 })),
    byChannel,
    topPosts: [...metrics].sort((a, b) => b.engagements - a.engagements).slice(0, 8),
    // API nền tảng đồng bộ theo mẻ, mock lấy mốc gần nhất cho giống
    syncedAt: new Date().toISOString()
  }
}
