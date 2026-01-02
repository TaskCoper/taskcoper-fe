import z from 'zod'

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export const createProjectSchema = (t: (key: string) => string) => {
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
        .array(z.string())
        .min(1, t('project.createProject.validation.domainIds.minLength'))
        .refine((ids) => ids.every((id) => UUID_REGEX.test(id)), {
          message: t('project.createProject.validation.domainIds.invalid')
        })
    })
    .strict()
  // .refine(
  //   (data) => {
  //     if (!data.startDate || !data.endDate) return true

  //     const start = new Date(data.startDate)
  //     const end = new Date(data.endDate)

  //     return end > start
  //   },
  //   {
  //     message: t('project.createProject.validation.endDate.mustBeGreater'),
  //     path: ['endDate']
  //   }
  // )
}

export const memberSchema = z.object({
  userId: z.uuid(),
  email: z.email().trim(),
  fullName: z.string().trim(),
  avatar: z.url().nullable(),
  isEditor: z.boolean(),
  inviteExpireDate: z.iso.datetime().nullable()
})

export const inviteMembersSchema = (t: (key: string) => string) => {
  return z
    .object({
      projectId: z.uuid(),
      hasExpiration: z.boolean(),
      expirationDate: z.iso.datetime().nullable(),
      inviteMembers: z.array(memberSchema).min(1, t('project.inviteMembers.validation.inviteMembers.minLength'))
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
}

export const updateProjectSchema = (t: (key: string) => string) => {
  return z.object({
    projectId: z.uuid(),
    name: z
      .string()
      .trim()
      .min(1, t('project.updateProject.validation.name.minLength'))
      .max(255, t('project.updateProject.validation.name.maxLength')),
    description: z.string().trim().max(10_000, t('project.updateProject.validation.description.maxLength')).nullable(),
    startDate: z.iso.datetime({ offset: true }).nullable(),
    endDate: z.iso.datetime({ offset: true }).nullable(),
    coverImage: z.url().trim().nullable(),
    logoImage: z.url().trim().nullable(),
    teamSize: z.number().positive().nullable(),
    teamContact: z.string().trim().nullable(),
    teamEmail: z.email().trim().nullable(),
    domainIds: z
      .array(z.string())
      .min(1, t('project.updateProject.validation.domainIds.minLength'))
      .refine((ids) => ids.every((id) => UUID_REGEX.test(id)), {
        message: t('project.updateProject.validation.domainIds.invalid')
      }),
    schoolSubject: z.string().trim().nullable()
  })
}

export type CreateProjectFormValues = z.infer<ReturnType<typeof createProjectSchema>>
export type InviteMembersFormValues = z.infer<ReturnType<typeof inviteMembersSchema>>
export type InviteMemberItem = z.infer<typeof memberSchema>
export type UpdateProjectFormValues = z.infer<ReturnType<typeof updateProjectSchema>>
