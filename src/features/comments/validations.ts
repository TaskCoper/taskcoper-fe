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
        .max(10_000, { message: t('task.comment.validation.content.maxLength') }),
      commentResources: z.array(
        z.object({
          fileUrl: z.url({ message: t('task.comment.validation.commentResources.fileUrl.invalid') }),
          storageKey: z
            .string()
            .trim()
            .min(1, { message: t('task.comment.validation.commentResources.storageKey.minLength') }),
          fileName: z
            .string()
            .trim()
            .min(1, { message: t('task.comment.validation.commentResources.fileName.minLength') }),
          fileType: z
            .string()
            .trim()
            .min(1, { message: t('task.comment.validation.commentResources.fileType.minLength') }),
          fileSize: z.number().positive({ message: t('task.comment.validation.commentResources.fileSize.positive') }),
          fileExtension: z
            .string()
            .trim()
            .min(1, { message: t('task.comment.validation.commentResources.fileExtension.minLength') })
        })
      )
    })
    .strict()
}

export type AddTaskCommentFormValues = z.infer<ReturnType<typeof addTaskCommentSchema>>
