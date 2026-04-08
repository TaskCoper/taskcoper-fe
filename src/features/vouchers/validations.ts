import { DiscountType, Scope, TargetType } from '@/types/voucher.type'
import type { TFunction } from 'i18next'
import z from 'zod'

export const createVoucherSchema = (t: TFunction) => {
  return z
    .object({
      code: z.string().min(5, t('common.validation.minLength.5')).max(25, t('common.validation.maxLength.25')),
      name: z.string().min(1, t('common.validation.required')).max(255, t('common.validation.maxLength.255')),
      description: z.string().max(255, t('common.validation.maxLength.255')).nullable(),
      discountType: z.enum(DiscountType),
      discountValue: z
        .number({ error: t('common.validation.number.positive') })
        .min(1, t('common.validation.number.positive')),
      startsAtUtc: z.iso.datetime({ error: t('common.validation.date.required') }),
      endsAtUtc: z.iso.datetime({ error: t('common.validation.date.required') }),
      scope: z.enum(Scope),
      totalUsageLimit: z
        .number({ error: t('common.validation.number.positive') })
        .min(1, t('common.validation.number.positive')),
      usageLimitPerUser: z
        .number({ error: t('common.validation.number.positive') })
        .min(1, t('common.validation.number.positive')),
      isStackable: z.boolean(),
      targets: z.array(
        z.object({
          targetType: z.enum(TargetType),
          targetId: z.string()
        })
      )
    })
    .superRefine((data, ctx) => {
      // Validate discount value based on type
      if (data.discountType === DiscountType.Percentage && data.discountValue > 100) {
        ctx.addIssue({
          code: 'custom',
          message: t('voucher.validation.discountPercentMax'),
          path: ['discountValue']
        })
      }

      // Validate dates
      if (data.endsAtUtc <= data.startsAtUtc) {
        ctx.addIssue({
          code: 'custom',
          message: t('common.validation.date.mustBeGreater'),
          path: ['endsAtUtc']
        })
      }

      // Validate targets if scope is specific
      if (data.scope === Scope.SpecificTargets && (!data.targets || data.targets.length === 0)) {
        ctx.addIssue({
          code: 'custom',
          message: t('voucher.validation.targetsRequired'),
          path: ['targets']
        })
      }
    })
}

export const updateVoucherSchema = (t: TFunction) => {
  return z.object({
    voucherId: z.uuid(),
    name: z.string().min(1, t('common.validation.required')).max(255, t('common.validation.maxLength.255')),
    description: z.string().max(255, t('common.validation.maxLength.255')).nullable(),
    startsAtUtc: z.iso.datetime({ offset: true, error: t('common.validation.date.required') }),
    endsAtUtc: z.iso.datetime({ offset: true, error: t('common.validation.date.required') }),
    isActive: z.boolean(),
    totalUsageLimit: z.number().min(1, t('common.validation.number.positive')),
    usageLimitPerUser: z.number().min(1, t('common.validation.number.positive')),
    isStackable: z.boolean()
  })
}

export const addVoucherTargetsSchema = z.object({
  voucherId: z.uuid(),
  targets: z.array(
    z.object({
      targetType: z.enum(TargetType),
      targetName: z.string(),
      targetId: z.uuid()
    })
  )
})

export type CreateVoucherFormValues = z.infer<ReturnType<typeof createVoucherSchema>>
export type UpdateVoucherFormValues = z.infer<ReturnType<typeof updateVoucherSchema>>
export type AddVoucherTargetsFormValues = z.infer<typeof addVoucherTargetsSchema>
