import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface MoveTaskParams {
  isDragging?: boolean
  projectId?: string
  milestoneId?: string
  targetMilestoneId?: string
  parentMilestoneId?: string
}

export const useMoveTask = ({
  isDragging = true,
  projectId,
  parentMilestoneId,
  milestoneId,
  targetMilestoneId
}: MoveTaskParams = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: moveTask, isPending: isMovingTask } = useMutation({
    mutationFn: taskService.moveTask,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(variables.body.id) })

      if (!isDragging) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.body.id) })
      }

      if (parentMilestoneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.childMilestones(parentMilestoneId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneId) })
        if (projectId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
        }
      }

      if (milestoneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.tasks(milestoneId) })
      }

      if (targetMilestoneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.tasks(targetMilestoneId) })
      }
    }
  })

  return { moveTask, isMovingTask }
}
