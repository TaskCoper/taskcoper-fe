import { queryKeys } from '@/lib/query-keys'
import roleService from '@/services/role.service'
import { useQuery } from '@tanstack/react-query'

export const useGetRoleStats = () => {
  const { data: roleStats = [], isLoading: isLoadingRoleStats } = useQuery({
    queryKey: queryKeys.roles.stats(),
    queryFn: roleService.getRoleStats
  })

  return { roleStats, isLoadingRoleStats }
}
