import userService from '@/features/users/services'
import { clearAllUserPreferences } from '@/shared/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

export const useSignOut = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate: signOut, isPending: isSigningOut } = useMutation({
    mutationFn: userService.signOut,
    onSuccess: () => {
      clearAllUserPreferences()
      navigate('/sign-in', { replace: true })
      queryClient.clear()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail)
    }
  })

  return { signOut, isSigningOut }
}
