import { queryKeys } from '@/lib/query-keys'
import milestoneService from '@/services/milestone.service'
import { useQuery } from '@tanstack/react-query'

export interface GetMilestoneStatsParams {
  parentMilestoneId?: string
}

export const useGetMilestoneStats = ({ parentMilestoneId }: GetMilestoneStatsParams) => {
  const { data: milestoneStats, isLoading: isLoadingMilestoneStats } = useQuery({
    queryKey: queryKeys.milestones.stats(parentMilestoneId),
    queryFn: () => milestoneService.getMilestoneStats({ parentMilestoneId }),
    enabled: !!parentMilestoneId
  })

  return { milestoneStats, isLoadingMilestoneStats }
}
