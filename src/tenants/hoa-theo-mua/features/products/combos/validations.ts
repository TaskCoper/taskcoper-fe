import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'

export const createComboFactorSchema = (t: TenantT) => {
  const message = t('products.detail.comboSpecification.factorHint')

  return z.object({
    factor: z.number({ message }).finite(message).positive(message).nullable()
  })
}

export const createComboMaterialsSchema = (t: TenantT) => {
  const message = t('products.detail.comboSpecification.quantityHint')

  return z.object({
    items: z.array(
      z.object({
        matId: z.string(),
        quantity: z.number({ message }).finite(message).positive(message),
        isCore: z.boolean(),
        isActive: z.boolean()
      })
    )
  })
}

export type ComboFactorFormValues = z.infer<ReturnType<typeof createComboFactorSchema>>
export type ComboMaterialsFormValues = z.infer<ReturnType<typeof createComboMaterialsSchema>>
