import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'

const numericString = (t: TenantT, { positive = false }: { positive?: boolean } = {}) =>
  z
    .string()
    .min(1, t('common.validation.required'))
    .refine((v) => v.trim() !== '' && !Number.isNaN(Number(v)), {
      message: t('common.validation.number.invalid')
    })
    .refine((v) => (positive ? Number(v) > 0 : Number(v) >= 0), {
      message: positive ? t('common.validation.number.positive') : t('common.validation.number.nonNegative')
    })

export const createJobDescriptionSchema = (t: TenantT) =>
  z
    .object({
      title: z
        .string()
        .min(1, t('common.validation.required'))
        .max(255, t('common.validation.maxLength', { max: 255 })),
      location: z
        .string()
        .min(1, t('common.validation.required'))
        .max(255, t('common.validation.maxLength', { max: 255 })),
      avatarUrl: z.url({ message: t('common.validation.url.invalid') }),
      coverImageUrl: z.url({ message: t('common.validation.url.invalid') }),
      minExperienceYears: numericString(t),
      maxExperienceYears: numericString(t, { positive: true }),
      employmentType: z.enum(['0', '1'], { message: t('common.validation.enum.invalid') }),
      salaryMin: numericString(t),
      salaryMax: numericString(t, { positive: true }),
      salaryNegotiable: z.boolean(),
      description: z
        .string()
        .min(10, t('common.validation.minLength', { min: 10 }))
        .max(10_000, t('common.validation.maxLength', { max: 10_000 })),
      status: z.enum(['0', '1'], { message: t('common.validation.enum.invalid') }),
      openings: numericString(t, { positive: true })
    })
    .superRefine((data, ctx) => {
      if (Number(data.maxExperienceYears) < Number(data.minExperienceYears)) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxExperienceYears'],
          message: t('recruitment.jobs.form.validation.experience.maxLessThanMin')
        })
      }

      if (!data.salaryNegotiable && Number(data.salaryMax) < Number(data.salaryMin)) {
        ctx.addIssue({
          code: 'custom',
          path: ['salaryMax'],
          message: t('recruitment.jobs.form.validation.salary.maxLessThanMin')
        })
      }
    })

export type CreateJobDescriptionFormValues = z.infer<ReturnType<typeof createJobDescriptionSchema>>
