import type { TFunction } from 'i18next'
import z from 'zod'

export const createCompanyAddressSchema = (t: TFunction) => {
  return z.object({
    addressLine: z
      .string()
      .min(1, t('common.validation.required'))
      .max(255, t('common.validation.maxLength', { max: 255 })),
    ward: z.string(),
    city: z.string(),
    cityCode: z.number({ message: t('common.validation.number.invalid') }),
    wardCode: z.number({ message: t('common.validation.number.invalid') }),
    country: z.string(),
    latitude: z.number({ message: t('common.validation.number.invalid') }),
    longitude: z.number({ message: t('common.validation.number.invalid') }),
    mapId: z.string()
  })
}

export const updateCompanyAddressSchema = (t: TFunction) => createCompanyAddressSchema(t)

export type CreateCompanyAddressFormValues = z.infer<ReturnType<typeof createCompanyAddressSchema>>
export type UpdateCompanyAddressFormValues = z.infer<ReturnType<typeof updateCompanyAddressSchema>>
