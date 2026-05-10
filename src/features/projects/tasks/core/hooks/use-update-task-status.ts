import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { MilestoneWithTasks } from '@/features/projects/core/types'
import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskService from '../services'
import type { TaskDetail, TaskRow } from '../types'

interface UpdateTaskStatusParams {
  taskId: string
  projectIdentifier?: string
  parentMilestoneIdentifier?: string
}

export const useUpdateTaskStatus = ({
  taskId,
  projectIdentifier,
  parentMilestoneIdentifier
}: UpdateTaskStatusParams) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const { mutate: updateTaskStatus, isPending: isUpdatingTaskStatus } = useMutation({
    mutationFn: taskService.updateTaskStatus,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
      })
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })

      const previousMilestones = queryClient.getQueryData(
        queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
      )
      const previousTask = queryClient.getQueryData(queryKeys.tasks.detail(taskId))
      const previousTasks = queryClient.getQueriesData<BasePaginationResponse<TaskRow>>({
        queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier)
      })

      if (previousMilestones) {
        queryClient.setQueryData<MilestoneWithTasks>(
          queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier),
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

      queryClient.setQueriesData<BasePaginationResponse<TaskRow>>(
        { queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) },
        (old) => {
          if (!old) return old

          return {
            ...old,
            value: {
              ...old.value,
              items: old.value.items.map((task) =>
                task.id === variables.id ? { ...task, isCompleted: variables.isCompleted } : task
              )
            }
          }
        }
      )

      return { previousMilestones, previousTask, previousTasks }
    },
    onError: (error, _variables, context) => {
      if (context?.previousMilestones) {
        queryClient.setQueryData(
          queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier),
          context.previousMilestones
        )
      }

      if (context?.previousTask) {
        queryClient.setQueryData(queryKeys.tasks.detail(taskId), context.previousTask)
      }

      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })

      if (parentMilestoneIdentifier) {
        if (projectIdentifier) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
          })
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.taskStatusStats(projectIdentifier, parentMilestoneIdentifier)
          })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      }

      if (projectIdentifier && user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.id) })
      }
    }
  })

  return { updateTaskStatus, isUpdatingTaskStatus }
}
