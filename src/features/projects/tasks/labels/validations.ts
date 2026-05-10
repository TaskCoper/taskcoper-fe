import z from 'zod'

export const addTaskLabelSchema = z
  .object({
    taskId: z.uuid(),
    projectTaskLabelId: z.uuid()
  })
  .strict()

export type AddTaskLabelFormValues = z.infer<typeof addTaskLabelSchema>
