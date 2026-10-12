import { useQuery } from '@tanstack/react-query'
import configService from '../services'
import { configKeys } from '../query-keys'

export const useGetOrderTags = () => {
  const query = useQuery({
    queryKey: configKeys.orderTags(),
    queryFn: configService.getOrderTagsConfig,
    throwOnError: false
  })

  return {
    orderTagsConfig: query.data,
    isGettingOrderTags: query.isLoading,
    isOrderTagsError: query.isError,
    refetchOrderTags: query.refetch
  }
}
