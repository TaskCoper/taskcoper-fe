import type { TFunction } from 'i18next'
import z from 'zod'

export const addTaskSubtaskSchema = (t: TFunction) => {
  return z
    .object({
      taskId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      name: z
        .string()
        .trim()
        .min(1, { message: t('task.subtask.validation.name.minLength') })
        .max(255, { message: t('common.validation.maxLength', { max: 255 }) }),
      index: z.number({ message: t('common.validation.number.invalid') }),
      parentId: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable()
    })
    .strict()
}

export type AddTaskSubtaskFormValues = z.infer<ReturnType<typeof addTaskSubtaskSchema>>
