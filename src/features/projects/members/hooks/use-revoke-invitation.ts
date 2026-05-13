import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import projectMemberService from '../services'

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: revokeInvitation, isPending: isRevokeInvitation } = useMutation({
    mutationFn: projectMemberService.revokeInvitation,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.members.allRequests(variables.projectIdentifier)
      })
    }
  })

  return { revokeInvitation, isRevokeInvitation }
}
