import projectService from '@/services/project.service'
import { useQuery } from '@tanstack/react-query'

export interface GetMilestonesParams {
  projectId?: string
  parentMilestoneId?: string
}

export const useGetMilestones = ({ projectId, parentMilestoneId }: GetMilestonesParams) => {
  const {
    data: milestones,
    isLoading: isLoadingMilestones,
    error
  } = useQuery({
    queryKey: ['milestones', projectId, parentMilestoneId],
    queryFn: () => projectService.getMilestones({ projectId, parentMilestoneId }),
    enabled: !!projectId && !!parentMilestoneId
  })

  return { milestones, isLoadingMilestones, error }
}
