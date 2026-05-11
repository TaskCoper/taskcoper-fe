import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import userService from '../services'
import { changePasswordSchema, type ChangePasswordFormValues } from '../validations'

export const useChangePassword = () => {
  const { t } = useTranslation()

  const methods = useForm<ChangePasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: ''
    },
    resolver: zodResolver(changePasswordSchema(t))
  })

  const { mutate: changePassword, isPending: isChangingPassword } = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: (message) => {
      methods.reset()
      toast.success(message)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { methods, changePassword, isChangingPassword }
}
