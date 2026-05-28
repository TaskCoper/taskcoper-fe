import type { I18nKey } from '@/lib/i18n/types'
import { getPlainTextFromHtml } from '@/shared/utils'
import type { TFunction } from 'i18next'
import z from 'zod'

export const positiveNumberString = (t: TFunction, errorKey: I18nKey) =>
  z.string().superRefine((val, ctx) => {
    if (val === '') return

    const num = Number(val)

    if (isNaN(num)) {
      ctx.addIssue({
        code: 'custom',
        message: t('validation.mustBeNumber')
      })
      return
    }

    if (num <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: t(errorKey)
      })
      return
    }
  })

export const createMentorPackageSchema = (t: TFunction) =>
  z
    .object({
      name: z.string().min(1, t('mentorPackage.validation.nameRequired')),
      // description: z.string().min(1).max(255, t('mentorPackage.validation.descriptionMax')),
      totalSessions: positiveNumberString(t, 'mentorPackage.validation.sessionsPositive'),
      price: positiveNumberString(t, 'mentorPackage.validation.pricePositive'),
      currency: z.enum(['Vnd', 'Usd'], { message: t('common.validation.enum.invalid') }),
      activationDeadlineDays: z
        .int({ message: t('common.validation.number.integer') })
        .positive(t('common.validation.number.positive')),
      usageDeadlineDays: z
        .int({ message: t('common.validation.number.integer') })
        .positive(t('common.validation.number.positive'))
    })
    .strict()

export const updateMentorPackageSchema = (t: TFunction) =>
  z
    .object({
      mentorPackageId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      name: z.string().min(1, t('mentorPackage.validation.nameRequired')),
      description: z
        .string()
        .min(1, t('common.validation.required'))
        .refine((value) => getPlainTextFromHtml(value).trim().length <= 10_000, {
          message: t('mentorPackage.validation.descriptionMax')
        }),
      coverImageUrl: z.url({ message: t('common.validation.url.invalid') }).nullable(),
      totalSessions: positiveNumberString(t, 'mentorPackage.validation.sessionsPositive'),
      price: positiveNumberString(t, 'mentorPackage.validation.pricePositive'),
      currency: z.enum(['Vnd', 'Usd'], { message: t('common.validation.enum.invalid') }),
      isActive: z.boolean(),
      isPin: z.boolean(),
      activationDeadlineDays: z
        .int({ message: t('common.validation.number.integer') })
        .positive(t('common.validation.number.positive')),
      usageDeadlineDays: z
        .int({ message: t('common.validation.number.integer') })
        .positive(t('common.validation.number.positive'))
    })
    .strict()

export type CreateMentorPackageFormValues = z.infer<ReturnType<typeof createMentorPackageSchema>>
export type UpdateMentorPackageFormValues = z.infer<ReturnType<typeof updateMentorPackageSchema>>
