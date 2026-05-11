import userService from '@/features/users/services'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useResendCode = () => {
  const { mutate: resendCode, isPending: isResendingCode } = useMutation({
    mutationFn: userService.resendCode,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(error.response?.data.detail)
    }
  })

  return { resendCode, isResendingCode }
}
