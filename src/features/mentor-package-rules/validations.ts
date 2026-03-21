import type { TFunction } from 'i18next'
import z from 'zod'

export const addMentorPackageRuleSchema = (t: TFunction) =>
  z.object({
    mentorPackageId: z.uuid(),
    no: z
      .number({ error: t('mentorPackageRule.validation.noRequired') })
      .int()
      .positive(t('mentorPackageRule.validation.noPositive')),
    totalTimeSlots: z
      .number({ error: t('mentorPackageRule.validation.totalTimeSlotsRequired') })
      .int()
      .positive(t('mentorPackageRule.validation.totalTimeSlotsPositive'))
  })

export const updateMentorPackageRuleSchema = (t: TFunction) =>
  z.object({
    id: z.uuid(),
    no: z
      .number({ error: t('mentorPackageRule.validation.noRequired') })
      .int()
      .positive(t('mentorPackageRule.validation.noPositive')),
    totalTimeSlots: z
      .number({ error: t('mentorPackageRule.validation.totalTimeSlotsRequired') })
      .int()
      .positive(t('mentorPackageRule.validation.totalTimeSlotsPositive'))
  })

export type AddMentorPackageRuleFormValues = z.infer<ReturnType<typeof addMentorPackageRuleSchema>>
export type UpdateMentorPackageRuleFormValues = z.infer<ReturnType<typeof updateMentorPackageRuleSchema>>
