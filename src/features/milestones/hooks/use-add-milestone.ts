import { useGetMilestones } from '@/features/projects/hooks/use-get-milestones'
import milestoneService from '@/services/milestone.service'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { addMilestoneSchema, type AddMilestoneFormValues } from '../validations'

export const useAddMilestone = ({ parentId, projectId }: { parentId: string; projectId: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [isTriggered, setIsTriggered] = useState(false)
  const { milestones } = useGetMilestones({ projectId, parentMilestoneId: parentId })

  const existingMilestones = useMemo(() => milestones?.milestones ?? [], [milestones])
  const calculatedPosition = useMemo(() => calculateNewItemPosition(existingMilestones), [existingMilestones])

  const methods = useForm<AddMilestoneFormValues>({
    defaultValues: {
      parentId,
      projectId,
      milestoneName: '',
      position: calculatedPosition
    },
    resolver: zodResolver(addMilestoneSchema(t))
  })

  useEffect(() => {
    const newPosition = calculateNewItemPosition(existingMilestones)
    methods.reset({
      parentId,
      projectId,
      milestoneName: '',
      position: newPosition
    })
  }, [projectId, parentId, existingMilestones, methods])

  useEffect(() => {
    if (isTriggered) {
      const newPosition = calculateNewItemPosition(existingMilestones)
      methods.setValue('position', newPosition)
    }
  }, [isTriggered, existingMilestones, methods])

  const { mutate: addMilestone, isPending: isAddingMilestone } = useMutation({
    mutationFn: milestoneService.addMilestone,
    onSuccess: (message) => {
      toast.success(message)
      const newPosition = calculateNewItemPosition(existingMilestones)
      methods.reset({
        parentId,
        projectId,
        milestoneName: '',
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
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId, parentId] })
    }
  })

  const recalculatePosition = () => {
    const newPosition = calculateNewItemPosition(existingMilestones)
    methods.setValue('position', newPosition)
  }

  return { methods, addMilestone, isAddingMilestone, isTriggered, setIsTriggered, recalculatePosition }
}
