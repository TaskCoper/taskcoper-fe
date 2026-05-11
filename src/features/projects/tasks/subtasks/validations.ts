import type { TFunction } from 'i18next'
import z from 'zod'

export const addTaskSubtaskSchema = (t: TFunction) => {
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

export type AddTaskSubtaskFormValues = z.infer<ReturnType<typeof addTaskSubtaskSchema>>
