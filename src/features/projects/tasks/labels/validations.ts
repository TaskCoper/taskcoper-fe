import type { TFunction } from 'i18next'
import z from 'zod'

export const addTaskLabelSchema = (t: TFunction) =>
  z
    .object({
      taskId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      projectTaskLabelId: z.uuid({ message: t('common.validation.uuid.invalid') })
    })
    .strict()

export type AddTaskLabelFormValues = z.infer<ReturnType<typeof addTaskLabelSchema>>
