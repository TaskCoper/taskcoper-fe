import milestoneService from '@/services/milestone.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export interface DeleteMilestoneParams {
  queryKey: unknown[]
  onSuccessCallback?: () => void
}

export const useDeleteMilestone = ({ queryKey, onSuccessCallback }: DeleteMilestoneParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteMilestone, isPending: isDeletingMilestone } = useMutation({
    mutationFn: milestoneService.deleteMilestone,
    onSuccess: (message) => {
      toast(message)
      onSuccessCallback?.()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })

  return { deleteMilestone, isDeletingMilestone }
}
