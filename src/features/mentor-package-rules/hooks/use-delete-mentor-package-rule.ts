import { queryKeys } from '@/lib/query-keys'
import mentorPackageRuleService from '@/services/mentor-package-rule.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useDeleteMentorPackageRule = ({ mentorPackageId }: { mentorPackageId: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { mutate: deleteMentorPackageRule, isPending: isDeletingMentorPackageRule } = useMutation({
    mutationFn: mentorPackageRuleService.deleteMentorPackageRule,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.mentorPackages.detail(mentorPackageId)
      })
    }
  })

  return { deleteMentorPackageRule, isDeletingMentorPackageRule }
}
