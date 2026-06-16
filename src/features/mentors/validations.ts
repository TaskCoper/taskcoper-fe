import type { TFunction } from 'i18next'
import z from 'zod'

export const updateMentorProfileSchema = (t: TFunction) =>
  z
    .object({
      userIdentifier: z.string().min(1, t('common.validation.required')),
      shortBio: z.string().max(255, t('common.validation.maxLength', { max: 255 })),
      description: z.string().max(10_000, t('common.validation.maxLength', { max: 10000 }))
    })
    .strict()

export type UpdateMentorProfileFormValues = z.infer<ReturnType<typeof updateMentorProfileSchema>>
