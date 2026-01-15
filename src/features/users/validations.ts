import type { TFunction } from 'i18next'
import z from 'zod'

const regex = /(?:\+84|0084|0)[235789][0-9]{1,2}[0-9]{7}(?:[^\d]+|$)/g

export const updateMeSchema = (t: TFunction) => {
  return z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, t('auth.signUp.validation.firstName.minLength'))
        .max(20, t('auth.signUp.validation.firstName.maxLength')),
      lastName: z
        .string()
        .trim()
        .min(1, t('auth.signUp.validation.lastName.minLength'))
        .max(20, t('auth.signUp.validation.lastName.maxLength')),
      email: z.email(t('common.validation.email.invalid')).trim(),
      avatar: z
        .url()
        .trim()
        .nullable()
        .transform((val) => (val === '' ? null : val)),
      phoneNumber: z
        .string()
        .trim()
        .refine((val) => val === '' || regex.test(val), {
          message: t('auth.signUp.validation.phoneNumber.invalid')
        })
        .nullable()
        .transform((val) => (val === '' ? null : val)),
      address: z
        .string()
        .trim()
        .nullable()
        .transform((val) => (val === '' ? null : val)),
      city: z
        .string()
        .trim()
        .nullable()
        .transform((val) => (val === '' ? null : val)),
      cityCode: z.number().positive().or(z.literal(-1)),
      state: z
        .string()
        .trim()
        .nullable()
        .transform((val) => (val === '' ? null : val)),
      wardCode: z.number().positive().or(z.literal(-1))
    })
    .strict()
}

export const changePasswordSchema = (t: TFunction) => {
  return z
    .object({
      currentPassword: z.string().trim().min(8, t('auth.signIn.validation.password.minLength')),
      newPassword: z
        .string()
        .trim()
        .min(8, t('auth.signUp.validation.password.minLength'))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          t('auth.signUp.validation.password.strong')
        )
    })
    .strict()
}

export const forgotPasswordSchema = (t: TFunction) => {
  return z
    .object({
      email: z.email(t('common.validation.email.invalid')).trim()
    })
    .strict()
}

export const verifyCodeSchema = (t: TFunction) => {
  return z
    .object({
      email: z.email(t('common.validation.email.invalid')).trim(),
      code: z.string().trim().min(6, t('auth.signIn.validation.code.minLength'))
    })
    .strict()
}

export const resetPasswordSchema = (t: TFunction) => {
  return z
    .object({
      newPassword: z
        .string()
        .trim()
        .min(8, t('auth.signUp.validation.password.minLength'))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          t('auth.signUp.validation.password.strong')
        )
    })
    .strict()
}

export type UpdateMeFormValues = z.infer<ReturnType<typeof updateMeSchema>>
export type ChangePasswordFormValues = z.infer<ReturnType<typeof changePasswordSchema>>
export type ForgotPasswordFormValues = z.infer<ReturnType<typeof forgotPasswordSchema>>
export type VerifyCodeFormValues = z.infer<ReturnType<typeof verifyCodeSchema>>
export type ResetPasswordFormValues = z.infer<ReturnType<typeof resetPasswordSchema>>
