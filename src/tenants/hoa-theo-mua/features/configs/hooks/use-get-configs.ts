import { useQuery } from '@tanstack/react-query'
import configSystemService from '../services'
import type { ConfigRecord } from '../types'

export const CONFIG_RECORDS_QUERY_KEY = ['htm-config-records']

export const useGetConfigs = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: [...CONFIG_RECORDS_QUERY_KEY, 'list'],
    queryFn: () => configSystemService.getConfigRecords({ pageSize: 100 }),
    throwOnError: false
  })

  return {
    configs: (data?.value?.items ?? []) as ConfigRecord[],
    totalCount: data?.value?.totalCount ?? 0,
    isLoadingConfigs: isLoading,
    refetchConfigs: refetch
  }
}
