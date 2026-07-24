import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'
import { CategoryProductType } from './types'

const CATEGORY_FORM_PREFIX = 'productCategories.form' as const

const optionalUuid = (t: TenantT) =>
  z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.uuid().safeParse(value).success, {
      message: t('common.validation.uuid.invalid')
    })

export const categoryProductSchema = (t: TenantT) => {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t('task.validation.name.minLength'))
        .max(255, t('common.validation.maxLength', { max: 255 })),
      type: z.enum([CategoryProductType.Fix, CategoryProductType.Campaign]),
      isActive: z.boolean(),
      // ISO 8601 strings from the date picker; only meaningful for Campaign categories (§3).
      startTime: z.string().nullish(),
      endTime: z.string().nullish(),
      parentId: optionalUuid(t)
    })
    .strict()
    .superRefine((values, ctx) => {
      if (values.type !== CategoryProductType.Campaign) return

      // A campaign category with no window makes no UX sense — enforce client-side (§4.3, §6.4).
      if (!values.startTime) {
        ctx.addIssue({
          code: 'custom',
          path: ['startTime'],
          message: t(`${CATEGORY_FORM_PREFIX}.startTimeRequired`)
        })
      }
      if (!values.endTime) {
        ctx.addIssue({
          code: 'custom',
          path: ['endTime'],
          message: t(`${CATEGORY_FORM_PREFIX}.endTimeRequired`)
        })
      }
      if (values.startTime && values.endTime && new Date(values.endTime) <= new Date(values.startTime)) {
        ctx.addIssue({
          code: 'custom',
          path: ['endTime'],
          message: t(`${CATEGORY_FORM_PREFIX}.endTimeAfterStart`)
        })
      }
    })
}

export type CategoryProductFormValues = z.infer<ReturnType<typeof categoryProductSchema>>
