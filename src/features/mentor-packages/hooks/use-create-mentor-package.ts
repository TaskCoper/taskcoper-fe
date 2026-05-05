import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createMentorPackageSchema, type CreateMentorPackageFormValues } from '../validations'
import { useGetMyMentorPackages } from './use-get-my-mentor-packages'

export const useCreateMentorPackage = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { mentorPackages } = useGetMyMentorPackages()

  const existingPackages = useMemo(() => mentorPackages?.value.items ?? [], [mentorPackages])
  const calculatedPosition = useMemo(() => calculateNewItemPosition(existingPackages), [existingPackages])

  const methods = useForm<CreateMentorPackageFormValues>({
    defaultValues: {
      name: '',
      description: '',
      durationInMinutes: 60,
      totalSessions: undefined,
      price: undefined,
      currency: 'Vnd',
      position: calculatedPosition
    },
    resolver: zodResolver(createMentorPackageSchema(t))
  })

  useEffect(() => {
    if (open) {
      const newPosition = calculateNewItemPosition(existingPackages)
      methods.setValue('position', newPosition)
    }
  }, [open, existingPackages, methods])

  const { mutate: createMentorPackage, isPending: isCreatingPackage } = useMutation({
    mutationFn: mentorPackageService.createMentorPackage,
    onSuccess: (message) => {
      toast.success(message)
      const newPosition = calculateNewItemPosition(existingPackages)
      methods.reset({
        name: '',
        description: '',
        durationInMinutes: 60,
        totalSessions: undefined,
        price: undefined,
        currency: 'Vnd',
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
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.my() })
    }
  })

  return { methods, createMentorPackage, isCreatingPackage, open, setOpen }
}
