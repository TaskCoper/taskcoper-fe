import { useAuthStore, type UserPayload } from '@/lib/zustand/auth.store'
import userService from '@/services/user.service'
import { getUserType } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
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

  const { mutate: signIn, isPending: isSigningIn } = useMutation({
    mutationFn: userService.signIn,
    onSuccess: (data) => {
      signInAuth(data.accessToken, data.refreshToken)
      const user = jwtDecode<UserPayload>(data.accessToken)
      const userType = getUserType(user)

      if (user.IsVerified === 'false') {
        navigate('/')
      } else if (userType === 'superAdmin') {
        navigate('/dashboard', { replace: true })
      } else if (userType === 'orgAdmin') {
        navigate('/manage', { replace: true })
      } else {
        navigate('/projects', { replace: true })
      }

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
