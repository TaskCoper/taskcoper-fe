import { useQuery } from '@tanstack/react-query'
import { configKeys } from '../query-keys'
import configService from '../services'
import { ConfigKind, type GetConfigsParams } from '../types'

interface GetSettingConfigsProps extends GetConfigsParams {
  enabled?: boolean
}

export const useGetSettingConfigs = ({ groupName, key, enabled = true }: GetSettingConfigsProps = {}) => {
  const query = useQuery({
    queryKey: configKeys.list(ConfigKind.setting, { groupName, key }),
    queryFn: () => configService.getSettingConfigs({ groupName, key }),
    enabled,
    throwOnError: false
  })

  return {
    settingConfigs: query.data,
    isGettingSettingConfigs: query.isLoading,
    isSettingConfigsError: query.isError,
    settingConfigsError: query.error,
    refetchSettingConfigs: query.refetch
  }
}
