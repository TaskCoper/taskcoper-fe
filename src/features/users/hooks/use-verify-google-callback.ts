import googleService from '@/services/google.service'
import { useMutation } from '@tanstack/react-query'

export const useVerifyGoogleCallback = () => {
  const {
    mutate: verifyGoogleCallback,
    isPending: isVerifyingGoogleCallback,
    isSuccess: isGoogleCallbackSuccess,
    isError: isGoogleCallbackError
  } = useMutation({
    mutationFn: googleService.verifyGoogleCallback
  })

  return { verifyGoogleCallback, isVerifyingGoogleCallback, isGoogleCallbackSuccess, isGoogleCallbackError }
}
