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

const NAME_MAX = 255
const DESCRIPTION_MAX = 1000

const requiredText = (t: TenantT, max: number, requiredMessage: string) =>
  z.string().trim().min(1, requiredMessage).max(max, t('common.validation.maxLength', { max }))

/**
 * Per-category filter settings. Which keys are meaningful depends on the node:
 * - parent (no `parentId`): `filterByName` / `filterByPrice` — render name/price filter inputs on its page.
 * - child (has `parentId`): `isFilterable` — whether it shows up as a filter option on the client.
 * All three are kept on the form for simplicity; `toCategoryPayload` narrows to the relevant pair.
 */
export const categoryMetadataSchema = z.object({
  filterByName: z.boolean(),
  filterByPrice: z.boolean(),
  isFilterable: z.boolean()
})

export type CategoryMetadataFormValues = z.infer<typeof categoryMetadataSchema>

export const categoryProductSchema = (t: TenantT) => {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t('task.validation.name.minLength'))
        .max(NAME_MAX, t('common.validation.maxLength', { max: NAME_MAX })),
      name_En: requiredText(t, NAME_MAX, t(`${CATEGORY_FORM_PREFIX}.nameEnRequired`)),
      description: requiredText(t, DESCRIPTION_MAX, t(`${CATEGORY_FORM_PREFIX}.descriptionRequired`)),
      description_En: requiredText(t, DESCRIPTION_MAX, t(`${CATEGORY_FORM_PREFIX}.descriptionEnRequired`)),
      type: z.enum([CategoryProductType.Fix, CategoryProductType.Campaign]),
      isActive: z.boolean(),
      // ISO 8601 strings from the date picker; only meaningful for Campaign categories (§3).
      startTime: z.string().nullish(),
      endTime: z.string().nullish(),
      parentId: optionalUuid(t),
      // Sort order, managed outside this form (no field rendered); nullable when unset.
      position: z.number().int().nullable(),
      metaData: categoryMetadataSchema
    })
    .strict()
    .superRefine((values, ctx) => {
      if (values.type !== CategoryProductType.Campaign) return

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
