import type { BasePaginationResponse } from '@/lib/axios'
import { useAuthStore } from '@/lib/zustand/auth.store'
import subtaskService from '@/services/subtask.service'
import type { Subtask } from '@/types/subtask.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateSubtaskStatusSchema, type UpdateSubtaskStatusFormValues } from '../validations'

interface UseUpdateSubtaskStatusProps {
  taskId?: string
  projectId?: string
  parentMilestoneId?: string
}

export const useUpdateSubtaskStatus = ({ taskId, projectId, parentMilestoneId }: UseUpdateSubtaskStatusProps = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const methods = useForm<UpdateSubtaskStatusFormValues>({
    resolver: zodResolver(updateSubtaskStatusSchema(t))
  })

  const queryKey = ['subtasks', taskId]

  const { mutate: updateSubtaskStatus, isPending: isUpdatingSubtaskStatus } = useMutation({
    mutationFn: subtaskService.updateSubtaskStatus,
    onMutate: async (variables) => {
      if (!taskId) return

      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Subtask>>(queryKey)

      if (previousData) {
        queryClient.setQueryData<BasePaginationResponse<Subtask>>(queryKey, (old) => {
          if (!old) return old

          const targetItem = old.value.items.find((item) => item.id === variables.body.id)
          if (!targetItem) return old

          const isParent = targetItem.parentId === null
          const newStatus = variables.body.isCompleted

          // Helper to update items based on shouldUpdate condition
          const updateItems = (items: Subtask[], shouldUpdate: (item: Subtask) => boolean, status: boolean) =>
            items.map((item) => (shouldUpdate(item) ? { ...item, isCompleted: status } : item))

          let updatedItems = [...old.value.items]

          // parent decides children's statuses
          if (isParent) {
            // if parent is checked/unchecked -> Force ALL children to match.
            updatedItems = updateItems(
              updatedItems,
              (item) => item.id === variables.body.id || item.parentId === variables.body.id,
              newStatus
            )
          } else {
            // children influence parent's status
            const parentId = targetItem.parentId

            // update the specific subtask first
            updatedItems = updateItems(updatedItems, (item) => item.id === variables.body.id, newStatus)
            const siblings = old.value.items.filter(
              (item) => item.parentId === parentId && item.id !== variables.body.id
            )

            if (newStatus === true) {
              // updated subtask marked as done
              const allSiblingsCompleted = siblings.every((sibling) => sibling.isCompleted)

              if (allSiblingsCompleted) {
                // all siblings are true along with updated subtask is also true → parent becomes true
                updatedItems = updateItems(updatedItems, (item) => item.id === parentId, true)
              }
            } else {
              // updated subtask marked as false
              // if a single child becomes incomplete, the parent MUST become incomplete immediately
              updatedItems = updateItems(updatedItems, (item) => item.id === parentId, false)
            }
          }

          return {
            ...old,
            value: {
              ...old.value,
              items: updatedItems
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

  return { methods, updateSubtaskStatus, isUpdatingSubtaskStatus }
}
