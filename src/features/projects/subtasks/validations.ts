import type { TFunction } from 'i18next'
import z from 'zod'

export const updateSubtaskSchema = (t: TFunction) => {
  return z
    .object({
      id: z.uuid({ message: t('task.subtask.validation.taskId.invalid') }),
      name: z
        .string()
        .trim()
        .min(1, { message: t('task.subtask.validation.name.minLength') })
        .max(255, { message: t('task.subtask.validation.name.maxLength') }),
      index: z.number({ message: t('task.subtask.validation.index.invalid') }),
      parentId: z.uuid({ message: t('task.subtask.validation.parentId.invalid') }).nullable(),
      deadline: z.iso.datetime({ offset: true, message: t('task.subtask.validation.deadline.invalid') }).nullable()
    })
    .strict()
}

export const updateSubtaskStatusSchema = (t: TFunction) => {
  return z
    .object({
      id: z.uuid({ message: t('task.subtask.validation.taskId.invalid') }),
      isCompleted: z.boolean({ message: t('common.validation.required') })
    })
    .strict()
}

export const assignMemberToSubtaskSchema = (t: TFunction) => {
  return z
    .object({
      subtaskId: z.uuid({ message: t('task.subtask.validation.subtaskId.invalid') }),
      userId: z.uuid({ message: t('task.subtask.validation.userId.invalid') })
    })
    .strict()
}

export type UpdateSubtaskFormValues = z.infer<ReturnType<typeof updateSubtaskSchema>>
export type UpdateSubtaskStatusFormValues = z.infer<ReturnType<typeof updateSubtaskStatusSchema>>
export type AssignMemberToSubtaskFormValues = z.infer<ReturnType<typeof assignMemberToSubtaskSchema>>
