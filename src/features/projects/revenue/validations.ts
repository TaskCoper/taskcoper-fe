import type { TFunction } from 'i18next'
import z from 'zod'
import { RevenueType } from './types'

export const addProjectRevenueSchema = (t: TFunction) => {
  return z
    .object({
      name: z.string().trim().min(1, t('project.addProjectRevenue.validation.name.minLength')),
      amount: z.number().min(1, t('project.addProjectRevenue.validation.amount.min')),
      type: z.enum([RevenueType.Revenue, RevenueType.Expense]),
      note: z.string().trim().max(255, t('project.addProjectRevenue.validation.note.maxLength')),
      labelIds: z.array(z.uuid()),
      projectIdentifier: z.string().min(1)
    })
    .strict()
}

export const updateProjectRevenueSchema = (t: TFunction) => {
  return z
    .object({
      projectTransactionId: z.uuid(),
      projectIdentifier: z.string().min(1),
      name: z.string().trim().min(1, t('project.updateProjectRevenue.validation.name.minLength')),
      amount: z.number().min(1, t('project.updateProjectRevenue.validation.amount.min')),
      type: z.enum([RevenueType.Revenue, RevenueType.Expense]),
      note: z.string().trim().max(255, t('project.updateProjectRevenue.validation.note.maxLength')),
      labelIds: z.array(z.uuid())
    })
    .strict()
}

export const addProjectRevenueLabelSchema = (t: TFunction) => {
  return z
    .object({
      projectIdentifier: z.string().min(1),
      name: z
        .string()
        .max(255, { message: t('task.label.validation.name.maxLength') })
        .or(z.literal('')),
      color: z
        .string()
        .max(255, { message: t('task.label.validation.color.maxLength') })
        .or(z.literal(''))
    })
    .strict()
}

export const updateProjectRevenueLabelSchema = (t: TFunction) => {
  return z
    .object({
      id: z.uuid({ message: t('task.label.validation.id.invalid') }),
      name: z
        .string()
        .max(255, { message: t('task.label.validation.name.maxLength') })
        .or(z.literal('')),
      color: z
        .string()
        .max(255, { message: t('task.label.validation.color.maxLength') })
        .or(z.literal('')),
      projectIdentifier: z.string().min(1)
    })
    .strict()
}

export type AddProjectRevenueFormValues = z.infer<ReturnType<typeof addProjectRevenueSchema>>
export type UpdateProjectRevenueFormValues = z.infer<ReturnType<typeof updateProjectRevenueSchema>>
export type AddProjectRevenueLabelFormValues = z.infer<ReturnType<typeof addProjectRevenueLabelSchema>>
export type UpdateProjectRevenueLabelFormValues = z.infer<ReturnType<typeof updateProjectRevenueLabelSchema>>
