import { queryKeys } from '@/lib/query-keys'
import milestoneService from '@/services/milestone.service'
import { useQuery } from '@tanstack/react-query'

export interface GetMilestoneStatsParams {
  parentMilestoneIdentifier?: string
}

export const useGetMilestoneStats = ({ parentMilestoneIdentifier }: GetMilestoneStatsParams) => {
  const { data: milestoneStats, isLoading: isLoadingMilestoneStats } = useQuery({
    queryKey: queryKeys.milestones.stats(parentMilestoneIdentifier),
    queryFn: () => milestoneService.getMilestoneStats({ parentMilestoneIdentifier }),
    enabled: !!parentMilestoneIdentifier
  })

  return { milestoneStats, isLoadingMilestoneStats }
}
