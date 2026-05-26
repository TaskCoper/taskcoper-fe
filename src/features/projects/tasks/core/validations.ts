import { getPlainTextFromHtml } from '@/shared/utils'
import type { TFunction } from 'i18next'
import z from 'zod'
import { TaskPriority } from './types'

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
        .nullable()
        .refine((value) => getPlainTextFromHtml(value).trim().length <= 10_000, {
          message: t('common.validation.maxLength.10000')
        }),
      isCompleted: z.boolean(),
      estimatedPoints: z
        .number()
        .positive({ message: t('common.validation.number.positive') })
        .nullable(),
      backgroundImage: z.url({ message: t('common.validation.url.invalid') }).nullable(),
      position: z.number({ message: t('task.validation.position.invalid') }),
      startDate: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }).nullable(),
      endDate: z.iso.datetime({ offset: true, message: t('common.validation.date.invalid') }).nullable(),
      targetMilestoneId: z.uuid({ message: t('task.validation.targetMilestoneId.invalid') }),
      priority: z.enum(TaskPriority, { message: t('common.validation.enum.invalid') }).nullable(),
      announceBeforeMinutes: z
        .number()
        .positive({ message: t('common.validation.number.positive') })
        .nullable(),
      mentionUsers: z.array(
        z
          .object({
            userId: z.uuid({ message: t('common.validation.uuid.invalid') }),
            mentionId: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable()
          })
          .strict()
      )
    })
    .strict()
}

export type AddTaskFormValues = z.infer<ReturnType<typeof addTaskSchema>>
export type MoveTaskFormValues = z.infer<ReturnType<typeof moveTaskSchema>>
export type UpdateTaskFormValues = z.infer<ReturnType<typeof updateTaskSchema>>
