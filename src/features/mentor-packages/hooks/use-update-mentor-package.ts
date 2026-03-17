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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.my() })
    }
  })

  return { methods, updateMentorPackage, isUpdatingMentorPackage }
}
