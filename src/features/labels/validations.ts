import type { TFunction } from 'i18next'
import z from 'zod'

export const addProjectLabelSchema = (t: TFunction) => {
  return z.object({
    projectId: z.uuid({ message: t('task.label.validation.projectId.invalid') }),
    name: z
      .string()
      .min(1, { message: t('task.label.validation.name.minLength') })
      .max(255, { message: t('task.label.validation.name.maxLength') }),
    color: z
      .string()
      .max(255, { message: t('task.label.validation.color.maxLength') })
      .or(z.literal(''))
  })
}

export const updateProjectLabelSchema = (t: TFunction) => {
  return z.object({
    id: z.uuid({ message: t('task.label.validation.id.invalid') }),
    name: z
      .string()
      .min(1, { message: t('task.label.validation.name.minLength') })
      .max(255, { message: t('task.label.validation.name.maxLength') }),
    color: z
      .string()
      .max(255, { message: t('task.label.validation.color.maxLength') })
      .or(z.literal(''))
  })
}

export type AddProjectLabelFormValues = z.infer<ReturnType<typeof addProjectLabelSchema>>
export type UpdateProjectLabelFormValues = z.infer<ReturnType<typeof updateProjectLabelSchema>>
