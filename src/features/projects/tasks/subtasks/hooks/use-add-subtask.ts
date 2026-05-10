import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { queryKeys } from '@/lib/query-keys'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskSubtaskService from '../services'
import { addTaskSubtaskSchema, type AddTaskSubtaskFormValues } from '../validations'
import { useGetTaskSubtasks } from './use-get-subtasks'

interface AddTaskSubtaskParams {
  taskId?: string
  subtaskId?: string
  isAddingChildren?: boolean
  projectIdentifier?: string
  parentMilestoneIdentifier?: string
}

export const useAddTaskSubtask = ({
  taskId,
  subtaskId,
  isAddingChildren = false,
  projectIdentifier,
  parentMilestoneIdentifier
}: AddTaskSubtaskParams = {}) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { subtasks } = useGetTaskSubtasks({ taskId })
  const { me: user } = useGetMe()

  const existingSubtasks = useMemo(
    () => subtasks?.value.items.filter((subtask) => !subtask.parentId) || [],
    [subtasks]
  ).map((subtask) => ({ position: subtask.index }))

  const existingChildren = useMemo(
    () => subtasks?.value.items.filter((subtask) => subtask.parentId === subtaskId) || [],
    [subtasks, subtaskId]
  ).map((subtask) => ({ position: subtask.index }))

  const methods = useForm<AddTaskSubtaskFormValues>({
    resolver: zodResolver(addTaskSubtaskSchema(t))
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

  const { mutate: addTaskSubtask, isPending: isAddingTaskSubtask } = useMutation({
    mutationFn: taskSubtaskService.addTaskSubtask,
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

      if (parentMilestoneIdentifier) {
        if (projectIdentifier) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
          })
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      }

      if (projectIdentifier && user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.id) })
      }
    }
  })

  return {
    methods,
    addTaskSubtask,
    isAddingTaskSubtask,
    open,
    setOpen,
    recalculatePosition,
    recalculateChildrenPosition
  }
}
