import type { TFunction } from 'i18next'
import z from 'zod'

const baseSchema = (t: TFunction) =>
  z.object({
    taskId: z.uuid({ message: t('task.attachment.validation.taskId.invalid') }),
    commentId: z.uuid({ message: t('task.attachment.validation.commentId.invalid') }).nullable(),
    name: z.string(),
    url: z.url({ message: t('task.attachment.validation.url.invalid') }),
    position: z.number({ message: t('task.attachment.validation.position.invalid') })
  })

const fileAttachmentSchema = (t: TFunction) =>
  baseSchema(t).extend({
    isUpload: z.literal(true),
    storageKey: z.string().min(1, { message: t('task.attachment.validation.storageKey.minLength') }),
    mimeType: z.string().min(1, { message: t('task.attachment.validation.mimeType.minLength') }),
    bytes: z
      .number()
      .int()
      .positive({ message: t('task.attachment.validation.bytes.positive') })
  })

const linkAttachmentSchema = (t: TFunction) =>
  baseSchema(t).extend({
    isUpload: z.literal(false),
    storageKey: z.string().nullable(),
    mimeType: z.string().nullable(),
    bytes: z.number().nullable()
  })

const updateBaseSchema = (t: TFunction) =>
  z.object({
    taskId: z.uuid({ message: t('task.attachment.validation.taskId.invalid') }),
    projectResourceId: z.uuid({ message: t('task.attachment.validation.projectResourceId.invalid') }),
    position: z.number({ message: t('task.attachment.validation.position.invalid') })
  })

const updateFileAttachmentSchema = (t: TFunction) =>
  updateBaseSchema(t).extend({
    isUpload: z.literal(true),
    name: z.string().min(1, { message: t('task.attachment.validation.name.minLength') }),
    url: z.url({ message: t('task.attachment.validation.url.invalid') }),
    storageKey: z.string(),
    mimeType: z.string(),
    bytes: z
      .number()
      .int()
      .positive({ message: t('task.attachment.validation.bytes.positive') })
  })

const updateLinkAttachmentSchema = (t: TFunction) =>
  updateBaseSchema(t).extend({
    isUpload: z.literal(false),
    name: z.string(),
    url: z.url({ message: t('task.attachment.validation.url.invalid') }),
    storageKey: z.string().nullable(),
    mimeType: z.string().nullable(),
    bytes: z.number().nullable()
  })

export const updateAttachmentSchema = (t: TFunction) =>
  z.discriminatedUnion('isUpload', [updateFileAttachmentSchema(t), updateLinkAttachmentSchema(t)])

export const uploadAttachmentSchema = (t: TFunction) =>
  z.discriminatedUnion('isUpload', [fileAttachmentSchema(t), linkAttachmentSchema(t)])

export type UploadAttachmentFormValues = z.infer<ReturnType<typeof uploadAttachmentSchema>>
export type UpdateAttachmentFormValues = z.infer<ReturnType<typeof updateAttachmentSchema>>
