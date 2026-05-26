import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import packageBookingService from '../services'

export const useGetOutgoingRequest = ({ requestId }: { requestId?: string }) => {
  const { data: outgoingRequest, isLoading: isOutgoingRequestLoading } = useQuery({
    queryKey: queryKeys.mentorPackages.requests.detailOutgoing(requestId),
    queryFn: () => packageBookingService.getOutgoingRequest({ requestId }),
    enabled: !!requestId
  })

  return { outgoingRequest, isOutgoingRequestLoading }
}
