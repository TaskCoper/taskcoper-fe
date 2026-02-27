import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useRespondToInvitation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: respondToInvitation, isPending: isRespondingToInvitation } = useMutation({
    mutationFn: projectService.respondToInvitation,
    onSuccess: (message, variables) => {
      toast.success(message)
      if (variables.isAccepted) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      }
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })

      if (variables.isAccepted) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.allMy })
      }
    }
  })

  return { respondToInvitation, isRespondingToInvitation }
}
