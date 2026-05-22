import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import packageBookingService from '../services'
import type { PackageOutgoingRequest } from '../types'

export interface GetMyOutgoingRequestsParams {
  mentorPackageId?: string
  status?: string[]
  pageIndex?: number
  pageSize?: number
}

export const useGetMyOutgoingRequests = ({
  mentorPackageId,
  status,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE
}: GetMyOutgoingRequestsParams = {}) => {
  const {
    data: myOutgoingRequests = getDefaultPaginationResponse<PackageOutgoingRequest>(),
    isLoading: isMyOutgoingRequestsLoading
  } = useQuery({
    queryKey: queryKeys.mentorPackages.requests.myOutgoing({ mentorPackageId, status, pageIndex, pageSize }),
    queryFn: () => packageBookingService.getMyOutgoingRequests({ mentorPackageId, status, pageIndex, pageSize })
  })

  return { myOutgoingRequests, isMyOutgoingRequestsLoading }
}
