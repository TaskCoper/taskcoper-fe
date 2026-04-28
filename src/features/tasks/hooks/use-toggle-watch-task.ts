import { useGetMe } from '@/features/auth/hooks/use-get-me'
import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import type { TaskMember } from '@/types/task.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseToggleWatchTaskParams {
  projectIdentifier?: string
  milestoneIdentifier?: string
}

export const useToggleWatchTask = ({ projectIdentifier, milestoneIdentifier }: UseToggleWatchTaskParams = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { me: user } = useGetMe()

  const { mutateAsync: toggleWatchTask, isPending: isTogglingWatchTask } = useMutation({
    mutationFn: taskService.toggleWatchTask,
    onMutate: async ({ taskId, isWatching }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.members(taskId) })
      const previousData = queryClient.getQueryData<BasePaginationResponse<TaskMember>>(queryKeys.tasks.members(taskId))

      if (previousData && user) {
        // if user is already a task member, skip optimistic update
        const isActualMember = previousData.value.items.some((m) => m.userId === user.id && m.isMemberInTask)
        if (isActualMember) return { previousData, taskId }

        queryClient.setQueryData<BasePaginationResponse<TaskMember>>(queryKeys.tasks.members(taskId), (old) => {
          if (!old) return old

          if (isWatching) {
            const newWatcher: TaskMember = {
              userId: user.id,
              firstName: '',
              lastName: '',
              email: user.email,
              avatar: null,
              isMemberInTask: false
            }

            return {
              ...old,
              value: {
                ...old.value,
                items: [...old.value.items, newWatcher],
                totalCount: old.value.totalCount + 1
              }
            }
          }

          const filtered = old.value.items.filter((m) => !(m.userId === user.id && !m.isMemberInTask))

          return {
            ...old,
            value: {
              ...old.value,
              items: filtered,
              totalCount: old.value.totalCount - (old.value.items.length - filtered.length)
            }
          }
        })
      }

      return { previousData, taskId }
    },
    onError: (error, _variables, context) => {
      if (context?.taskId && context?.previousData) {
        queryClient.setQueryData(queryKeys.tasks.members(context.taskId), context.previousData)
      }

      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.members(variables.taskId) })

      if (milestoneIdentifier) {
        if (projectIdentifier) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.milestones.byParent(projectIdentifier, milestoneIdentifier)
          })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(milestoneIdentifier) })
      }
    }
  })

  return { toggleWatchTask, isTogglingWatchTask }
}
