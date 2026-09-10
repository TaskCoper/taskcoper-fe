import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'
import { CardTemplateType } from './types'

export const CARD_TEMPLATE_NAME_MAX_LENGTH = 100
export const CARD_TEMPLATE_DESCRIPTION_MAX_LENGTH = 200
export const CARD_TEMPLATE_IMAGE_MAX_SIZE = 10 * 1024 * 1024
export const CARD_TEMPLATE_NAME_MAX_WORDS = 20

const ACCEPTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg'])

export const createCardTemplateSchema = (t: TenantT) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t('cardTemplates.form.validation.nameRequired'))
      .max(CARD_TEMPLATE_NAME_MAX_LENGTH, t('common.validation.maxLength', { max: CARD_TEMPLATE_NAME_MAX_LENGTH })),
    description: z
      .string()
      .trim()
      .max(
        CARD_TEMPLATE_DESCRIPTION_MAX_LENGTH,
        t('common.validation.maxLength', { max: CARD_TEMPLATE_DESCRIPTION_MAX_LENGTH })
      ),
    templateType: z.enum(CardTemplateType),
    imageFile: z
      .custom<File>((value) => value instanceof File, {
        message: t('cardTemplates.form.validation.imageRequired')
      })
      .refine((file) => ACCEPTED_IMAGE_TYPES.has(file.type), {
        message: t('cardTemplates.form.validation.imageType')
      })
      .refine((file) => file.size <= CARD_TEMPLATE_IMAGE_MAX_SIZE, {
        message: t('cardTemplates.form.validation.imageSize')
      })
  })

export type CreateCardTemplateFormValues = z.infer<ReturnType<typeof createCardTemplateSchema>>

const countWords = (value: string) => value.trim().split(/\s+/u).filter(Boolean).length

export const updateCardTemplateSchema = (t: TenantT) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t('cardTemplates.form.validation.nameRequired'))
      .refine((value) => countWords(value) <= CARD_TEMPLATE_NAME_MAX_WORDS, {
        message: t('cardTemplates.form.validation.nameWords', { max: CARD_TEMPLATE_NAME_MAX_WORDS })
      }),
    description: z
      .string()
      .trim()
      .max(
        CARD_TEMPLATE_DESCRIPTION_MAX_LENGTH,
        t('common.validation.maxLength', { max: CARD_TEMPLATE_DESCRIPTION_MAX_LENGTH })
      ),
    imageFile: z
      .custom<File | null>((value) => value === null || value instanceof File)
      .refine((file) => !file || ACCEPTED_IMAGE_TYPES.has(file.type), {
        message: t('cardTemplates.form.validation.imageType')
      })
      .refine((file) => !file || file.size <= CARD_TEMPLATE_IMAGE_MAX_SIZE, {
        message: t('cardTemplates.form.validation.imageSize')
      })
  })

export type UpdateCardTemplateFormValues = z.infer<ReturnType<typeof updateCardTemplateSchema>>
