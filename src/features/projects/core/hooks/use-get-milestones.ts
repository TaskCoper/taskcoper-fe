import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import projectService from '../services'

export interface GetMilestonesParams {
  enabled?: boolean
  projectIdentifier?: string
  parentMilestoneIdentifier?: string
}

export const useGetMilestones = ({
  projectIdentifier,
  parentMilestoneIdentifier,
  enabled = true
}: GetMilestonesParams) => {
  const { data: milestones, isLoading: isLoadingMilestones } = useQuery({
    queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier),
    queryFn: () => projectService.getMilestones({ projectIdentifier, parentMilestoneIdentifier }),
    enabled: enabled && !!projectIdentifier && !!parentMilestoneIdentifier
  })

  return { milestones, isLoadingMilestones }
}
