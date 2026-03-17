import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createMentorPackageSchema, type CreateMentorPackageFormValues } from '../validations'

export const useCreateMentorPackage = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const methods = useForm<CreateMentorPackageFormValues>({
    defaultValues: {
      name: '',
      description: '',
      durationInMinutes: 60,
      totalSessions: undefined,
      price: undefined,
      currency: 'Vnd'
    },
    resolver: zodResolver(createMentorPackageSchema(t))
  })

  const { mutate: createMentorPackage, isPending: isCreatingPackage } = useMutation({
    mutationFn: mentorPackageService.createMentorPackage,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset()
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
