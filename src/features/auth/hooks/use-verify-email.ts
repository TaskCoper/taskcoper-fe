import { useAuthStore } from '@/lib/zustand/auth.store'
import userService from '@/services/user.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createVerifyEmailSchema, type VerifyEmailFormValues } from '../validations'

interface UseVerifyEmailProps {
  email: string
  onSuccess?: () => void
}

export const useVerifyEmail = ({ email, onSuccess }: UseVerifyEmailProps) => {
  const { t } = useTranslation()
  const { signIn } = useAuthStore()

  const verifyEmailMethods = useForm<VerifyEmailFormValues>({
    defaultValues: {
      email,
      code: ''
    },
    resolver: zodResolver(createVerifyEmailSchema(t))
  })

  const { mutate: verifyEmail, isPending: isVerifyingEmail } = useMutation({
    mutationFn: userService.verifyEmail,
    onSuccess: ({ accessToken, refreshToken }) => {
      signIn(accessToken, refreshToken)
      verifyEmailMethods.reset()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.response?.data.detail)
    }
  })

  return { verifyEmailMethods, verifyEmail, isVerifyingEmail }
}
