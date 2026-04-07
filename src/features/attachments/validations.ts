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

const fileFieldsSchema = (t: TFunction) =>
  z.object({
    isUpload: z.literal(true),
    storageKey: z.string().min(1, { message: t('task.attachment.validation.storageKey.minLength') }),
    mimeType: z.string().min(1, { message: t('task.attachment.validation.mimeType.minLength') }),
    bytes: z
      .number()
      .int()
      .positive({ message: t('task.attachment.validation.bytes.positive') })
  })

const linkFieldsSchema = z.object({
  isUpload: z.literal(false),
  storageKey: z.string().nullable(),
  mimeType: z.string().nullable(),
  bytes: z.number().nullable()
})

const fileAttachmentSchema = (t: TFunction) => baseSchema(t).extend(fileFieldsSchema(t).shape)

const linkAttachmentSchema = (t: TFunction) => baseSchema(t).extend(linkFieldsSchema.shape)

const updateBaseSchema = (t: TFunction) =>
  z.object({
    taskId: z.uuid({ message: t('task.attachment.validation.taskId.invalid') }),
    projectResourceId: z.uuid({ message: t('task.attachment.validation.projectResourceId.invalid') }),
    position: z.number({ message: t('task.attachment.validation.position.invalid') })
  })

const updateFileAttachmentSchema = (t: TFunction) =>
  updateBaseSchema(t)
    .extend({
      name: z.string().min(1, { message: t('task.attachment.validation.name.minLength') }),
      url: z.url({ message: t('task.attachment.validation.url.invalid') })
    })
    .extend(fileFieldsSchema(t).shape)

const updateLinkAttachmentSchema = (t: TFunction) =>
  updateBaseSchema(t)
    .extend({
      name: z.string(),
      url: z.url({ message: t('task.attachment.validation.url.invalid') })
    })
    .extend(linkFieldsSchema.shape)

export const updateAttachmentSchema = (t: TFunction) =>
  z.discriminatedUnion('isUpload', [updateFileAttachmentSchema(t), updateLinkAttachmentSchema(t)])

export const uploadAttachmentSchema = (t: TFunction) =>
  z.discriminatedUnion('isUpload', [fileAttachmentSchema(t), linkAttachmentSchema(t)])

export const uploadProjectAttachmentSchema = (t: TFunction) =>
  z
    .object({
      projectIdentifier: z.string(),
      name: z.string(),
      url: z.string()
    })
    .extend(fileFieldsSchema(t).shape)

export type UploadAttachmentFormValues = z.infer<ReturnType<typeof uploadAttachmentSchema>>
export type UpdateAttachmentFormValues = z.infer<ReturnType<typeof updateAttachmentSchema>>
export type UploadProjectAttachmentFormValues = z.infer<ReturnType<typeof uploadProjectAttachmentSchema>>
