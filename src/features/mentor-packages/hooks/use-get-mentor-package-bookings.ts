import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import mentorPackageService from '../services'
import type { MentorPackageBooking } from '../types'

export interface GetMentorPackageBookingsParams {
  mentorPackageId?: string
  status?: string
  pageIndex?: number
  pageSize?: number
  sortBy?: string
}

export const useGetMentorPackageBookings = ({
  mentorPackageId,
  status,
  pageIndex,
  pageSize,
  sortBy
}: GetMentorPackageBookingsParams) => {
  const {
    data: mentorPackageBookings = getDefaultPaginationResponse<MentorPackageBooking>(),
    isLoading: isLoadingMentorPackageBookings
  } = useQuery({
    queryKey: queryKeys.mentorPackages.bookings({ mentorPackageId, pageIndex, pageSize, sortBy, status }),
    queryFn: () =>
      mentorPackageService.getMentorPackageBookings({
        mentorPackageId,
        status,
        pageIndex,
        pageSize,
        sortBy
      }),
    enabled: !!mentorPackageId
  })

  return { mentorPackageBookings, isLoadingMentorPackageBookings }
}
