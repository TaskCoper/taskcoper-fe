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

  const queryKey = ['task', taskId]

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
            taskPosition: variables.body.position
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
        queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      }

      if (projectId && parentMilestoneId) {
        queryClient.invalidateQueries({ queryKey: ['milestones', projectId, parentMilestoneId] })
      }

      if (projectId && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: ['my-assigned-tasks', projectId, user?.UserId] })
      }
    }
  })

  return { methods, updateTask, isUpdatingTask }
}
