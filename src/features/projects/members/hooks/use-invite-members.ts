import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectMemberService from '../services'
import { inviteMembersSchema, type InviteMembersFormValues } from '../validations'

export const useInviteMembers = ({ projectIdentifier }: { projectIdentifier: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const methods = useForm<InviteMembersFormValues>({
    defaultValues: {
      projectIdentifier,
      hasExpiration: false,
      expirationDate: null,
      inviteMembers: []
    },
    resolver: zodResolver(inviteMembersSchema(t))
  })

  useEffect(() => {
    if (projectIdentifier) {
      methods.reset({
        projectIdentifier,
        hasExpiration: false,
        expirationDate: null,
        inviteMembers: []
      })
    }
  }, [projectIdentifier, methods])

  const { mutate: inviteMembers, isPending: isInvitingMembers } = useMutation({
    mutationFn: projectMemberService.inviteMembers,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset()
      setOpen(false)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.members.allRequests(variables.body.projectIdentifier)
      })
    }
  })

  return { methods, inviteMembers, isInvitingMembers, open, setOpen }
}
