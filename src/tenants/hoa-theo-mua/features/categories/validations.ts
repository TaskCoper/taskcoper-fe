import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'
import { CategoryProductPage, CategoryProductType } from './types'

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
 * - parent (no `parentId`): `filterByName` / `filterByPrice` / `rows` / `cols` — render name/price filter
 *   inputs and control the product grid layout on its page.
 * - child (has `parentId`): `isFilterable` — whether it shows up as a filter option on the client.
 * All keys are kept on the form for simplicity; `toCategoryPayload` narrows to the relevant subset.
 */
export const categoryMetadataSchema = (t: TenantT) =>
  z.object({
    filterByName: z.boolean(),
    filterByPrice: z.boolean(),
    isFilterable: z.boolean(),
    rows: z
      .number({ message: t('common.validation.number.invalid') })
      .int({ message: t('common.validation.number.integer') })
      .min(1, t('common.validation.number.min', { min: 1 })),
    cols: z
      .number({ message: t('common.validation.number.invalid') })
      .int({ message: t('common.validation.number.integer') })
      .min(1, t('common.validation.number.min', { min: 1 }))
  })

export type CategoryMetadataFormValues = z.infer<ReturnType<typeof categoryMetadataSchema>>

const categoryPageSchema = z.enum(CategoryProductPage)

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
      // ISO 8601 strings from the date picker; only meaningful for Campaign categories.
      startTime: z.string().nullish(),
      endTime: z.string().nullish(),
      parentId: optionalUuid(t),
      // Sort order, managed outside this form (no field rendered); nullable when unset.
      position: z.number().nullable(),
      metaData: categoryMetadataSchema(t),
      page: z.array(categoryPageSchema)
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

const categorySchema = z.object({
  categoryProductId: z.uuid(),
  isPin: z.boolean(),
  position: z.number()
})

export const updateProductCategoriesSchema = z.object({
  productId: z.uuid(),
  categoryProductLists: z.array(categorySchema)
})

export type CategoryProductFormValues = z.infer<ReturnType<typeof categoryProductSchema>>
export type UpdateProductCategoriesFormValues = z.infer<typeof updateProductCategoriesSchema>
