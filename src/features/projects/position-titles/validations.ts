import type { TFunction } from 'i18next'
import z from 'zod'

export const addProjectPositionTitleSchema = (t: TFunction) =>
  z
    .object({
      projectIdentifier: z.string().min(1, t('common.validation.required')),
      name: z
        .string()
        .trim()
        .min(1, t('common.validation.required'))
        .max(255, t('common.validation.maxLength', { max: 255 })),
      description: z
        .string()
        .trim()
        .max(255, t('common.validation.maxLength', { max: 255 })),
      color: z
        .string()
        .trim()
        .max(255, t('common.validation.maxLength', { max: 255 }))
    })
    .strict()

export const updateProjectPositionTitleSchema = (t: TFunction) =>
  addProjectPositionTitleSchema(t)
    .extend({
      titleId: z.uuid({ message: t('common.validation.uuid.invalid') })
    })
    .strict()

export type AddProjectPositionTitleFormValues = z.infer<ReturnType<typeof addProjectPositionTitleSchema>>
export type UpdateProjectPositionTitleFormValues = z.infer<ReturnType<typeof updateProjectPositionTitleSchema>>
