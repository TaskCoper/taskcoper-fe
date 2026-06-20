import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'

const optionalUuid = (t: TenantT) =>
  z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.uuid().safeParse(value).success, {
      message: t('common.validation.uuid.invalid')
    })

export const addCategorySchema = (t: TenantT) => {
  return z
    .object({
      title: z
        .string()
        .trim()
        .min(1, t('task.validation.name.minLength'))
        .max(255, t('common.validation.maxLength', { max: 255 })),
      parentId: optionalUuid(t)
    })
    .strict()
}
export type AddCategoryFormValues = z.infer<ReturnType<typeof addCategorySchema>>
