import userService from '@/features/users/services'
import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { createSignInSchema, type SignInFormValues } from '../validations'

export const useSignIn = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const signInMethods = useForm<SignInFormValues>({
    defaultValues: {
      email: '',
      password: ''
    },
    resolver: zodResolver(createSignInSchema(t))
  })

  const { mutate: signIn, isPending: isSigningIn } = useMutation({
    mutationFn: userService.signIn,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.me() })
      navigate('/redirect', { replace: true })
      signInMethods.reset()
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { signInMethods, isSigningIn, signIn }
}
