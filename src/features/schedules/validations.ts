import type { TFunction } from 'i18next'
import z from 'zod'

export const createScheduleSchema = (t: TFunction) => {
  return z.object({
    dayOfWeeks: z.array(z.number()).min(1, t('common.validation.schedule.dayRequired')),
    startTime: z.string().min(1, t('common.validation.schedule.startTimeRequired')),
    endTime: z.string().min(1, t('common.validation.schedule.endTimeRequired')),
    activeFrom: z.iso.datetime({ offset: true }).nullable(),
    activeTo: z.iso.datetime({ offset: true }).nullable()
  })
}

export type CreateScheduleFormValues = z.infer<ReturnType<typeof createScheduleSchema>>
