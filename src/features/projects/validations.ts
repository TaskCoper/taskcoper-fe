import { SectionKey } from '@/types/project-permission.type'
import { RevenueType } from '@/types/project.type'
import type { TFunction } from 'i18next'
import z from 'zod'

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

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

export const memberSchema = (t: TFunction) => {
  return z
    .object({
      userId: z.uuid(t('project.inviteMembers.validation.users.userId.invalid')),
      email: z.email(t('project.inviteMembers.validation.users.email.invalid')).trim(),
      fullName: z.string().trim().min(1, t('project.inviteMembers.validation.users.fullName.required')),
      avatar: z.url({ message: t('project.inviteMembers.validation.users.avatar.invalid') }).nullable(),
      roleIds: z.array(z.uuid()).min(1),
      inviteExpireDate: z.iso
        .datetime({ message: t('project.inviteMembers.validation.users.inviteExpireDate.invalid') })
        .nullable()
    })
    .strict()
}

export const domainSchema = (t: TFunction) => {
  return z
    .object({
      id: z.string().regex(UUID_REGEX, t('project.updateProjectDomains.validation.domainIds.invalid')),
      name: z.string().trim().min(1, t('project.updateProjectDomains.validation.domainIds.minLength'))
    })
    .strict()
}

export const inviteMembersSchema = (t: TFunction) => {
  return z
    .object({
      projectIdentifier: z.string().min(1),
      hasExpiration: z.boolean(),
      expirationDate: z.iso.datetime().nullable(),
      inviteMembers: z.array(memberSchema(t)).min(1, t('project.inviteMembers.validation.inviteMembers.minLength'))
    })
    .refine((data) => !data.hasExpiration || data.expirationDate, {
      message: t('project.inviteMembers.validation.dateRequired'),
      path: ['expirationDate']
    })
    .refine(
      (data) => {
        if (!data.hasExpiration || !data.expirationDate) return true

        const selectedDate = new Date(data.expirationDate)
        const now = new Date()

        return selectedDate > now
      },
      {
        message: t('project.inviteMembers.validation.dateInvalid'),
        path: ['expirationDate']
      }
    )
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
        .max(10_000, t('project.updateProject.validation.description.maxLength'))
        .nullable()
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

export const addProjectRevenueSchema = (t: TFunction) => {
  return z.object({
    name: z.string().trim().min(1, t('project.addProjectRevenue.validation.name.minLength')),
    amount: z.number().min(1, t('project.addProjectRevenue.validation.amount.min')),
    type: z.enum([RevenueType.CashIn, RevenueType.CashOut]),
    note: z.string().trim().max(255, t('project.addProjectRevenue.validation.note.maxLength')),
    labelIds: z.array(z.uuid()),
    projectIdentifier: z.string().min(1)
  })
}

export const updateProjectRevenueSchema = (t: TFunction) => {
  return z.object({
    projectTransactionId: z.uuid(),
    projectIdentifier: z.string().min(1),
    name: z.string().trim().min(1, t('project.updateProjectRevenue.validation.name.minLength')),
    amount: z.number().min(1, t('project.updateProjectRevenue.validation.amount.min')),
    type: z.enum([RevenueType.CashIn, RevenueType.CashOut]),
    note: z.string().trim().max(255, t('project.updateProjectRevenue.validation.note.maxLength')),
    labelIds: z.array(z.uuid())
  })
}

export const taskSectionExtensionsSchema = z.object({
  canUpdate: z.object({
    canMoveTask: z.boolean(),
    canMoveMilestone: z.boolean(),
    canToggleTaskStatus: z.boolean()
  })
})

export const storageSectionExtensionsSchema = z.object({
  canRead: z.object({
    canDownload: z.boolean()
  })
})

export const updateProjectRoleSchema = (t: TFunction) => {
  return z.object({
    projectIdentifier: z.string().min(1),
    roleId: z.uuid(),
    name: z.string().trim().min(1, t('project.updateProjectRole.validation.name.minLength')),
    description: z.string().trim().max(255, t('project.updateProjectRole.validation.description.maxLength')),
    isDefault: z.boolean(),
    permissions: z.array(
      z.object({
        sectionKey: z.enum(SectionKey),
        canRead: z.boolean(),
        canWrite: z.boolean(),
        canUpdate: z.boolean(),
        canDelete: z.boolean(),
        extensions: z.union([taskSectionExtensionsSchema, storageSectionExtensionsSchema, z.string()]).optional()
      })
    )
  })
}

export const addProjectRoleSchema = (t: TFunction) => {
  return z.object({
    projectIdentifier: z.string().min(1, t('project.addProjectRole.validation.projectIdentifier.minLength')),
    name: z
      .string()
      .trim()
      .min(1, t('project.addProjectRole.validation.name.minLength'))
      .max(255, t('project.addProjectRole.validation.name.maxLength')),
    description: z.string().trim().max(255, t('project.addProjectRole.validation.description.maxLength')),
    isDefault: z.boolean(),
    permissions: z.array(
      z.object({
        sectionKey: z.enum(SectionKey),
        canRead: z.boolean(),
        canWrite: z.boolean(),
        canUpdate: z.boolean(),
        canDelete: z.boolean(),
        extensions: z.union([taskSectionExtensionsSchema, storageSectionExtensionsSchema]).nullable()
      })
    )
  })
}

export type CreateProjectFormValues = z.infer<ReturnType<typeof createProjectSchema>>
export type InviteMembersFormValues = z.infer<ReturnType<typeof inviteMembersSchema>>
export type InviteMemberItem = z.infer<ReturnType<typeof memberSchema>>
export type DomainItem = z.infer<ReturnType<typeof domainSchema>>
export type UpdateProjectFormValues = z.infer<ReturnType<typeof updateProjectSchema>>
export type AddProjectRevenueFormValues = z.infer<ReturnType<typeof addProjectRevenueSchema>>
export type UpdateProjectRevenueFormValues = z.infer<ReturnType<typeof updateProjectRevenueSchema>>
export type UpdateProjectRoleFormValues = z.infer<ReturnType<typeof updateProjectRoleSchema>>
export type TaskSectionExtensionsFormValues = z.infer<typeof taskSectionExtensionsSchema>
export type StorageSectionExtensionsFormValues = z.infer<typeof storageSectionExtensionsSchema>
export type AddProjectRoleFormValues = z.infer<ReturnType<typeof addProjectRoleSchema>>
