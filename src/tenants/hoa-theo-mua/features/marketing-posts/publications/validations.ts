import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'
import { PublicationReviewAction } from './types'

export const PUBLICATION_NOTE_MAX = 500

// Đối soát một job NeedsReview. Backend bắt buộc có ghi chú cho MỌI action - đây là dòng duy
// nhất sau này còn giải thích được vì sao job bị đóng hay bị xác nhận, nên không cho bỏ trống.
export const createResolvePublicationSchema = (t: TenantT) =>
  z
    .object({
      action: z.enum([
        PublicationReviewAction.ConfirmPublished,
        PublicationReviewAction.ConfirmNotPublished,
        PublicationReviewAction.Close
      ]),
      // Chỉ nhận ID bài, chưa nhận URL rồi tự tách
      externalPostId: z
        .string()
        .trim()
        .max(200, t('common.validation.maxLength', { max: 200 })),
      note: z
        .string()
        .trim()
        .min(1, t('marketingPosts.publication.validation.noteRequired'))
        .max(PUBLICATION_NOTE_MAX, t('common.validation.maxLength', { max: PUBLICATION_NOTE_MAX }))
    })
    .refine((value) => value.action !== PublicationReviewAction.ConfirmPublished || value.externalPostId.length > 0, {
      path: ['externalPostId'],
      message: t('marketingPosts.publication.validation.externalPostIdRequired')
    })

export type ResolvePublicationForm = z.infer<ReturnType<typeof createResolvePublicationSchema>>
