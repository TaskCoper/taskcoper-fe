import { useGetMilestones } from '@/features/projects/hooks/use-get-milestones'
import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { addTaskSchema, type AddTaskFormValues } from '../validations'

export const useAddTask = ({
  milestoneId,
  projectId,
  parentMilestoneId
}: {
  milestoneId: string
  projectId: string
  parentMilestoneId: string
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [isTriggered, setIsTriggered] = useState(false)
  const { milestones } = useGetMilestones({ projectId, parentMilestoneId })

  const existingTasks = useMemo(
    () => milestones?.tasks.filter((task) => task.milestoneId === milestoneId) ?? [],
    [milestones, milestoneId]
  )
  const calculatedPosition = useMemo(() => calculateNewItemPosition(existingTasks), [existingTasks])

  const methods = useForm<AddTaskFormValues>({
    defaultValues: {
      milestoneId,
      name: '',
      position: calculatedPosition
    },
    resolver: zodResolver(addTaskSchema(t))
  })

  useEffect(() => {
    if (isTriggered) {
      const newPosition = calculateNewItemPosition(existingTasks)
      methods.setValue('position', newPosition)
    }
  }, [isTriggered, existingTasks, methods])

  const { mutate: addTask, isPending: isAddingTask } = useMutation({
    mutationFn: taskService.addTask,
    onSuccess: (message) => {
      toast.success(message)
      const newPosition = calculateNewItemPosition(existingTasks)
      methods.reset({
        milestoneId,
        name: '',
        position: newPosition
      })
      setIsTriggered(false)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
    }
  })

  const recalculatePosition = () => {
    const newPosition = calculateNewItemPosition(existingTasks)
    methods.setValue('position', newPosition)
  }

  return { methods, isTriggered, setIsTriggered, addTask, isAddingTask, recalculatePosition }
}
