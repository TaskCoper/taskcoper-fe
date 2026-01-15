import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import notificationService from '@/services/notification.service'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import { useInfiniteQuery } from '@tanstack/react-query'

export interface GetMyNotificationsParams {
  pageIndex?: number
  pageSize?: number
  enabled?: boolean
}

export const useGetMyNotifications = ({
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true
}: GetMyNotificationsParams = {}) => {
  const { user } = useAuthStore()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: queryKeys.notifications.list(user?.UserId, pageSize),
    queryFn: ({ pageParam = DEFAULT_PAGE_INDEX }) =>
      notificationService.getMyNotifications({ pageIndex: pageParam, pageSize }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.value) return undefined

      const { pageIndex, totalCount, items } = lastPage.value
      const currentLoaded = (pageIndex - 1) * pageSize + items.length

      return currentLoaded < totalCount ? pageIndex + 1 : undefined
    },
    initialPageParam: 1,
    enabled
  })

  const notifications = data?.pages.flatMap((page) => page.value.items) || []
  const totalCount = data?.pages[0]?.value.totalCount || 0

  return {
    notifications,
    totalCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  }
}
