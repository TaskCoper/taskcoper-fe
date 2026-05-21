import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import packageBookingService from '../services'

export const useGetRequest = ({ requestId, enabled = true }: { requestId?: string; enabled?: boolean }) => {
  const { data: request, isLoading: isLoadingRequest } = useQuery({
    queryKey: queryKeys.mentorPackages.requests.detail(requestId),
    queryFn: () => packageBookingService.getRequest({ requestId }),
    enabled: !!requestId && enabled
  })

  return { request, isLoadingRequest }
}
