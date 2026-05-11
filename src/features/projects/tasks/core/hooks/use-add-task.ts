import { queryKeys } from '@/lib/query-keys'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useGetMilestones } from '../../../core/hooks/use-get-milestones'
import taskService from '../services'
import { addTaskSchema, type AddTaskFormValues } from '../validations'

export const useAddTask = ({
  milestoneId: initialMilestoneId,
  projectIdentifier,
  parentMilestoneIdentifier
}: {
  milestoneId?: string
  projectIdentifier: string
  parentMilestoneIdentifier: string
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [isTriggered, setIsTriggered] = useState(false)
  const { milestones } = useGetMilestones({ projectIdentifier, parentMilestoneIdentifier, enabled: isTriggered })

  const methods = useForm<AddTaskFormValues>({
    defaultValues: {
      milestoneId: initialMilestoneId ?? '',
      name: '',
      position: 0
    },
    resolver: zodResolver(addTaskSchema(t))
  })

  const watchedMilestoneId = useWatch({ control: methods.control, name: 'milestoneId' })
  const milestoneId = watchedMilestoneId || initialMilestoneId || ''

  const existingTasks = useMemo(
    () => milestones?.tasks.filter((task) => task.milestoneId === milestoneId) ?? [],
    [milestones, milestoneId]
  )

  useEffect(() => {
    if (isTriggered && milestoneId) {
      const newPosition = calculateNewItemPosition(existingTasks)
      methods.setValue('position', newPosition)
    }
  }, [isTriggered, existingTasks, methods, milestoneId])

  const { mutate: addTask, isPending: isAddingTask } = useMutation({
    mutationFn: taskService.addTask,
    onSuccess: (message) => {
      toast.success(message)
      const newPosition = calculateNewItemPosition(existingTasks)
      methods.reset({
        milestoneId: initialMilestoneId ?? '',
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.childMilestones(parentMilestoneIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.stats(parentMilestoneIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.tasks(milestoneId) })
    }
  })

  const recalculatePosition = () => {
    const newPosition = calculateNewItemPosition(existingTasks)
    methods.setValue('position', newPosition)
  }

  return { methods, isTriggered, setIsTriggered, addTask, isAddingTask, recalculatePosition }
}
