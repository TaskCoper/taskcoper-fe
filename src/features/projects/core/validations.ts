import { getPlainTextFromHtml } from '@/shared/utils'
import type { TFunction } from 'i18next'
import z from 'zod'

export const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export const domainSchema = (t: TFunction) => {
  return z
    .object({
      id: z.string().regex(UUID_REGEX, t('project.updateProjectDomains.validation.domainIds.invalid')),
      name: z.string().trim().min(1, t('project.updateProjectDomains.validation.domainIds.minLength'))
    })
    .strict()
}

export const createProjectSchema = (t: TFunction) => {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t('project.createProject.validation.name.minLength'))
        .max(255, t('project.createProject.validation.name.maxLength')),
      // description: z.string().max(255, t('project.createProject.validation.description.maxLength')),
      // startDate: z.iso.datetime({ message: t('project.createProject.validation.startDate.invalid') }),
      // endDate: z.iso.datetime({ message: t('project.createProject.validation.endDate.invalid') }),
      domainIds: z
        .array(z.string().regex(UUID_REGEX, t('project.updateProjectDomains.validation.domainIds.invalid')))
        .min(1, t('project.updateProjectDomains.validation.domainIds.minLength'))
    })
    .strict()
}

export const updateProjectSchema = (t: TFunction) => {
  return z
    .object({
      projectId: z.uuid(t('project.updateProject.validation.projectId.invalid')),
      name: z
        .string()
        .trim()
        .min(1, t('project.updateProject.validation.name.minLength'))
        .max(255, t('project.updateProject.validation.name.maxLength')),
      description: z
        .string()
        .trim()
        .nullable()
        .refine((value) => getPlainTextFromHtml(value).trim().length <= 10_000, {
          message: t('project.updateProject.validation.description.maxLength')
        })
        .transform((val) => (val === '' ? null : val)),
      startDate: z.iso
        .datetime({ offset: true, message: t('project.updateProject.validation.startDate.invalid') })
        .nullable(),
      endDate: z.iso
        .datetime({ offset: true, message: t('project.updateProject.validation.endDate.invalid') })
        .nullable(),
      coverImage: z
        .url({ message: t('project.updateProject.validation.coverImage.invalid') })
        .trim()
        .nullable(),
      logoImage: z
        .url({ message: t('project.updateProject.validation.logoImage.invalid') })
        .trim()
        .nullable(),
      teamSize: z
        .string()
        .trim()
        .max(255, t('project.updateProject.validation.teamSize.maxLength'))
        .nullable()
        .transform((val) => (val === '' ? null : val)),
      teamContact: z
        .string()
        .trim()
        .max(255, t('project.updateProject.validation.teamContact.maxLength'))
        .nullable()
        .transform((val) => (val === '' ? null : val)),
      teamEmail: z
        .string()
        .trim()
        .nullable()
        .transform((v) => (v === '' ? null : v))
        .refine((v) => v === null || z.email().safeParse(v).success, {
          error: t('common.validation.email.invalid')
        }),
      domainIds: z.array(domainSchema(t)).min(1, t('project.updateProjectDomains.validation.domainIds.minLength')),
      schoolSubject: z
        .string()
        .trim()
        .max(255, t('project.updateProject.validation.schoolSubject.maxLength'))
        .nullable()
        .transform((val) => (val === '' ? null : val))
    })
    .refine(
      (data) => {
        if (!data.startDate || !data.endDate) return true

        const start = new Date(data.startDate)
        const end = new Date(data.endDate)

        return end > start
      },
      {
        message: t('project.createProject.validation.endDate.mustBeGreater'),
        path: ['endDate']
      }
    )
    .strict()
}

export type CreateProjectFormValues = z.infer<ReturnType<typeof createProjectSchema>>
export type UpdateProjectFormValues = z.infer<ReturnType<typeof updateProjectSchema>>
export type DomainItem = z.infer<ReturnType<typeof domainSchema>>
