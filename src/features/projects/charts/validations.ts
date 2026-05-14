import type { TFunction } from 'i18next'
import z from 'zod'

export const projectTaskStatisticsSchema = (t: TFunction) =>
  z
    .object({
      from: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }),
      to: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }),
      parentMilestoneId: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable(),
      isViewInMonth: z.boolean()
    })
    .strict()

export const chartDateFilterSchema = (t: TFunction) =>
  z
    .object({
      from: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }),
      to: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }),
      isViewInMonth: z.boolean()
    })
    .strict()

export type ProjectTaskStatisticsParams = z.infer<ReturnType<typeof projectTaskStatisticsSchema>>
export type ChartDateFilterParams = z.infer<ReturnType<typeof chartDateFilterSchema>>
