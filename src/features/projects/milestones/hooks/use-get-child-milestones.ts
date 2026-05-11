import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import milestoneService from '../services'
import type { ChildMilestone } from '../types'

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
