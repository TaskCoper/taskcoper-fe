import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { invalidateTaskTree } from '@/lib/invalidations'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskService from '../services'

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
  const { me: user } = useGetMe()
  const { t } = useTranslation()

  const { mutate: moveTask, isPending: isMovingTask } = useMutation({
    mutationFn: taskService.moveTask,
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      invalidateTaskTree(queryClient, {
        taskId: taskIdentifier,
        projectIdentifier,
        parentMilestoneIdentifier: milestoneIdentifier,
        userId: user?.id
      })

      if (!isDragging) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskIdentifier) })
      }

      if (milestoneIdentifier) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.childMilestones(milestoneIdentifier) })
      }

      if (currentMilestoneIdentifier) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.milestones.byParent(projectIdentifier, currentMilestoneIdentifier)
        })
      }
      if (targetMilestoneIdentifier && targetMilestoneIdentifier !== currentMilestoneIdentifier) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.milestones.byParent(projectIdentifier, targetMilestoneIdentifier)
        })
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
