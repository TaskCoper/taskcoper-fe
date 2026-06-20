import { useMutation, useQueryClient } from '@tanstack/react-query'
import recruitmentRequestService from '../services'

export const useReadRecruitmentRequest = () => {
  const queryClient = useQueryClient()

  const { mutate: readRecruitmentRequest, isPending: isMarkingAsRead } = useMutation({
    mutationFn: recruitmentRequestService.readRecruitmentRequest,
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-requests'] })
      queryClient.invalidateQueries({ queryKey: ['recruitment-request', id] })
    }
  })

  return { readRecruitmentRequest, isMarkingAsRead }
}
