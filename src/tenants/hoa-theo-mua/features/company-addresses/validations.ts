import type { TFunction } from 'i18next'
import z from 'zod'

const VN_PHONE_REGEX = /^0\d{9,10}$/

export const createCompanyAddressSchema = (t: TFunction) => {
  return z.object({
    fullName: z
      .string()
      .min(2, t('common.validation.minLength', { min: 2 }))
      .max(255, t('common.validation.maxLength', { max: 255 })),
    phone: z
      .string()
      .min(1, t('common.validation.required'))
      .regex(VN_PHONE_REGEX, t('companyAddress.validation.phoneNumber.invalid')),
    remarks: z.string().max(255, t('common.validation.maxLength', { max: 255 })),
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
