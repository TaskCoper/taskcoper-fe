import { queryKeys } from '@/lib/query-keys'
import milestoneService from '../services'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ChildMilestone } from '@/types/milestone.type'
import { useQuery } from '@tanstack/react-query'

interface GetChildMilestonesParams {
  parentMilestoneIdentifier?: string
  enabled?: boolean
}

export const useGetChildMilestones = ({ parentMilestoneIdentifier, enabled = true }: GetChildMilestonesParams) => {
  const {
    data: childMilestones = getDefaultPaginationResponse<ChildMilestone>(),
    isLoading: isLoadingChildMilestones
  } = useQuery({
    queryKey: queryKeys.milestones.childMilestones(parentMilestoneIdentifier),
    queryFn: () => milestoneService.getChildMilestones({ parentMilestoneIdentifier }),
    enabled: !!parentMilestoneIdentifier && enabled
  })

  return { childMilestones, isLoadingChildMilestones }
}
