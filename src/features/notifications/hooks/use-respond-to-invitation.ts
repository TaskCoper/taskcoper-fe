import projectService from '@/services/project.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useRespondToInvitation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: respondToInvitation, isPending: isRespondingToInvitation } = useMutation({
    mutationFn: projectService.respondToInvitation,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  return { respondToInvitation, isRespondingToInvitation }
}
