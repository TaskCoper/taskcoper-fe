import type { TFunction } from 'i18next'
import z from 'zod'
import { PackageRequestStatus } from './types'

export const bookPackageSchema = (t: TFunction) =>
  z
    .object({
      mentorPackageId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      gatewayId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      bookedByProjectId: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable(),
      voucherCode: z.string().nullable(),
      voucherIdempotencyKey: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable(),
      purchaseRequestId: z.uuid({ message: t('common.validation.uuid.invalid') })
    })
    .strict()

export const requestPackageSchema = (t: TFunction) => {
  return z.object({
    mentorPackageId: z.uuid({ message: t('common.validation.uuid.invalid') }),
    bookedByProjectId: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable(),
    problemStatement: z
      .string()
      .min(1, { message: t('common.validation.string.min', { min: 1 }) })
      .max(20_000, { message: t('common.validation.string.max', { max: 20000 }) })
  })
}

export const reviewPackageSchema = (t: TFunction) => {
  return z
    .object({
      requestId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      status: z.enum([PackageRequestStatus.Approved, PackageRequestStatus.Rejected]),
      mentorResponseNote: z
        .string()
        .max(255, { message: t('common.validation.string.max', { max: 255 }) })
        .nullable()
    })
    .superRefine((value, ctx) => {
      if (value.status === PackageRequestStatus.Rejected && !value.mentorResponseNote?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['mentorResponseNote'],
          message: t('common.validation.required')
        })
      }
    })
}

export type BookPackageFormValues = z.infer<ReturnType<typeof bookPackageSchema>>
export type RequestPackageFormValues = z.infer<ReturnType<typeof requestPackageSchema>>
export type ReviewPackageFormValues = z.infer<ReturnType<typeof reviewPackageSchema>>
