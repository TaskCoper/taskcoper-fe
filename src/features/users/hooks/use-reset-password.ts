import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import userService from '../services'
import { type ResetPasswordFormValues, resetPasswordSchema } from '../validations'

export const useResetPassword = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const methods = useForm<ResetPasswordFormValues>({
    defaultValues: {
      newPassword: ''
    },
    resolver: zodResolver(resetPasswordSchema(t))
  })

  const { mutate: resetPassword, isPending: isResettingPassword } = useMutation({
    mutationFn: userService.resetPassword,
    onSuccess: (message) => {
      methods.reset()
      toast.success(message)
      navigate('/projects')
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { methods, resetPassword, isResettingPassword }
}
