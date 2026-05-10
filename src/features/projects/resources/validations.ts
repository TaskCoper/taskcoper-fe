import { fileFieldsSchema } from '@/shared/validations'
import type { TFunction } from 'i18next'
import z from 'zod'

export const uploadProjectAttachmentSchema = (t: TFunction) =>
  z
    .object({
      projectIdentifier: z.string().min(1),
      name: z.string(),
      url: z.string()
    })
    .extend(fileFieldsSchema(t).shape)
    .strict()

export type UploadProjectAttachmentFormValues = z.infer<ReturnType<typeof uploadProjectAttachmentSchema>>
