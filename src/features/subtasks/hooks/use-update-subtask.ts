/* eslint-disable @typescript-eslint/no-unused-vars */
import type { BasePaginationResponse } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import subtaskService from '@/services/subtask.service'
import type { Subtask } from '@/types/subtask.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { recalculateParentStatus } from '../utils'
import { type UpdateSubtaskFormValues, updateSubtaskSchema } from '../validations'

interface UpdateSubtaskProps {
  taskId?: string
  projectId?: string
  parentMilestoneId?: string
}

interface UpdateSubtaskVariables {
  body: UpdateSubtaskFormValues
  meta?: {
    oldParentId?: string | null
  }
}

// TODO: when update subtask at assigned tasks section but not in the parent milestone tab of that task, the UI will not be updated accordingly
export const useUpdateSubtask = ({ taskId, projectId, parentMilestoneId }: UpdateSubtaskProps = {}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const methods = useForm<UpdateSubtaskFormValues>({
    resolver: zodResolver(updateSubtaskSchema(t))
  })

  const { mutate: updateSubtask, isPending: isUpdatingSubtask } = useMutation({
    mutationFn: ({ body }: UpdateSubtaskVariables) => subtaskService.updateSubtask({ body }),
    onMutate: async ({ body, meta }) => {
      if (!taskId) return

      await queryClient.cancelQueries({ queryKey: queryKeys.subtasks.byTask(taskId) })
      const previousData = queryClient.getQueryData<BasePaginationResponse<Subtask>>(queryKeys.subtasks.byTask(taskId))

      if (previousData) {
        // we MUST check meta.oldParentId because we already optimistic update the parentId inside the onDragOver
        const isReparenting =
          body.parentId !== undefined && meta?.oldParentId !== undefined && meta.oldParentId !== body.parentId

        queryClient.setQueryData<BasePaginationResponse<Subtask>>(queryKeys.subtasks.byTask(taskId), (old) => {
          if (!old) return old

          // case 1: standard update (no move)
          if (!isReparenting) {
            // only update fields that are not related to drag and drop
            const { index: _index, parentId: _parentId, ...otherFields } = body
            return {
              ...old,
              value: {
                ...old.value,
                items: old.value.items.map((item) => (item.id === body.id ? { ...item, ...otherFields } : item))
              }
            }
          }

          // case 2: re-parenting / move logic
          const newParentId = body.parentId
          const oldParentId = meta.oldParentId
          const updatedItems = [...old.value.items]

          const movedSubtask = updatedItems.find((item) => item.id === body.id)
          if (!movedSubtask) return old

          const targetIndex = updatedItems.findIndex((item) => item.id === body.id)
          if (targetIndex !== -1) {
            // only update fields that are not related to drag and drop
            // we do it again for sure
            const { index: _index, parentId: _parentId, ...otherFields } = body
            updatedItems[targetIndex] = { ...updatedItems[targetIndex], ...otherFields }
          }

          // case 2.2: handle destination parent (new parent)
          // a completed parent cannot contain an incomplete child
          if (newParentId) {
            const newParentIndex = updatedItems.findIndex((item) => item.id === newParentId)

            if (newParentIndex !== -1) {
              const newParent = updatedItems[newParentIndex]
              const movedSubtaskIsIncomplete = !movedSubtask.isCompleted

              // if new parent is True + moved subtask is False then the new parent must re-open (False)
              if (newParent.isCompleted && movedSubtaskIsIncomplete) {
                updatedItems[newParentIndex] = {
                  ...updatedItems[newParentIndex],
                  isCompleted: false
                }
              }
            }
          }

          // case 2.3: handle source parent (old parent)
          // logic checks happen *after* the item has conceptually left the old parent
          if (oldParentId) {
            recalculateParentStatus(updatedItems, oldParentId)
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
        queryClient.setQueryData(queryKeys.subtasks.byTask(taskId), context.previousData)
      }
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.byTask(taskId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })
      }

      if (parentMilestoneId) {
        if (projectId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneId) })
      }

      if (projectId && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
      }
    }
  })

  return { methods, updateSubtask, isUpdatingSubtask }
}
