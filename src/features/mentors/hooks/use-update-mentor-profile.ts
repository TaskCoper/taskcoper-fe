import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import mentorService from '../services'
import { updateMentorProfileSchema, type UpdateMentorProfileFormValues } from '../validations'

export const useUpdateMentorProfile = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const methods = useForm<UpdateMentorProfileFormValues>({
    resolver: zodResolver(updateMentorProfileSchema(t))
  })

  const { mutate: updateMentorProfile, isPending: isUpdatingMentorProfile } = useMutation({
    mutationFn: mentorService.updateMentorProfile,
    onSuccess: (message) => {
      toast(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.body.userIdentifier) })
    }
  })

  return { methods, updateMentorProfile, isUpdatingMentorProfile }
}
