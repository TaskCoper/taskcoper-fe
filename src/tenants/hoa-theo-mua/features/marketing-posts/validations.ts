import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'
import { MarketingPostImageRatio } from './image-ratios'
import { getInvalidHashtagTokens } from './hashtags'
import { MarketingPostChannel } from './types'

export const MARKETING_POST_TITLE_MAX = 120
export const MARKETING_POST_CONTENT_MAX = 2000
export const MARKETING_POST_HASHTAGS_MAX = 300
export const MARKETING_POST_IMAGE_MAX = 20
// Backend chặn tối đa 12 cặp ảnh nguồn × tỉ lệ cho cả một lần sinh
export const MARKETING_POST_MAX_IMAGE_PAIRS = 12

// Kế hoạch tháng chỉ là bảng chữ, 10MB là dư. BE chốt giới hạn khác thì sửa ở đây.
export const MARKETING_PLAN_FILE_MAX_SIZE = 10 * 1024 * 1024
export const MARKETING_PLAN_FILE_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
}
export const MARKETING_PLAN_TEMPLATE_URL = '/templates/marketing-posts-bulk-v3.xlsx'

// Bước 1 chỉ lo nội dung gốc. Nền tảng tách sang bước 2 vì bài gốc lưu được trước khi
// biết sẽ đăng lên đâu - đúng như backend tách POST /posts và POST /posts/{id}/generate.
export const createMarketingPostSchema = (t: TenantT) => {
  return z
    .object({
      title: z
        .string()
        .trim()
        .min(1, t('marketingPosts.validation.title.required'))
        .max(MARKETING_POST_TITLE_MAX, t('common.validation.maxLength', { max: MARKETING_POST_TITLE_MAX })),
      content: z
        .string()
        .trim()
        .min(1, t('marketingPosts.validation.content.required'))
        .max(MARKETING_POST_CONTENT_MAX, t('common.validation.maxLength', { max: MARKETING_POST_CONTENT_MAX })),
      hashtags: z
        .string()
        .trim()
        .max(MARKETING_POST_HASHTAGS_MAX, t('common.validation.maxLength', { max: MARKETING_POST_HASHTAGS_MAX }))
        // Chữ thiếu '#' sẽ không thành hashtag, phải báo chứ không nuốt lặng lẽ
        .refine((value) => getInvalidHashtagTokens(value).length === 0, {
          message: t('marketingPosts.validation.hashtags.missingHash')
        }),
      // Backend bắt buộc có ảnh nguồn: ít nhất 1, nhiều nhất 20
      images: z
        .array(
          z.object({
            url: z.string(),
            name: z.string(),
            width: z.number().nullable(),
            height: z.number().nullable()
          })
        )
        .max(MARKETING_POST_IMAGE_MAX, t('marketingPosts.validation.images.max', { max: MARKETING_POST_IMAGE_MAX }))
    })
    .strict()
}

export type CreateMarketingPostFormValues = z.infer<ReturnType<typeof createMarketingPostSchema>>

// Bước 2 chốt hai thứ: đăng lên đâu, và mỗi ảnh gốc cần cắt ra những tỉ lệ nào.
export const selectMarketingChannelsSchema = (t: TenantT) => {
  return z
    .object({
      channels: z.array(z.enum(MarketingPostChannel)).min(1, t('marketingPosts.validation.channels.required')),
      images: z
        .array(
          z.object({
            id: z.string(),
            ratios: z.array(z.enum(MarketingPostImageRatio))
          })
        )
        // Ảnh không chọn tỉ lệ nào thì AI không biết xuất ra cỡ gì, chặn ngay ở form
        .refine((images) => images.every((image) => image.ratios.length > 0), {
          message: t('marketingPosts.validation.images.ratioRequired')
        })
    })
    .strict()
}

export const countMarketingImagePairs = (images: { ratios: MarketingPostImageRatio[] }[]) =>
  images.reduce((total, image) => total + image.ratios.length, 0)

// Chọn quá 12 cặp không còn bị chặn: frontend tự chia thành nhiều lượt sinh nối tiếp nhau
export const countMarketingImageBatches = (images: { ratios: MarketingPostImageRatio[] }[]) =>
  Math.ceil(countMarketingImagePairs(images) / MARKETING_POST_MAX_IMAGE_PAIRS)

export type SelectMarketingChannelsFormValues = z.infer<ReturnType<typeof selectMarketingChannelsSchema>>

export const updateMarketingPostSchema = (t: TenantT) => {
  return z
    .object({
      content: z
        .string()
        .trim()
        .min(1, t('marketingPosts.validation.content.required'))
        .max(MARKETING_POST_CONTENT_MAX, t('common.validation.maxLength', { max: MARKETING_POST_CONTENT_MAX })),
      // Nhập thành một dòng, tách ở bước submit - người dùng gõ nhanh hơn là thêm/xoá từng chip
      hashtags: z
        .string()
        .trim()
        .max(MARKETING_POST_HASHTAGS_MAX, t('common.validation.maxLength', { max: MARKETING_POST_HASHTAGS_MAX }))
        // Chữ thiếu '#' sẽ không thành hashtag, phải báo chứ không nuốt lặng lẽ
        .refine((value) => getInvalidHashtagTokens(value).length === 0, {
          message: t('marketingPosts.validation.hashtags.missingHash')
        })
    })
    .strict()
}

export type UpdateMarketingPostFormValues = z.infer<ReturnType<typeof updateMarketingPostSchema>>
