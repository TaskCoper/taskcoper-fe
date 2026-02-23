import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import type { TaskDetail } from '@/types/task.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateTaskSchema, type UpdateTaskFormValues } from '../validations'

interface UseUpdateTaskProps {
  taskId?: string
  projectId?: string
  parentMilestoneId?: string
}

export const useUpdateTask = ({ taskId, projectId, parentMilestoneId }: UseUpdateTaskProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const methods = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema(t))
  })

  const queryKey = queryKeys.tasks.detail(taskId)

  const { mutate: updateTask, isPending: isUpdatingTask } = useMutation({
    mutationFn: taskService.updateTask,
    onMutate: async (variables) => {
      if (!taskId) return

      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<TaskDetail>(queryKey)

      if (previousData) {
        queryClient.setQueryData<TaskDetail>(queryKey, (old) => {
          if (!old) return old

          return {
            ...old,
            taskName: variables.body.name,
            taskDescription: variables.body.description,
            taskStartDate: variables.body.startDate,
            taskEndDate: variables.body.endDate,
            announceBeforeMinutes: variables.body.announceBeforeMinutes,
            milestoneId: variables.body.targetMilestoneId,
            taskPosition: variables.body.position,
            isCompleted: variables.body.isCompleted,
            estimatedPoints: variables.body.estimatedPoints,
            backgroundImage: variables.body.backgroundImage,
            priority: variables.body.priority
          }
        })
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (taskId && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })
      }

      if (parentMilestoneId) {
        if (projectId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
          queryClient.invalidateQueries({ queryKey: queryKeys.projects.taskStatusStats(projectId, parentMilestoneId) })
          queryClient.invalidateQueries({ queryKey: queryKeys.projects.priorityStats(projectId, parentMilestoneId) })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneId) })
      }

      if (projectId && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
      }
    }
  })

  return { methods, updateTask, isUpdatingTask }
}
