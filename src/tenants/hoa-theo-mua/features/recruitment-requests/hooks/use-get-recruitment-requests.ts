import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import recruitmentRequestService from '../services'
import type { RecruitmentRequest } from '../types'

export interface RecruitmentRequestsParams {
  page?: number
  pageSize?: number
  isRead?: boolean
}

export const useGetRecruitmentRequests = ({
  page = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
  isRead
}: RecruitmentRequestsParams = {}) => {
  const {
    data: recruitmentRequests = getDefaultPaginationResponse<RecruitmentRequest>(),
    isLoading: isLoadingRecruitmentRequests
  } = useQuery({
    queryKey: ['recruitment-requests', page, pageSize, isRead],
    queryFn: () => recruitmentRequestService.getRecruitmentRequests({ page, pageSize, isRead })
  })

  return { recruitmentRequests, isLoadingRecruitmentRequests }
}
