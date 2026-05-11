import {
  fileAttachmentSchema,
  linkAttachmentSchema,
  updateFileAttachmentSchema,
  updateLinkAttachmentSchema
} from '@/shared/validations'
import type { TFunction } from 'i18next'
import z from 'zod'

export const updateTaskAttachmentSchema = (t: TFunction) =>
  z.discriminatedUnion('isUpload', [updateFileAttachmentSchema(t), updateLinkAttachmentSchema(t)])

export const uploadTaskAttachmentSchema = (t: TFunction) =>
  z.discriminatedUnion('isUpload', [fileAttachmentSchema(t), linkAttachmentSchema(t)])

export type UploadTaskAttachmentFormValues = z.infer<ReturnType<typeof uploadTaskAttachmentSchema>>
export type UpdateTaskAttachmentFormValues = z.infer<ReturnType<typeof updateTaskAttachmentSchema>>
