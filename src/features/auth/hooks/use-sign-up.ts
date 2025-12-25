import userService from '@/services/user.service'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createSignUpSchema, type SignUpFormValues } from '../validations'

export const useSignUp = () => {
  const [stage, setStage] = useState<'signUp' | 'verifyEmail'>('signUp')

  const { t } = useTranslation()

  const signUpMethods = useForm<SignUpFormValues>({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: '0'
    },
    resolver: zodResolver(createSignUpSchema(t))
  })

  const { mutate: signUp, isPending: isSigningUp } = useMutation({
    mutationFn: userService.signUp,
    onSuccess: () => {
      setStage('verifyEmail')
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
      setStage('signUp')
    }
  })

  return { signUpMethods, signUp, isSigningUp, stage, setStage }
}
