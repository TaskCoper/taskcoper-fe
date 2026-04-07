import { queryKeys } from '@/lib/query-keys'
import milestoneService from '@/services/milestone.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export interface DeleteMilestoneParams {
  queryKey: unknown[]
  parentMilestoneIdentifier?: string
  onSuccessCallback?: () => void
}

export const useDeleteMilestone = ({
  queryKey,
  parentMilestoneIdentifier,
  onSuccessCallback
}: DeleteMilestoneParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteMilestone, isPending: isDeletingMilestone } = useMutation({
    mutationFn: milestoneService.deleteMilestone,
    onSuccess: (message) => {
      toast.success(message)
      onSuccessCallback?.()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      if (parentMilestoneIdentifier) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.stats(parentMilestoneIdentifier) })
      }
    }
  })

  return { deleteMilestone, isDeletingMilestone }
}
