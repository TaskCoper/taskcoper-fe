import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import userService from '../services'
import type { Me } from '../types'
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
      domainIds: [],
      timeZone: null
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
      const me = queryClient.getQueryData<Me>(queryKeys.auth.me())

      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })

      if (me?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(me.slug), exact: true })
      }
    }
  })

  return { methods, updateMe, isUpdatingMe }
}
