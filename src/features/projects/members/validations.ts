import type { TFunction } from 'i18next'
import z from 'zod'

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

export type InviteMembersFormValues = z.infer<ReturnType<typeof inviteMembersSchema>>
export type InviteMemberItem = z.infer<ReturnType<typeof memberSchema>>
