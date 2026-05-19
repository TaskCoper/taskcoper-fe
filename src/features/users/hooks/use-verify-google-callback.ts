import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { queryKeys } from '@/lib/query-keys'
import googleService from '@/services/google.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useVerifyGoogleCallback = () => {
  const queryClient = useQueryClient()
  const { me } = useGetMe()

  const {
    mutate: verifyGoogleCallback,
    isPending: isVerifyingGoogleCallback,
    isSuccess: isGoogleCallbackSuccess,
    isError: isGoogleCallbackError
  } = useMutation({
    mutationFn: googleService.verifyGoogleCallback,
    onSettled: () => {
      if (me?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(me.slug), exact: true })
      }
    }
  })

  return { verifyGoogleCallback, isVerifyingGoogleCallback, isGoogleCallbackSuccess, isGoogleCallbackError }
}
