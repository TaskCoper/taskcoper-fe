import type { TFunction } from 'i18next'
import z from 'zod'

export const positiveNumberString = (t: TFunction, errorKey: string) =>
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
  z.object({
    name: z.string().min(1, t('mentorPackage.validation.nameRequired')),
    description: z.string().min(1).max(255, t('mentorPackage.validation.descriptionMax')),
    durationInMinutes: z
      .number({ error: t('mentorPackage.validation.durationPositive') })
      .positive(t('mentorPackage.validation.durationPositive')),
    totalSessions: positiveNumberString(t, 'mentorPackage.validation.sessionsPositive'),
    price: positiveNumberString(t, 'mentorPackage.validation.pricePositive'),
    currency: z.enum(['Vnd', 'Usd'])
  })

export const updateMentorPackageSchema = (t: TFunction) =>
  z.object({
    mentorPackageId: z.uuid(),
    name: z.string().min(1, t('mentorPackage.validation.nameRequired')),
    description: z.string().min(1).max(255, t('mentorPackage.validation.descriptionMax')),
    durationInMinutes: z
      .number({ error: t('mentorPackage.validation.durationPositive') })
      .positive(t('mentorPackage.validation.durationPositive')),
    totalSessions: positiveNumberString(t, 'mentorPackage.validation.sessionsPositive'),
    price: positiveNumberString(t, 'mentorPackage.validation.pricePositive'),
    currency: z.enum(['Vnd', 'Usd']),
    isActive: z.boolean(),
    sortOrder: z.number().int()
  })

export type CreateMentorPackageFormValues = z.infer<ReturnType<typeof createMentorPackageSchema>>
export type UpdateMentorPackageFormValues = z.infer<ReturnType<typeof updateMentorPackageSchema>>
