import type { TFunction } from 'i18next'
import z from 'zod'

export const updateSubtaskSchema = (t: TFunction) => {
  return z
    .object({
      id: z.uuid({ message: t('common.validation.uuid.invalid') }),
      name: z
        .string()
        .trim()
        .min(1, { message: t('task.subtask.validation.name.minLength') })
        .max(255, { message: t('common.validation.maxLength', { max: 255 }) }),
      index: z.number({ message: t('common.validation.number.invalid') }),
      parentId: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable(),
      deadline: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }).nullable()
    })
    .strict()
}

export const updateSubtaskStatusSchema = (t: TFunction) => {
  return z
    .object({
      id: z.uuid({ message: t('common.validation.uuid.invalid') }),
      isCompleted: z.boolean({ message: t('common.validation.required') })
    })
    .strict()
}

export const assignMemberToSubtaskSchema = (t: TFunction) => {
  return z
    .object({
      subtaskId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      userId: z.uuid({ message: t('common.validation.uuid.invalid') })
    })
    .strict()
}

export type UpdateSubtaskFormValues = z.infer<ReturnType<typeof updateSubtaskSchema>>
export type UpdateSubtaskStatusFormValues = z.infer<ReturnType<typeof updateSubtaskStatusSchema>>
export type AssignMemberToSubtaskFormValues = z.infer<ReturnType<typeof assignMemberToSubtaskSchema>>
