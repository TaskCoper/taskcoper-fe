import z from 'zod'

export const addParentMilestoneSchema = (t: (key: string) => string) => {
  return z
    .object({
      milestoneName: z
        .string()
        .trim()
        .min(1, t('milestone.validation.milestoneName.minLength'))
        .max(255, t('milestone.validation.milestoneName.maxLength')),
      projectId: z.uuid(t('milestone.validation.projectId.invalid')),
      position: z.number({ message: t('milestone.validation.position.invalid') })
    })
    .strict()
}

export const addMilestoneSchema = (t: (key: string) => string) => {
  return z
    .object({
      parentId: z.uuid(t('milestone.validation.parentId.invalid')),
      milestoneName: z
        .string()
        .trim()
        .min(1, t('milestone.validation.milestoneName.minLength'))
        .max(255, t('milestone.validation.milestoneName.maxLength')),
      projectId: z.uuid(t('milestone.validation.projectId.invalid')),
      position: z.number({ message: t('milestone.validation.position.invalid') })
    })
    .strict()
}

export const moveMilestoneSchema = (t: (key: string) => string) => {
  return z
    .object({
      milestoneId: z.uuid(t('milestone.validation.milestoneId.invalid')),
      parentId: z.uuid(t('milestone.validation.parentId.invalid')),
      milestoneName: z.string().trim().min(1, t('milestone.validation.milestoneName.minLength')),
      position: z.number({ message: t('milestone.validation.position.invalid') })
    })
    .strict()
}

export type AddParentMilestoneFormValues = z.infer<ReturnType<typeof addParentMilestoneSchema>>
export type AddMilestoneFormValues = z.infer<ReturnType<typeof addMilestoneSchema>>
export type MoveMilestoneFormValues = z.infer<ReturnType<typeof moveMilestoneSchema>>
