import type { GetMarketingReportParams } from './reports/types'
import type { GetMarketingPostsParams } from './types'

export const marketingPostKeys = {
  all: ['marketing-posts'] as const,
  lists: () => [...marketingPostKeys.all, 'list'] as const,
  list: (params: GetMarketingPostsParams) => [...marketingPostKeys.lists(), params] as const,
  details: () => [...marketingPostKeys.all, 'detail'] as const,
  detail: (id: string) => [...marketingPostKeys.details(), id] as const,
  // Lịch sử nội dung theo từng nền tảng, tách khỏi detail vì detail chỉ có bản chốt
  contentVersions: (id: string, platform: string) =>
    [...marketingPostKeys.detail(id), 'content-versions', platform] as const,
  // Kho ảnh của cả bài, gom theo cặp ảnh nguồn × tỉ lệ
  imageHistory: (id: string) => [...marketingPostKeys.detail(id), 'image-history'] as const,
  official: (id: string, platform: string) => [...marketingPostKeys.detail(id), 'official', platform] as const,
  // Key của mutation sinh bài từ bước 2 - đọc trạng thái chạy thẳng từ mutation cache
  selectionGenerate: (id: string) => [...marketingPostKeys.detail(id), 'selection-generate'] as const,
  reports: () => [...marketingPostKeys.all, 'report'] as const,
  report: (params: GetMarketingReportParams) => [...marketingPostKeys.reports(), params] as const
}
