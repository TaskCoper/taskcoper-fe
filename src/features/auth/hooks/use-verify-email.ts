import { queryKeys } from '@/lib/query-keys'
import userService from '@/services/user.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createVerifyEmailSchema, type VerifyEmailFormValues } from '../validations'

interface UseVerifyEmailProps {
  email: string
}

export const useVerifyEmail = ({ email }: UseVerifyEmailProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const verifyEmailMethods = useForm<VerifyEmailFormValues>({
    defaultValues: {
      email,
      code: ''
    },
    resolver: zodResolver(createVerifyEmailSchema(t))
  })

  const { mutate: verifyEmail, isPending: isVerifyingEmail } = useMutation({
    mutationFn: userService.verifyEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
      verifyEmailMethods.reset()
    },
    onError: (error) => {
      toast.error(error.response?.data.detail)
    }
  })

  return { verifyEmailMethods, verifyEmail, isVerifyingEmail }
}
