import { useGetMilestones } from '@/features/projects/hooks/use-get-milestones'
import taskService from '@/services/task.service'
import { calculatePosition } from '@/shared/utils'
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

  const existingTasks = useMemo(() => milestones?.tasks ?? [], [milestones])
  const calculatedPosition = useMemo(() => calculatePosition(existingTasks), [existingTasks])

  const methods = useForm<AddTaskFormValues>({
    defaultValues: {
      milestoneId,
      name: '',
      position: calculatedPosition
    },
    resolver: zodResolver(addTaskSchema)
  })

  useEffect(() => {
    if (isTriggered) {
      const newPosition = calculatePosition(existingTasks)
      methods.setValue('position', newPosition)
    }
  }, [isTriggered, existingTasks, methods])

  const { mutate: addTask, isPending: isAddingTask } = useMutation({
    mutationFn: taskService.addTask,
    onSuccess: (message) => {
      toast.success(message)
      const newPosition = calculatePosition(existingTasks)
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
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId, parentMilestoneId] })
    }
  })

  const recalculatePosition = () => {
    const newPosition = calculatePosition(existingTasks)
    methods.setValue('position', newPosition)
  }

  return { methods, isTriggered, setIsTriggered, addTask, isAddingTask, recalculatePosition }
}
