import userService from '@/services/user.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { createVerifyEmailSchema, type VerifyEmailFormValues } from '../validations'

interface UseVerifyEmailProps {
  email: string
  onSuccess?: () => void
}

export const useVerifyEmail = ({ email, onSuccess }: UseVerifyEmailProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const verifyEmailMethods = useForm<VerifyEmailFormValues>({
    defaultValues: {
      email,
      code: ''
    },
    resolver: zodResolver(createVerifyEmailSchema(t))
  })

  const { mutate: verifyEmail, isPending: isVerifyEmailPending } = useMutation({
    mutationFn: userService.verifyEmail,
    onSuccess: (message) => {
      toast.success(message)
      navigate('/sign-in')
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.response?.data.detail)
    }
  })

  return { verifyEmailMethods, verifyEmail, isVerifyEmailPending }
}
