import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface MoveTaskParams {
  isDragging?: boolean
  projectIdentifier?: string
  milestoneId?: string
  taskIdentifier?: string
  targetMilestoneId?: string
  milestoneIdentifier?: string
}

export const useMoveTask = ({
  isDragging = true,
  projectIdentifier,
  milestoneIdentifier,
  milestoneId,
  taskIdentifier,
  targetMilestoneId
}: MoveTaskParams) => {
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
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskIdentifier) })

      if (!isDragging) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskIdentifier) })
      }

      if (milestoneIdentifier) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.childMilestones(milestoneIdentifier) })
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(milestoneIdentifier) })
        if (projectIdentifier) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.milestones.byParent(projectIdentifier, milestoneIdentifier)
          })
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
