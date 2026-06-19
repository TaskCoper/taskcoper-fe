import { useQuery } from '@tanstack/react-query'
import recruitmentRequestService from '../services'

export const useGetRecruitmentRequest = ({ id }: { id?: string }) => {
  const { data: recruitmentRequest, isLoading: isGettingRecruitmentRequest } = useQuery({
    queryKey: ['recruitment-request', id],
    queryFn: () => recruitmentRequestService.getRecruitmentRequest({ id }),
    enabled: !!id
  })

  return { recruitmentRequest, isGettingRecruitmentRequest }
}
