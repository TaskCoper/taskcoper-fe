import type { TFunction } from 'i18next'
import z from 'zod'

export const addParentMilestoneSchema = (t: TFunction) => {
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

export const addMilestoneSchema = (t: TFunction) => {
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

export const updateMilestoneSchema = (t: TFunction) => {
  return z
    .object({
      milestoneId: z.uuid(t('milestone.validation.milestoneId.invalid')),
      parentId: z.uuid(t('milestone.validation.parentId.invalid')).nullable(),
      milestoneName: z.string().trim().min(1, t('milestone.validation.milestoneName.minLength')),
      position: z.number({ message: t('milestone.validation.position.invalid') })
    })
    .strict()
}

export type AddParentMilestoneFormValues = z.infer<ReturnType<typeof addParentMilestoneSchema>>
export type AddMilestoneFormValues = z.infer<ReturnType<typeof addMilestoneSchema>>
export type UpdateMilestoneFormValues = z.infer<ReturnType<typeof updateMilestoneSchema>>
