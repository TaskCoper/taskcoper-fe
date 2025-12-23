import { useAuthStore } from '@/lib/zustand/auth.store'
import userService from '@/services/user.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { createSignInSchema, type SignInFormValues } from '../validations'

export const useSignIn = () => {
  const { t } = useTranslation()
  const { signIn: signInAuth } = useAuthStore()
  const navigate = useNavigate()

  const signInMethods = useForm<SignInFormValues>({
    defaultValues: {
      email: '',
      password: ''
    },
    resolver: zodResolver(createSignInSchema(t))
  })

  const { mutate: signIn, isPending: isSignInPending } = useMutation({
    mutationFn: userService.signIn,
    onSuccess: (data) => {
      signInAuth(data.accessToken, data.refreshToken)
      signInMethods.reset()
      navigate('/projects')
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    }
  })

  return { signInMethods, isSignInPending, signIn }
}
