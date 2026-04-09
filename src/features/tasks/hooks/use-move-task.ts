import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
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
  currentMilestoneIdentifier?: string
  targetMilestoneIdentifier?: string
}

export const useMoveTask = ({
  isDragging = true,
  projectIdentifier,
  milestoneIdentifier,
  milestoneId,
  taskIdentifier,
  targetMilestoneId,
  currentMilestoneIdentifier,
  targetMilestoneIdentifier
}: MoveTaskParams) => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
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
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.UserId) })

      if (!isDragging) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskIdentifier) })
      }

      if (milestoneIdentifier) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.childMilestones(milestoneIdentifier) })
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(milestoneIdentifier) })
      }

      if (currentMilestoneIdentifier) {
        if (targetMilestoneIdentifier) {
          if (currentMilestoneIdentifier !== targetMilestoneIdentifier) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.milestones.byParent(projectIdentifier, currentMilestoneIdentifier)
            })
            queryClient.invalidateQueries({
              queryKey: queryKeys.milestones.byParent(projectIdentifier, targetMilestoneIdentifier)
            })
          } else {
            queryClient.invalidateQueries({
              queryKey: queryKeys.milestones.byParent(projectIdentifier, currentMilestoneIdentifier)
            })
          }
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
