import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { addSubtaskSchema, type AddSubtaskFormValues } from '../validations'
import { useGetSubtasks } from './use-get-subtasks'

interface UseAddSubtaskProps {
  taskId?: string
  subtaskId?: string
  isAddingChildren?: boolean
  projectId?: string
  parentMilestoneId?: string
}

export const useAddSubtask = ({
  taskId,
  subtaskId,
  isAddingChildren = false,
  projectId,
  parentMilestoneId
}: UseAddSubtaskProps = {}) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { subtasks } = useGetSubtasks({ taskId })
  const { user } = useAuthStore()

  const existingSubtasks = useMemo(
    () => subtasks?.value.items.filter((subtask) => !subtask.parentId) || [],
    [subtasks]
  ).map((subtask) => ({ position: subtask.index }))

  const existingChildren = useMemo(
    () => subtasks?.value.items.filter((subtask) => subtask.parentId === subtaskId) || [],
    [subtasks, subtaskId]
  ).map((subtask) => ({ position: subtask.index }))

  const methods = useForm<AddSubtaskFormValues>({
    resolver: zodResolver(addSubtaskSchema(t))
  })

  const recalculatePosition = useCallback(() => {
    const newPosition = calculateNewItemPosition(existingSubtasks)
    methods.setValue('index', newPosition)
  }, [existingSubtasks, methods])

  const recalculateChildrenPosition = useCallback(() => {
    const newPosition = calculateNewItemPosition(existingChildren)
    methods.setValue('index', newPosition)
  }, [existingChildren, methods])

  useEffect(() => {
    if (open && taskId && !isAddingChildren) {
      recalculatePosition()
    }
  }, [open, taskId, recalculatePosition, isAddingChildren])

  useEffect(() => {
    if (open && subtaskId && isAddingChildren) {
      recalculateChildrenPosition()
    }
  }, [open, subtaskId, recalculateChildrenPosition, isAddingChildren])

  const { mutate: addSubtask, isPending: isAddingSubtask } = useMutation({
    mutationFn: taskService.addSubtask,
    onSuccess: (message) => {
      methods.reset()
      setOpen(false)
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.byTask(taskId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })
      }

      if (projectId && parentMilestoneId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
      }

      if (projectId && user?.UserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
      }
    }
  })

  return { methods, addSubtask, isAddingSubtask, open, setOpen, recalculatePosition, recalculateChildrenPosition }
}
