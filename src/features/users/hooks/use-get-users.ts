import userService from '@/services/user.service'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { User } from '@/types/user.type'
import { useQuery } from '@tanstack/react-query'

export interface GetUsersParams {
  searchTerm?: string
  pageIndex?: number
  pageSize?: number
}

export const useGetUsers = ({ searchTerm, pageIndex = DEFAULT_PAGE_INDEX, pageSize = 5 }: GetUsersParams) => {
  const {
    data: users = {
      ...getDefaultPaginationResponse<User>()
    },
    isLoading: isLoadingUsers,
    isError: isErrorUsers
  } = useQuery({
    queryKey: ['users', searchTerm, pageIndex, pageSize],
    queryFn: () => userService.getUsers({ searchTerm, pageIndex, pageSize }),
    enabled: !!searchTerm
  })

  return { users, isLoadingUsers, isErrorUsers }
}
