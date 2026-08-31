import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'

export const MAX_FLORAL_MOCKUP_IMAGE_SIZE = 10 * 1024 * 1024
export const FLORAL_MOCKUP_IMAGE_TYPES = ['image/png', 'image/jpeg']

export interface CreateFloralMockupFormValues {
  name: string
  description: string
  imageFile: File | null
}

export const createFloralMockupSchema = (t: TenantT) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t('floralMockups.form.validation.nameRequired'))
      .max(50, t('floralMockups.form.validation.nameLength')),
    description: z.string().trim().max(200, t('floralMockups.form.validation.descriptionLength')),
    imageFile: z
      .custom<File | null>((value) => value instanceof File, {
        message: t('floralMockups.form.validation.imageRequired')
      })
      .refine((file) => !file || FLORAL_MOCKUP_IMAGE_TYPES.includes(file.type), {
        message: t('floralMockups.form.validation.imageType')
      })
      .refine((file) => !file || file.size <= MAX_FLORAL_MOCKUP_IMAGE_SIZE, {
        message: t('floralMockups.form.validation.imageSize')
      })
  })
