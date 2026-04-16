import { queryKeys } from '@/lib/query-keys'
import userService from '@/services/user.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { type UpdateMeFormValues, updateMeSchema } from '../validations'

export const useUpdateMe = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const methods = useForm<UpdateMeFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      avatar: '',
      phoneNumber: '',
      address: '',
      city: '',
      cityCode: -1,
      state: '',
      wardCode: -1,
      domainIds: []
    },
    resolver: zodResolver(updateMeSchema(t))
  })

  const { mutate: updateMe, isPending: isUpdatingMe } = useMutation({
    mutationFn: userService.updateMe,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    }
  })

  return { methods, updateMe, isUpdatingMe }
}
