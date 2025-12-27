import z from 'zod'

export const addParentMilestoneSchema = z
  .object({
    milestoneName: z.string().min(1).max(255),
    projectId: z.uuid(),
    position: z.number().positive()
  })
  .strict()

export const addMilestoneSchema = z
  .object({
    parentId: z.uuid(),
    milestoneName: z.string().min(1).max(255),
    projectId: z.uuid(),
    position: z.number().positive()
  })
  .strict()

export type AddParentMilestoneFormValues = z.infer<typeof addParentMilestoneSchema>
export type AddMilestoneFormValues = z.infer<typeof addMilestoneSchema>
