import { MentorTitle } from '@/types/mentor-application.type'
import z from 'zod'
import { CommissionTargetModel } from './types'

export const createCommissionSchema = z
  .object({
    targetModel: z.enum(CommissionTargetModel),
    titleLevel: z.enum(MentorTitle),
    rate: z.coerce.number().min(0).max(100),
    minAmount: z.coerce.number().nonnegative(),
    maxAmount: z.coerce.number().positive(),
    isActive: z.boolean()
  })
  .strict()

export const updateCommissionSchema = createCommissionSchema
  .extend({
    commissionId: z.string(),
    isActive: z.boolean()
  })
  .strict()

export type CreateCommissionFormValues = z.infer<typeof createCommissionSchema>
export type UpdateCommissionFormValues = z.infer<typeof updateCommissionSchema>
