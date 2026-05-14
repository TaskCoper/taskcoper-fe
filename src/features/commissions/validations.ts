import { MentorTitle } from '@/features/mentor-applications/types'
import type { TFunction } from 'i18next'
import z from 'zod'
import { CommissionTargetModel } from './types'

export const createCommissionSchema = (t: TFunction) =>
  z
    .object({
      targetModel: z.enum(CommissionTargetModel, { message: t('common.validation.enum.invalid') }),
      titleLevel: z.enum(MentorTitle, { message: t('common.validation.enum.invalid') }),
      rate: z
        .number({ error: t('common.validation.number.invalid') })
        .min(0, t('common.validation.number.nonNegative'))
        .max(100, t('common.validation.number.max100')),
      minAmount: z
        .number({ error: t('common.validation.number.invalid') })
        .nonnegative(t('common.validation.number.nonNegative')),
      maxAmount: z
        .number({ error: t('common.validation.number.invalid') })
        .positive(t('common.validation.number.positive')),
      isActive: z.boolean()
    })
    .strict()

export const updateCommissionSchema = (t: TFunction) =>
  createCommissionSchema(t)
    .extend({
      commissionId: z.string().min(1, t('common.validation.required')),
      isActive: z.boolean()
    })
    .strict()

export type CreateCommissionFormValues = z.infer<ReturnType<typeof createCommissionSchema>>
export type UpdateCommissionFormValues = z.infer<ReturnType<typeof updateCommissionSchema>>
