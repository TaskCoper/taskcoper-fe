import type { TFunction } from 'i18next'
import z from 'zod'

export const addSubtaskSchema = (t: TFunction) => {
  return z
    .object({
      taskId: z.uuid({ message: t('task.subtask.validation.taskId.invalid') }),
      name: z
        .string()
        .trim()
        .min(1, { message: t('task.subtask.validation.name.minLength') })
        .max(255, { message: t('task.subtask.validation.name.maxLength') }),
      index: z.number({ message: t('task.subtask.validation.index.invalid') }),
      parentId: z.uuid({ message: t('task.subtask.validation.parentId.invalid') }).nullable()
    })
    .strict()
}

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
      parentId: z.uuid({ message: t('task.subtask.validation.parentId.invalid') }).nullable()
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

export type AddSubtaskFormValues = z.infer<ReturnType<typeof addSubtaskSchema>>
export type UpdateSubtaskFormValues = z.infer<ReturnType<typeof updateSubtaskSchema>>
export type UpdateSubtaskStatusFormValues = z.infer<ReturnType<typeof updateSubtaskStatusSchema>>
