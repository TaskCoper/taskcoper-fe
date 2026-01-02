import z from 'zod'

export const addParentMilestoneSchema = z
  .object({
    milestoneName: z.string().trim().min(1).max(255),
    projectId: z.uuid(),
    position: z.number()
  })
  .strict()

export const addMilestoneSchema = z
  .object({
    parentId: z.uuid(),
    milestoneName: z.string().trim().min(1).max(255),
    projectId: z.uuid(),
    position: z.number()
  })
  .strict()

export const moveMilestoneSchema = z
  .object({
    milestoneId: z.uuid(),
    parentId: z.uuid(),
    milestoneName: z.string().trim(),
    position: z.number()
  })
  .strict()

export type AddParentMilestoneFormValues = z.infer<typeof addParentMilestoneSchema>
export type AddMilestoneFormValues = z.infer<typeof addMilestoneSchema>
export type MoveMilestoneFormValues = z.infer<typeof moveMilestoneSchema>
