import type { TFunction } from 'i18next'
import z from 'zod'

export const bookPackageSchema = (t: TFunction) =>
  z
    .object({
      mentorPackageId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      gatewayId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      bookedByProjectId: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable(),
      voucherCode: z.string().nullable(),
      voucherIdempotencyKey: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable()
    })
    .strict()

export type BookPackageFormValues = z.infer<ReturnType<typeof bookPackageSchema>>
