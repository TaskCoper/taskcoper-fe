import type { TFunction } from 'i18next'
import z from 'zod'
import { SectionKey } from './types'

export const taskSectionExtensionsSchema = z
  .object({
    canUpdate: z
      .object({
        canMoveTask: z.boolean(),
        canMoveMilestone: z.boolean(),
        canToggleTaskStatus: z.boolean()
      })
      .strict()
  })
  .strict()

export const storageSectionExtensionsSchema = z
  .object({
    canRead: z
      .object({
        canDownload: z.boolean()
      })
      .strict()
  })
  .strict()

export const calendarSectionExtensionsSchema = z
  .object({
    canRead: z
      .object({
        canViewMeetingDetails: z.boolean()
      })
      .strict(),
    canWrite: z
      .object({
        canPurchasePackage: z.boolean(),
        canBookMeeting: z.boolean()
      })
      .strict(),
    canUpdate: z
      .object({
        canRescheduleMeeting: z.boolean()
      })
      .strict(),
    canDelete: z
      .object({
        canCancelMeeting: z.boolean()
      })
      .strict()
  })
  .strict()

export const updateProjectRoleSchema = (t: TFunction) => {
  return z
    .object({
      projectIdentifier: z.string().min(1, t('project.addProjectRole.validation.projectIdentifier.minLength')),
      roleId: z.uuid({ message: t('common.validation.uuid.invalid') }),
      name: z.string().trim().min(1, t('project.updateProjectRole.validation.name.minLength')),
      description: z
        .string()
        .trim()
        .max(255, t('common.validation.maxLength', { max: 255 })),
      isDefault: z.boolean(),
      permissions: z.array(
        z
          .object({
            sectionKey: z.enum(SectionKey, { message: t('common.validation.enum.invalid') }),
            canRead: z.boolean(),
            canWrite: z.boolean(),
            canUpdate: z.boolean(),
            canDelete: z.boolean(),
            extensions: z
              .union([taskSectionExtensionsSchema, storageSectionExtensionsSchema, calendarSectionExtensionsSchema])
              .optional()
          })
          .strict()
      )
    })
    .strict()
}

export const addProjectRoleSchema = (t: TFunction) => {
  return z
    .object({
      projectIdentifier: z.string().min(1, t('project.addProjectRole.validation.projectIdentifier.minLength')),
      name: z
        .string()
        .trim()
        .min(1, t('project.addProjectRole.validation.name.minLength'))
        .max(255, t('common.validation.maxLength', { max: 255 })),
      description: z
        .string()
        .trim()
        .max(255, t('common.validation.maxLength', { max: 255 })),
      isDefault: z.boolean(),
      permissions: z
        .array(
          z
            .object({
              sectionKey: z.enum(SectionKey, { message: t('common.validation.enum.invalid') }),
              canRead: z.boolean(),
              canWrite: z.boolean(),
              canUpdate: z.boolean(),
              canDelete: z.boolean(),
              extensions: z
                .union([taskSectionExtensionsSchema, storageSectionExtensionsSchema, calendarSectionExtensionsSchema])
                .nullable()
            })
            .strict()
        )
        .min(1, t('project.addProjectRole.validation.permissions.minLength'))
    })
    .strict()
}

export type UpdateProjectRoleFormValues = z.infer<ReturnType<typeof updateProjectRoleSchema>>
export type AddProjectRoleFormValues = z.infer<ReturnType<typeof addProjectRoleSchema>>

// Permissions
export type TaskSectionExtensionsFormValues = z.infer<typeof taskSectionExtensionsSchema>
export type StorageSectionExtensionsFormValues = z.infer<typeof storageSectionExtensionsSchema>
export type CalendarSectionExtensionsFormValues = z.infer<typeof calendarSectionExtensionsSchema>
