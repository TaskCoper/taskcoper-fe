import { useQuery } from '@tanstack/react-query'
import { normalizeConfigRecord } from '../config-utils'
import configSystemService from '../services'

export const CONFIG_RECORDS_QUERY_KEY = ['htm-config-records']

export const useGetConfigs = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: [...CONFIG_RECORDS_QUERY_KEY, 'list'],
    queryFn: () => configSystemService.getConfigRecords({ pageSize: 100 }),
    throwOnError: false
  })

  return {
    configs: (data?.value?.items ?? []).map(normalizeConfigRecord),
    totalCount: data?.value?.totalCount ?? 0,
    isLoadingConfigs: isLoading,
    refetchConfigs: refetch
  }
}
