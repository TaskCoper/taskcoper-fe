import type { MarketingPostChannel } from '../types'

export const MarketingReportRange = {
  Week: '7',
  Month: '30',
  Quarter: '90'
} as const

export type MarketingReportRange = (typeof MarketingReportRange)[keyof typeof MarketingReportRange]

export const marketingReportRanges = [
  MarketingReportRange.Week,
  MarketingReportRange.Month,
  MarketingReportRange.Quarter
]

// Bộ chỉ số lấy từ API của từng nền tảng. Mỗi kênh gọi tên một kiểu (Facebook có "impressions",
// Zalo OA có "lượt xem") nên quy về một bộ chung để so được giữa các kênh với nhau.
export interface MarketingPostMetrics {
  postId: string
  title: string
  channel: MarketingPostChannel
  publishedAt: string
  // Số người nhìn thấy bài
  reach: number
  // Số lần bài được hiển thị, một người có thể thấy nhiều lần
  impressions: number
  // Thích + bình luận + chia sẻ + lưu
  engagements: number
  clicks: number
}

export interface MarketingReportTotals {
  posts: number
  reach: number
  impressions: number
  engagements: number
  clicks: number
  // Tương tác trên mỗi người tiếp cận, tính theo phần trăm
  engagementRate: number
}

export interface MarketingReportDailyPoint {
  date: string
  reach: number
}

export interface MarketingReportChannelRow {
  channel: MarketingPostChannel
  posts: number
  reach: number
  engagements: number
  engagementRate: number
}

export interface MarketingReport {
  totals: MarketingReportTotals
  daily: MarketingReportDailyPoint[]
  byChannel: MarketingReportChannelRow[]
  topPosts: MarketingPostMetrics[]
  // Số liệu không phải thời gian thực, phải cho biết lấy về lúc nào
  syncedAt: string
}

export interface GetMarketingReportParams {
  range?: MarketingReportRange
  channel?: MarketingPostChannel
}
