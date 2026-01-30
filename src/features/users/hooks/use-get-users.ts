import { queryKeys } from '@/lib/query-keys'
import userService from '@/services/user.service'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { User } from '@/types/user.type'
import { useQuery } from '@tanstack/react-query'

export interface GetUsersParams {
  searchTerm?: string
  pageIndex?: number
  pageSize?: number
  enabled?: boolean
  sortBy?: string
  organizationId?: string[]
  domainId?: string[]
}

export const useGetUsers = ({
  searchTerm,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = 5,
  enabled = true,
  sortBy,
  organizationId,
  domainId
}: GetUsersParams = {}) => {
  const {
    data: users = getDefaultPaginationResponse<User>(),
    isLoading: isLoadingUsers,
    isError: isErrorUsers
  } = useQuery({
    queryKey: queryKeys.users.list({ searchTerm, pageIndex, pageSize, sortBy, organizationId, domainId }),
    queryFn: () => userService.getUsers({ searchTerm, pageIndex, pageSize, sortBy, organizationId, domainId }),
    enabled
  })

  return { users, isLoadingUsers, isErrorUsers }
}
