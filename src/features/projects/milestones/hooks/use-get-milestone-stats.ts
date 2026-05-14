import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import milestoneService from '../services'

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
