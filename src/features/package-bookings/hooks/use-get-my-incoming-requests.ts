import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import packageBookingService from '../services'
import type { PackageIncomingRequest } from '../types'

export interface GetMyIncomingRequestsParams {
  mentorPackageId?: string
  status?: string
  pageIndex?: number
  pageSize?: number
  searchTerm?: string
}

export const useGetMyIncomingRequests = ({
  mentorPackageId,
  status,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  searchTerm
}: GetMyIncomingRequestsParams = {}) => {
  const {
    data: packageIncomingRequests = getDefaultPaginationResponse<PackageIncomingRequest>(),
    isLoading: isLoadingPackageRequests
  } = useQuery({
    queryKey: queryKeys.mentorPackages.requests.myIncoming({
      mentorPackageId,
      status,
      pageIndex,
      pageSize,
      searchTerm
    }),
    queryFn: () =>
      packageBookingService.getMyIncomingRequests({ mentorPackageId, status, pageIndex, pageSize, searchTerm })
  })

  return {
    packageIncomingRequests,
    isLoadingPackageRequests
  }
}
