import type { MarketingPostPlatform } from '../types'
import type { GetPublicationsParams } from './types'

export const publicationKeys = {
  all: ['publications'] as const,
  // Preview gắn với bộ ba bài × nền tảng × account: đổi account là một bản chốt khác, hash khác
  previews: () => [...publicationKeys.all, 'preview'] as const,
  preview: (id: string, platform: MarketingPostPlatform, accountId: string) =>
    [...publicationKeys.previews(), id, platform, accountId] as const,
  // Lịch sử job theo bài × nền tảng
  lists: () => [...publicationKeys.all, 'list'] as const,
  list: (id: string, platform: MarketingPostPlatform, params: GetPublicationsParams) =>
    [...publicationKeys.lists(), id, platform, params] as const,
  // Job đọc theo publicationId, không cần biết bài nào - backend giữ được cả sau khi bài bị xoá
  details: () => [...publicationKeys.all, 'detail'] as const,
  detail: (publicationId: string) => [...publicationKeys.details(), publicationId] as const,
  // Chỉ số của một lần đăng đã thành công
  insights: (publicationId: string) => [...publicationKeys.detail(publicationId), 'insights'] as const
}
