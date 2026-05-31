import { queryKeys } from '@/lib/query-keys'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useGetParentMilestones } from '../../core/hooks/use-get-parent-milestones'
import milestoneService from '../services'
import { addParentMilestoneSchema, type AddParentMilestoneFormValues } from '../validations'

export const useAddParentMilestone = ({
  identifier,
  open,
  setOpen
}: {
  identifier: string
  open: boolean
  setOpen: (open: boolean) => void
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
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
