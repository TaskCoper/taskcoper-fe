import type { TFunction } from 'i18next'
import z from 'zod'

export const addMentorPackageRuleSchema = (t: TFunction) =>
  z
    .object({
      mentorPackageId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      no: z
        .number({ error: t('mentorPackageRule.validation.noRequired') })
        .int({ message: t('common.validation.number.integer') })
        .positive(t('common.validation.number.positive')),
      totalTimeSlots: z
        .number({ error: t('mentorPackageRule.validation.totalTimeSlotsRequired') })
        .int({ message: t('common.validation.number.integer') })
        .positive(t('common.validation.number.positive'))
    })
    .strict()

export const updateMentorPackageRuleSchema = (t: TFunction) =>
  z
    .object({
      id: z.uuid({ message: t('common.validation.uuid.invalid') }),
      no: z
        .number({ error: t('mentorPackageRule.validation.noRequired') })
        .int({ message: t('common.validation.number.integer') })
        .positive(t('common.validation.number.positive')),
      totalTimeSlots: z
        .number({ error: t('mentorPackageRule.validation.totalTimeSlotsRequired') })
        .int({ message: t('common.validation.number.integer') })
        .positive(t('common.validation.number.positive'))
    })
    .strict()

export type AddMentorPackageRuleFormValues = z.infer<ReturnType<typeof addMentorPackageRuleSchema>>
export type UpdateMentorPackageRuleFormValues = z.infer<ReturnType<typeof updateMentorPackageRuleSchema>>
