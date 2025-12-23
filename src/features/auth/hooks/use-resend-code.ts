import userService from '@/services/user.service'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useResendCode = () => {
  const { mutate: resendCode, isPending: isResendCodePending } = useMutation({
    mutationFn: userService.resendCode,
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error) => {
      toast.error(error.response?.data.detail)
    }
  })

  return { resendCode, isResendCodePending }
}
