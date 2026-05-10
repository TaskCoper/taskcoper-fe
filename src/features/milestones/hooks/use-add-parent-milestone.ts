import { useGetParentMilestones } from '@/features/projects/core/hooks/use-get-parent-milestones'
import { queryKeys } from '@/lib/query-keys'
import milestoneService from '@/services/milestone.service'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { addParentMilestoneSchema, type AddParentMilestoneFormValues } from '../validations'

export const useAddParentMilestone = ({ identifier }: { identifier: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { parentMilestones } = useGetParentMilestones({ identifier })

  const existingParentMilestones = useMemo(() => parentMilestones?.value.items || [], [parentMilestones])
  const calculatedPosition = useMemo(
    () => calculateNewItemPosition(existingParentMilestones),
    [existingParentMilestones]
  )

  const methods = useForm<AddParentMilestoneFormValues>({
    defaultValues: {
      milestoneName: '',
      projectIdentifier: identifier,
      position: calculatedPosition
    },
    resolver: zodResolver(addParentMilestoneSchema(t))
  })

  useEffect(() => {
    if (open) {
      const newPosition = calculateNewItemPosition(existingParentMilestones)
      methods.setValue('position', newPosition)
    }
  }, [open, existingParentMilestones, methods])

  const { mutate: addParentMilestone, isPending: isAddingParentMilestone } = useMutation({
    mutationFn: milestoneService.addParentMilestone,
    onSuccess: (message) => {
      toast.success(message)
      const newPosition = calculateNewItemPosition(existingParentMilestones)
      methods.reset({
        milestoneName: '',
        projectIdentifier: identifier,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.parentMilestones(identifier) })
    }
  })

  const recalculatePosition = () => {
    const newPosition = calculateNewItemPosition(existingParentMilestones)
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
