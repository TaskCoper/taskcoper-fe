import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import userService from '../services'
import type { User } from '../types'

export interface GetUsersParams {
  searchTerm?: string
  pageIndex?: number
  pageSize?: number
  enabled?: boolean
  sortBy?: string
  organizationId?: string[]
  domainId?: string[]
  roles?: string[]
}

export const useGetUsers = ({
  searchTerm,
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = 5,
  enabled = true,
  sortBy,
  organizationId,
  domainId,
  roles
}: GetUsersParams = {}) => {
  const {
    data: users = getDefaultPaginationResponse<User>(),
    isLoading: isLoadingUsers,
    isError: isErrorUsers
  } = useQuery({
    queryKey: queryKeys.users.list({ searchTerm, pageIndex, pageSize, sortBy, organizationId, domainId, roles }),
    queryFn: () => userService.getUsers({ searchTerm, pageIndex, pageSize, sortBy, organizationId, domainId, roles }),
    enabled
  })

  return { users, isLoadingUsers, isErrorUsers }
}
