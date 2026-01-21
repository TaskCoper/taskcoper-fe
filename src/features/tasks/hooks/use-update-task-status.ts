import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import type { MilestoneWithTasks } from '@/types/milestone.type'
import type { TaskDetail } from '@/types/task.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseUpdateTaskStatusProps {
  taskId: string
  projectId?: string
  parentMilestoneId?: string
}

export const useUpdateTaskStatus = ({ taskId, projectId, parentMilestoneId }: UseUpdateTaskStatusProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: updateTaskStatus, isPending: isUpdatingTaskStatus } = useMutation({
    mutationFn: taskService.updateTaskStatus,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
      const previousMilestones = queryClient.getQueryData(queryKeys.milestones.byParent(projectId, parentMilestoneId))
      const previousTask = queryClient.getQueryData(queryKeys.tasks.detail(taskId))

      if (previousMilestones) {
        queryClient.setQueryData<MilestoneWithTasks>(
          queryKeys.milestones.byParent(projectId, parentMilestoneId),
          (old) => {
            if (!old) return old

            return {
              ...old,
              tasks: old.tasks.map((task) =>
                task.id === variables.id ? { ...task, isCompleted: variables.isCompleted } : task
              )
            }
          }
        )
      }

      if (previousTask) {
        queryClient.setQueryData<TaskDetail>(queryKeys.tasks.detail(taskId), (old) => {
          if (!old) return old

          return {
            ...old,
            isCompleted: variables.isCompleted
          }
        })
      }

      return { previousMilestones, previousTask }
    },
    onError: (error, _variables, context) => {
      if (context?.previousMilestones) {
        queryClient.setQueryData(
          queryKeys.milestones.byParent(projectId, parentMilestoneId),
          context.previousMilestones
        )
      }

      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(taskId), context.previousTask)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) })

      if (projectId && parentMilestoneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
      }
    }
  })

  return { updateTaskStatus, isUpdatingTaskStatus }
}
