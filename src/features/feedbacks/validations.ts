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
    targetType: z.enum(['MentorPackageBooking']),
    targetId: z.uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().max(10_000, t('packageFeedback.validation.noteMax')).nullable(),
    metadata: feedbackMetadataSchema(t)
  })
}

export type SubmitPackageFeedbackFormValues = z.infer<ReturnType<typeof submitPackageFeedbackSchema>>
export type FeedbackMetadata = z.infer<ReturnType<typeof feedbackMetadataSchema>>
