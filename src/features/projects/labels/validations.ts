import type { TFunction } from 'i18next'
import z from 'zod'

export const addProjectLabelSchema = (t: TFunction) => {
  return z
    .object({
      projectIdentifier: z.string().min(1, t('common.validation.required')),
      name: z
        .string()
        .max(255, { message: t('common.validation.maxLength', { max: 255 }) })
        .or(z.literal('')),
      color: z
        .string()
        .max(255, { message: t('common.validation.maxLength', { max: 255 }) })
        .or(z.literal(''))
    })
    .refine((data) => data.name.trim().length > 0 || data.color?.trim().length > 0, {
      message: t('task.label.validation.nameOrColorRequired'),
      path: ['name']
    })
    .strict()
}

export const updateProjectLabelSchema = (t: TFunction) => {
  return z
    .object({
      id: z.uuid({ message: t('common.validation.uuid.invalid') }),
      name: z
        .string()
        .max(255, { message: t('common.validation.maxLength', { max: 255 }) })
        .or(z.literal('')),
      color: z
        .string()
        .max(255, { message: t('common.validation.maxLength', { max: 255 }) })
        .or(z.literal(''))
    })
    .refine((data) => data.name.trim().length > 0 || data.color?.trim().length > 0, {
      message: t('task.label.validation.nameOrColorRequired'),
      path: ['name']
    })
    .strict()
}

export type AddProjectLabelFormValues = z.infer<ReturnType<typeof addProjectLabelSchema>>
export type UpdateProjectLabelFormValues = z.infer<ReturnType<typeof updateProjectLabelSchema>>
