import taskService from '@/services/task.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useMoveTask = ({ projectId, parentMilestoneId }: { projectId?: string; parentMilestoneId?: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: moveTask, isPending: isMovingTask } = useMutation({
    mutationFn: taskService.moveTask,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId, parentMilestoneId] })
    }
  })

  return { moveTask, isMovingTask }
}
