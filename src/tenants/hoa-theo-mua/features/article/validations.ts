export const ARTICLE_COVER_ASPECT = 16 / 10

import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'

const categoryFormItem = () => z.object({ id: z.string(), name: z.string() })

export const addArticleSchema = (t: TenantT) => {
  return z
    .object({
      title: z
        .string()
        .trim()
        .min(1, { message: t('article.validation.title.required') })
        .max(255, { message: t('common.validation.maxLength', { max: 255 }) }),
      description: z
        .string()
        .trim()
        .min(1, { message: t('article.validation.description.required') }),
      pictureUrl: z.url({ message: t('common.validation.url.invalid') }),
      status: z
        .number({ message: t('common.validation.number.invalid') })
        .int({ message: t('common.validation.number.integer') }),
      categories: z.array(categoryFormItem()).min(1, { message: t('article.validation.category.required') })
    })
    .strict()
}

export type AddArticleForm = z.infer<ReturnType<typeof addArticleSchema>>
export type CategoryFormItem = z.infer<ReturnType<typeof categoryFormItem>>
