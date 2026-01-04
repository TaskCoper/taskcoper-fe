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

export type AddTaskFormValues = z.infer<ReturnType<typeof addTaskSchema>>
export type MoveTaskFormValues = z.infer<ReturnType<typeof moveTaskSchema>>
