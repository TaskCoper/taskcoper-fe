import milestoneService from '@/services/milestone.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useMoveMilestone = ({
  projectId,
  parentMilestoneId
}: {
  projectId?: string
  parentMilestoneId?: string
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: moveMilestone, isPending: isMovingMilestone } = useMutation({
    mutationFn: milestoneService.moveMilestone,
    onSuccess: () => {},
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId, parentMilestoneId] })
    }
  })

  return { moveMilestone, isMovingMilestone }
}
