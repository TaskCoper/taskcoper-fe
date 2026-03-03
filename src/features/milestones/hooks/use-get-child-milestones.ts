import { queryKeys } from '@/lib/query-keys'
import milestoneService from '@/services/milestone.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ChildMilestone } from '@/types/milestone.type'
import { useQuery } from '@tanstack/react-query'

interface GetChildMilestonesParams {
  parentMilestoneId?: string
  enabled?: boolean
}

export const useGetChildMilestones = ({ parentMilestoneId, enabled = true }: GetChildMilestonesParams) => {
  const {
    data: childMilestones = getDefaultPaginationResponse<ChildMilestone>(),
    isLoading: isLoadingChildMilestones
  } = useQuery({
    queryKey: queryKeys.milestones.childMilestones(parentMilestoneId),
    queryFn: () => milestoneService.getChildMilestones({ parentMilestoneId }),
    enabled: !!parentMilestoneId && enabled
  })

  return { childMilestones, isLoadingChildMilestones }
}
