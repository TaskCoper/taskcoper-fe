import type { TFunction } from 'i18next'
import z from 'zod'

const baseSchema = (t: TFunction) =>
  z
    .object({
      taskId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      commentId: z.uuid({ message: t('common.validation.uuid.invalid') }).nullable(),
      name: z.string(),
      url: z.url({ message: t('common.validation.url.invalid') }),
      position: z.number({ message: t('common.validation.number.invalid') })
    })
    .strict()

export const fileFieldsSchema = (t: TFunction) =>
  z
    .object({
      isUpload: z.literal(true),
      storageKey: z.string().min(1, { message: t('task.attachment.validation.storageKey.minLength') }),
      mimeType: z.string().min(1, { message: t('task.attachment.validation.mimeType.minLength') }),
      bytes: z
        .number()
        .int({ message: t('common.validation.number.integer') })
        .positive({ message: t('task.attachment.validation.bytes.positive') })
    })
    .strict()

const linkFieldsSchema = z
  .object({
    isUpload: z.literal(false),
    storageKey: z.string().nullable(),
    mimeType: z.string().nullable(),
    bytes: z.number().nullable()
  })
  .strict()

export const fileAttachmentSchema = (t: TFunction) => baseSchema(t).extend(fileFieldsSchema(t).shape).strict()

export const linkAttachmentSchema = (t: TFunction) => baseSchema(t).extend(linkFieldsSchema.shape).strict()

const updateBaseSchema = (t: TFunction) =>
  z
    .object({
      taskId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      projectResourceId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      position: z.number({ message: t('common.validation.number.invalid') })
    })
    .strict()

export const updateFileAttachmentSchema = (t: TFunction) =>
  updateBaseSchema(t)
    .extend({
      name: z.string().min(1, { message: t('task.attachment.validation.name.minLength') }),
      url: z.url({ message: t('common.validation.url.invalid') })
    })
    .extend(fileFieldsSchema(t).shape)
    .strict()

export const updateLinkAttachmentSchema = (t: TFunction) =>
  updateBaseSchema(t)
    .extend({
      name: z.string(),
      url: z.url({ message: t('common.validation.url.invalid') })
    })
    .extend(linkFieldsSchema.shape)
    .strict()
