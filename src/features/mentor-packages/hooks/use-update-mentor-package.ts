import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateMentorPackageSchema, type UpdateMentorPackageFormValues } from '../validations'

export const useUpdateMentorPackage = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateMentorPackageFormValues>({
    defaultValues: {
      name: '',
      description: '',
      durationInMinutes: 0,
      totalSessions: '0',
      price: '0',
      currency: 'Vnd',
      isActive: true,
      position: 0
    },
    resolver: zodResolver(updateMentorPackageSchema(t))
  })

  const { mutate: updateMentorPackage, isPending: isUpdatingMentorPackage } = useMutation({
    mutationFn: mentorPackageService.updateMentorPackage,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.my() })
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.detail(variables.body.mentorPackageId) })
    }
  })

  return { methods, updateMentorPackage, isUpdatingMentorPackage }
}
