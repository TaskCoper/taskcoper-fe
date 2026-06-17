import { getPlainTextFromHtml } from '@/shared/utils'
import type { TFunction } from 'i18next'
import z from 'zod'

const ratingValue = (t: TFunction) =>
  z.enum(['1', '2', '3', '4'] as const, {
    message: t('packageFeedback.validation.ratingRequired')
  })

const feedbackMetadataSchema = (t: TFunction) => {
  return z
    .object({
      punctuality: ratingValue(t),
      preparation: ratingValue(t),
      quality: ratingValue(t),
      communication: ratingValue(t),
      actionability: ratingValue(t)
    })
    .strict()
}

export const submitPackageFeedbackSchema = (t: TFunction) => {
  return z.object({
    targetType: z.enum(['MentorPackageBooking'], { message: t('common.validation.enum.invalid') }),
    targetId: z.uuid({ message: t('common.validation.uuid.invalid') }),
    rating: z
      .number()
      .min(1, t('packageFeedback.validation.ratingRequired'))
      .max(5, t('packageFeedback.validation.ratingRequired')),
    comment: z
      .string()
      .nullable()
      .refine((value) => getPlainTextFromHtml(value).trim().length <= 10_000, {
        message: t('common.validation.maxLength', { max: 10000 })
      }),
    metadata: feedbackMetadataSchema(t)
  })
}

export type SubmitPackageFeedbackFormValues = z.infer<ReturnType<typeof submitPackageFeedbackSchema>>
export type FeedbackMetadata = z.infer<ReturnType<typeof feedbackMetadataSchema>>
