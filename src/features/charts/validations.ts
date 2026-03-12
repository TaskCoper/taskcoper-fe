import z from 'zod'

export const projectTaskStatisticsSchema = z.object({
  from: z.iso.datetime({ offset: true }),
  to: z.iso.datetime({ offset: true }),
  parentMilestoneId: z.uuid().nullable(),
  isViewInMonth: z.boolean()
})

export const chartDateFilterSchema = z.object({
  from: z.iso.datetime({ offset: true }),
  to: z.iso.datetime({ offset: true }),
  isViewInMonth: z.boolean()
})

export type ProjectTaskStatisticsParams = z.infer<typeof projectTaskStatisticsSchema>
export type ChartDateFilterParams = z.infer<typeof chartDateFilterSchema>
