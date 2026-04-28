import type { TFunction } from 'i18next'
import z from 'zod'

export const createSchedulesSchema = (t: TFunction) => {
  return z
    .object({
      dayOfWeeks: z.array(z.number()).min(1, t('common.validation.schedule.dayRequired')),
      startTime: z.string().min(1, t('common.validation.schedule.startTimeRequired')),
      endTime: z.string().min(1, t('common.validation.schedule.endTimeRequired')),
      isActive: z.boolean(),
      activeFrom: z.iso.datetime({ offset: true }).nullable(),
      activeTo: z.iso.datetime({ offset: true }).nullable()
    })
    .strict()
}

export const updateScheduleSchema = (t: TFunction) => {
  return z
    .object({
      dayOfWeek: z.number({ message: t('common.validation.schedule.dayRequired') }),
      startTimeUtc: z.string().min(1, t('common.validation.schedule.startTimeRequired')),
      endTimeUtc: z.string().min(1, t('common.validation.schedule.endTimeRequired')),
      isActive: z.boolean(),
      activeFrom: z.iso.datetime({ offset: true }).nullable(),
      activeTo: z.iso.datetime({ offset: true }).nullable()
    })
    .strict()
}

export type CreateSchedulesFormValues = z.infer<ReturnType<typeof createSchedulesSchema>>
export type UpdateScheduleFormValues = z.infer<ReturnType<typeof updateScheduleSchema>>
