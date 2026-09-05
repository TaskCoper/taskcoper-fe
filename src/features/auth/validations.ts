import type { TFunction } from 'i18next'
import { z } from 'zod'

// export const createSignUpSchema = (t: TFunction) => {
//   return z
//     .object({
//       email: z.email(t('common.validation.email.invalid')).trim(),
//       password: z
//         .string()
//         .trim()
//         .min(8, t('auth.signUp.validation.password.minLength'))
//         .regex(
//           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
//           t('auth.signUp.validation.password.strong')
//         ),
//       firstName: z
//         .string()
//         .trim()
//         .min(1, t('auth.signUp.validation.firstName.minLength'))
//         .max(20, t('auth.signUp.validation.firstName.maxLength')),
//       lastName: z
//         .string()
//         .trim()
//         .min(1, t('auth.signUp.validation.lastName.minLength'))
//         .max(20, t('auth.signUp.validation.lastName.maxLength')),
//       role: z.enum(['0', '1'], { message: t('auth.signUp.validation.role.invalid') })
//     })
//     .strict()
// }

export const createVerifyEmailSchema = (t: TFunction) => {
  return z
    .object({
      email: z.email(t('common.validation.email.invalid')).trim(),
      code: z
        .string()
        .trim()
        .min(6, t('auth.signUp.validation.code.minLength'))
        .max(6, t('auth.signUp.validation.code.maxLength'))
    })
    .strict()
}

export const createSignInSchema = (t: TFunction) => {
  return z
    .object({
      email: z.email(t('common.validation.email.invalid')).trim(),
      password: z.string().trim().min(8, t('auth.signIn.validation.password.minLength'))
    })
    .strict()
}

// export type SignUpFormValues = z.infer<ReturnType<typeof createSignUpSchema>>
export type VerifyEmailFormValues = z.infer<ReturnType<typeof createVerifyEmailSchema>>
export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>
