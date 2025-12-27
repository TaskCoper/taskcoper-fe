import { useGetParentMilestones } from '@/features/projects/hooks/use-get-parent-milestones'
import milestoneService from '@/services/milestone.service'
import { calculatePosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { addParentMilestoneSchema, type AddParentMilestoneFormValues } from '../validations'

export const useAddParentMilestone = ({ projectId }: { projectId: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { parentMilestones } = useGetParentMilestones({ projectId })

  const existingParentMilestones = useMemo(() => parentMilestones?.value.items || [], [parentMilestones])
  const calculatedPosition = useMemo(() => calculatePosition(existingParentMilestones), [existingParentMilestones])

  const methods = useForm<AddParentMilestoneFormValues>({
    defaultValues: {
      milestoneName: '',
      projectId,
      position: calculatedPosition
    },
    resolver: zodResolver(addParentMilestoneSchema)
  })

  useEffect(() => {
    if (open) {
      const newPosition = calculatePosition(existingParentMilestones)
      methods.setValue('position', newPosition)
    }
  }, [open, existingParentMilestones, methods])

  const { mutate: addParentMilestone, isPending: isAddingParentMilestone } = useMutation({
    mutationFn: milestoneService.addParentMilestone,
    onSuccess: (message) => {
      toast.success(message)
      const newPosition = calculatePosition(existingParentMilestones)
      methods.reset({
        milestoneName: '',
        projectId,
        position: newPosition
      })
      setOpen(false)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-milestones', projectId] })
    }
  })

  const recalculatePosition = () => {
    const newPosition = calculatePosition(existingParentMilestones)
    methods.setValue('position', newPosition)
  }

  return {
    methods,
    addParentMilestone,
    isAddingParentMilestone,
    open,
    setOpen,
    recalculatePosition
  }
}
