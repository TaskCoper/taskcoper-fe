import { queryKeys } from '@/lib/query-keys'
import mentorPackageService from '@/services/mentor-package.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useDeleteMentorPackage = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteMentorPackage, isPending: isDeletingMentorPackage } = useMutation({
    mutationFn: mentorPackageService.deleteMentorPackage,
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

  return { deleteMentorPackage, isDeletingMentorPackage }
}
