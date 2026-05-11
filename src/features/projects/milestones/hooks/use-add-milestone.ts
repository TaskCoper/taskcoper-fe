import { useGetMilestones } from '@/features/projects/core/hooks/use-get-milestones'
import { queryKeys } from '@/lib/query-keys'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import milestoneService from '../services'
import { addMilestoneSchema, type AddMilestoneFormValues } from '../validations'

export const useAddMilestone = ({
  parentMilestoneIdentifier,
  projectIdentifier
}: {
  parentMilestoneIdentifier: string
  projectIdentifier: string
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [isTriggered, setIsTriggered] = useState(false)
  const { milestones } = useGetMilestones({ projectIdentifier, parentMilestoneIdentifier, enabled: isTriggered })

  const existingMilestones = useMemo(() => milestones?.milestones ?? [], [milestones])
  const calculatedPosition = useMemo(() => calculateNewItemPosition(existingMilestones), [existingMilestones])

  const methods = useForm<AddMilestoneFormValues>({
    defaultValues: {
      parentMilestoneIdentifier,
      projectIdentifier,
      milestoneName: '',
      position: calculatedPosition
    },
    resolver: zodResolver(addMilestoneSchema(t))
  })

  useEffect(() => {
    const newPosition = calculateNewItemPosition(existingMilestones)
    methods.reset({
      parentMilestoneIdentifier,
      projectIdentifier,
      milestoneName: '',
      position: newPosition
    })
  }, [projectIdentifier, parentMilestoneIdentifier, existingMilestones, methods])

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
        parentMilestoneIdentifier,
        projectIdentifier,
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.childMilestones(parentMilestoneIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.stats(parentMilestoneIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
    }
  })

  const recalculatePosition = () => {
    const newPosition = calculateNewItemPosition(existingMilestones)
    methods.setValue('position', newPosition)
  }

  return { methods, addMilestone, isAddingMilestone, isTriggered, setIsTriggered, recalculatePosition }
}
