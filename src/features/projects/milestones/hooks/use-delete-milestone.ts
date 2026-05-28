import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import milestoneService from '../services'

export interface DeleteMilestoneParams {
  queryKey: readonly unknown[]
  projectIdentifier?: string
  parentMilestoneIdentifier?: string
  onSuccessCallback?: () => void
}

export const useDeleteMilestone = ({
  queryKey,
  projectIdentifier,
  parentMilestoneIdentifier,
  onSuccessCallback
}: DeleteMilestoneParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me } = useGetMe()

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
      if (projectIdentifier) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, me?.id) })
      }

      if (parentMilestoneIdentifier) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.stats(parentMilestoneIdentifier) })
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.childMilestones(parentMilestoneIdentifier) })
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      }
    }
  })

  return { deleteMilestone, isDeletingMilestone }
}
