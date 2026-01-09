import type { BasePaginationResponse } from '@/lib/axios'
import { useAuthStore } from '@/lib/zustand/auth.store'
import subtaskService from '@/services/subtask.service'
import type { Subtask } from '@/types/subtask.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface UseDeleteSubtaskProps {
  taskId?: string
  projectId?: string
  parentMilestoneId?: string
  isParent?: boolean
  children?: Subtask[]
}

export const useDeleteSubtask = ({
  taskId,
  projectId,
  parentMilestoneId,
  isParent = false,
  children = []
}: UseDeleteSubtaskProps = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const queryKey = ['subtasks', taskId]

  const { mutate: deleteSubtask, isPending: isDeletingSubtask } = useMutation({
    mutationFn: subtaskService.deleteSubtask,
    onMutate: async (variables) => {
      if (!taskId) return

      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Subtask>>(queryKey)

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Subtask>>(queryKey, (old) => {
          if (!old) return old

          // delete a parent will also remove all its children
          const childrenIds = isParent ? children.map((child) => child.id) : []
          const idsToRemove = [variables.id, ...childrenIds]

          const newItems = old.value.items.filter((item) => !idsToRemove.includes(item.id))

          return {
            ...old,
            value: {
              ...old.value,
              items: newItems
            }
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
        queryClient.invalidateQueries({ queryKey })
      }

      if (projectId && parentMilestoneId) {
        queryClient.invalidateQueries({ queryKey: ['milestones', projectId, parentMilestoneId] })
      }

      if (projectId && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: ['my-assigned-tasks', projectId, user?.UserId] })
      }
    }
  })

  return { deleteSubtask, isDeletingSubtask }
}
