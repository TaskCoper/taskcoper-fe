import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import mentorPackageService from '../services'

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
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.allMy() })
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.lists() })
      queryClient.invalidateQueries({
        queryKey: queryKeys.mentorPackages.detail(variables.mentorPackageId),
        exact: true
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.pinStatistics() })
    }
  })

  return { deleteMentorPackage, isDeletingMentorPackage }
}
