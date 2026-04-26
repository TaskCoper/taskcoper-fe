import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import type { TaskDetail } from '@/types/task.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateTaskSchema, type UpdateTaskFormValues } from '../validations'

interface UseUpdateTaskProps {
  taskIdentifier?: string
  identifier?: string
  milestoneIdentifier?: string
}

export const useUpdateTask = ({ taskIdentifier, identifier, milestoneIdentifier }: UseUpdateTaskProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const methods = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema(t))
  })

  const queryKey = queryKeys.tasks.detail(taskIdentifier)

  const { mutate: updateTask, isPending: isUpdatingTask } = useMutation({
    mutationFn: taskService.updateTask,
    onMutate: async (variables) => {
      if (!taskIdentifier) return

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
            priority: variables.body.priority,
            mentionedUsers: old.mentionedUsers.filter((u) =>
              variables.body.mentionUsers.some((mentionUser) => mentionUser.userId === u.userId)
            )
          }
        })
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (taskIdentifier && context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      if (taskIdentifier) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskIdentifier) })
        queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskIdentifier) })
      }

      if (milestoneIdentifier) {
        if (identifier) {
          queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(identifier, milestoneIdentifier) })
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.taskStatusStats(identifier, milestoneIdentifier)
          })
          queryClient.invalidateQueries({ queryKey: queryKeys.projects.priorityStats(identifier, milestoneIdentifier) })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(milestoneIdentifier) })
      }

      if (identifier && user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(identifier, user?.id) })
      }
    }
  })

  return { methods, updateTask, isUpdatingTask }
}
