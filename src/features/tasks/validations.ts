import z from 'zod'

export const addTaskSchema = z
  .object({
    milestoneId: z.uuid(),
    name: z.string().min(1).max(255),
    position: z.number().positive()
  })
  .strict()

export type AddTaskFormValues = z.infer<typeof addTaskSchema>
