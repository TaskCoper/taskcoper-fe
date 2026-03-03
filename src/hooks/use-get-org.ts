import { queryKeys } from '@/lib/query-keys'
import orgService from '@/services/org.service'
import { useQuery } from '@tanstack/react-query'

export const useGetOrg = ({ orgId }: { orgId?: string }) => {
  const { data: org = null, isLoading: isLoadingOrg } = useQuery({
    queryKey: queryKeys.organizations.detail(orgId),
    queryFn: () => orgService.getOrg({ orgId }),
    enabled: !!orgId
  })

  return { org, isLoadingOrg }
}
