import { getPlainTextFromHtml } from '@/shared/utils'
import type { TFunction } from 'i18next'
import z from 'zod'

export const addTaskCommentSchema = (t: TFunction) => {
  return z
    .object({
      taskId: z.uuid({ message: t('task.comment.validation.taskId.invalid') }),
      content: z
        .string()
        .trim()
        .min(1, { message: t('task.comment.validation.content.minLength') })
        .refine((value) => getPlainTextFromHtml(value).trim().length <= 10_000, {
          message: t('task.comment.validation.content.maxLength')
        }),
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

export const updateTaskCommentSchema = (t: TFunction) => {
  return z
    .object({
      taskId: z.uuid({ message: t('task.comment.validation.taskId.invalid') }),
      commentId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      content: z
        .string()
        .trim()
        .min(1, { message: t('task.comment.validation.content.minLength') })
        .refine((value) => getPlainTextFromHtml(value).trim().length <= 10_000, {
          message: t('task.comment.validation.content.maxLength')
        }),
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

export type AddTaskCommentFormValues = z.infer<ReturnType<typeof addTaskCommentSchema>>
export type UpdateTaskCommentFormValues = z.infer<ReturnType<typeof updateTaskCommentSchema>>
