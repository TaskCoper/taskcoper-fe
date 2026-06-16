import type { TFunction } from 'i18next'
import z from 'zod'

export const createCompanyAddressSchema = (t: TFunction) => {
  const requiredString = (max: number) =>
    z
      .string({ message: t('common.validation.required') })
      .trim()
      .min(1, t('common.validation.required'))
      .max(max)

  const requiredCode = z
    .number({ message: t('common.validation.required') })
    .int(t('common.validation.number.integer'))
    .positive(t('common.validation.number.positive'))

  return z.object({
    addressLine: requiredString(255),
    ward: requiredString(100),
    city: requiredString(100),
    cityCode: requiredCode,
    wardCode: requiredCode,
    country: requiredString(100),
    latitude: z
      .number({ message: t('common.validation.number.invalid') })
      .min(-90, t('common.validation.number.invalid'))
      .max(90, t('common.validation.number.invalid')),
    longitude: z
      .number({ message: t('common.validation.number.invalid') })
      .min(-180, t('common.validation.number.invalid'))
      .max(180, t('common.validation.number.invalid')),
    mapId: z.string().min(1, t('common.validation.required'))
  })
}

export const updateCompanyAddressSchema = (t: TFunction) => createCompanyAddressSchema(t)

export type CreateCompanyAddressFormValues = z.infer<ReturnType<typeof createCompanyAddressSchema>>
export type UpdateCompanyAddressFormValues = z.infer<ReturnType<typeof updateCompanyAddressSchema>>
