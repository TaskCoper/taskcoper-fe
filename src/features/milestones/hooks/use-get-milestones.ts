import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export interface GetMilestonesParams {
  enabled?: boolean
  projectId?: string
  parentMilestoneId?: string
}

export const useGetMilestones = ({ projectId, parentMilestoneId, enabled = true }: GetMilestonesParams) => {
  const { data: milestones, isLoading: isLoadingMilestones } = useQuery({
    queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId),
    queryFn: () => projectService.getMilestones({ projectId, parentMilestoneId }),
    enabled: enabled && !!projectId && !!parentMilestoneId
  })

  return { milestones, isLoadingMilestones }
}
