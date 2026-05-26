import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import mentorPackageRuleService from '../services'
import { updateMentorPackageRuleSchema, type UpdateMentorPackageRuleFormValues } from '../validations'

export const useUpdateMentorPackageRule = ({ mentorPackageId }: { mentorPackageId: string }) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateMentorPackageRuleFormValues>({
    resolver: zodResolver(updateMentorPackageRuleSchema(t))
  })

  const { mutate: updateMentorPackageRule, isPending: isUpdatingMentorPackageRule } = useMutation({
    mutationFn: mentorPackageRuleService.updateMentorPackageRule,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      if (mentorPackageId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.mentorPackages.detail(mentorPackageId) })
      }
    }
  })

  return { methods, updateMentorPackageRule, isUpdatingMentorPackageRule }
}
