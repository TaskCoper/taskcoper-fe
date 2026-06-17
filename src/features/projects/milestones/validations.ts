import type { TFunction } from 'i18next'
import z from 'zod'

export const addParentMilestoneSchema = (t: TFunction) => {
  return z
    .object({
      milestoneName: z
        .string()
        .trim()
        .min(1, t('milestone.validation.milestoneName.minLength'))
        .max(255, t('common.validation.maxLength', { max: 255 })),
      projectIdentifier: z.string().min(1, t('common.validation.required')),
      position: z.number({ message: t('common.validation.number.invalid') })
    })
    .strict()
}

export const addMilestoneSchema = (t: TFunction) => {
  return z
    .object({
      parentMilestoneIdentifier: z.string().min(1, t('common.validation.required')),
      milestoneName: z
        .string()
        .trim()
        .min(1, t('milestone.validation.milestoneName.minLength'))
        .max(255, t('common.validation.maxLength', { max: 255 })),
      projectIdentifier: z.string().min(1, t('common.validation.required')),
      position: z.number({ message: t('common.validation.number.invalid') })
    })
    .strict()
}

export const updateMilestoneSchema = (t: TFunction) => {
  return z
    .object({
      milestoneId: z.uuid(t('common.validation.uuid.invalid')),
      parentMilestoneIdentifier: z.string().nullable(),
      milestoneName: z.string().trim().min(1, t('milestone.validation.milestoneName.minLength')),
      position: z.number({ message: t('common.validation.number.invalid') })
    })
    .strict()
}

export type AddParentMilestoneFormValues = z.infer<ReturnType<typeof addParentMilestoneSchema>>
export type AddMilestoneFormValues = z.infer<ReturnType<typeof addMilestoneSchema>>
export type UpdateMilestoneFormValues = z.infer<ReturnType<typeof updateMilestoneSchema>>
