import { useAuthStore } from '@/lib/zustand/auth.store'
import { useMilestonePreferencesStore } from '@/lib/zustand/last-active-milestones.store'
import userService from '@/services/user.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useSignOut = () => {
  const queryClient = useQueryClient()

  const { signOut: signOutAuth } = useAuthStore()
  const { clearAll: clearMilestonePreferences } = useMilestonePreferencesStore()

  const { mutate: signOut, isPending: isSigningOut } = useMutation({
    mutationFn: userService.signOut,
    onSuccess: () => {
      signOutAuth()
      clearMilestonePreferences()
      queryClient.clear()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail)
    }
  })

  return { signOut, isSigningOut }
}
