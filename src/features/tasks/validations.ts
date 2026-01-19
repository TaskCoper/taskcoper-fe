import type { TFunction } from 'i18next'
import z from 'zod'

export const addTaskSchema = (t: TFunction) => {
  return z
    .object({
      milestoneId: z.uuid(t('task.validation.milestoneId.invalid')),
      name: z.string().trim().min(1, t('task.validation.name.minLength')).max(255, t('task.validation.name.maxLength')),
      position: z.number({ message: t('task.validation.position.invalid') })
    })
    .strict()
}

export const moveTaskSchema = (t: TFunction) => {
  return z
    .object({
      id: z.uuid(t('task.validation.id.invalid')),
      targetMilestoneId: z.uuid(t('task.validation.targetMilestoneId.invalid')),
      targetPosition: z.number({ message: t('task.validation.targetPosition.invalid') })
    })
    .strict()
}

export const updateTaskSchema = (t: TFunction) => {
  return z
    .object({
      id: z.uuid({ message: t('task.validation.id.invalid') }),
      name: z
        .string()
        .trim()
        .min(1, { message: t('task.validation.name.minLength') })
        .max(255, { message: t('task.validation.name.maxLength') }),
      description: z
        .string()
        .trim()
        .max(10_000, { message: t('common.validation.maxLength.10000') })
        .nullable(),
      position: z.number({ message: t('task.validation.position.invalid') }),
      startDate: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }).nullable(),
      endDate: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }).nullable(),
      targetMilestoneId: z.uuid({ message: t('task.validation.targetMilestoneId.invalid') }),
      announceBeforeMinutes: z
        .number()
        .positive({ message: t('common.validation.number.positive') })
        .nullable()
    })
    .strict()
}

export const addTaskLabelSchema = z
  .object({
    taskId: z.uuid(),
    projectTaskLabelId: z.uuid()
  })
  .strict()

export type AddTaskFormValues = z.infer<ReturnType<typeof addTaskSchema>>
export type MoveTaskFormValues = z.infer<ReturnType<typeof moveTaskSchema>>
export type UpdateTaskFormValues = z.infer<ReturnType<typeof updateTaskSchema>>
export type AddTaskLabelFormValues = z.infer<typeof addTaskLabelSchema>
