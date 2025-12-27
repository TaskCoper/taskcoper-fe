import z from 'zod'

export const addTaskSchema = z
  .object({
    milestoneId: z.uuid(),
    name: z.string().min(1).max(255),
    position: z.number()
  })
  .strict()

export const moveTaskSchema = z
  .object({
    id: z.uuid(),
    targetMilestoneId: z.uuid(),
    targetPosition: z.number()
  })
  .strict()

export type AddTaskFormValues = z.infer<typeof addTaskSchema>
export type MoveTaskFormValues = z.infer<typeof moveTaskSchema>
