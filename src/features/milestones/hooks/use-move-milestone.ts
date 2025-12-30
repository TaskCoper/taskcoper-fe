import milestoneService from '@/services/milestone.service'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useMoveMilestone = () => {
  const { t } = useTranslation()

  const { mutate: moveMilestone, isPending: isMovingMilestone } = useMutation({
    mutationFn: milestoneService.moveMilestone,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { moveMilestone, isMovingMilestone }
}
