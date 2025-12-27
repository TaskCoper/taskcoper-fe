import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ParentMilestone } from '@/types/milestone.type'
import { useQuery } from '@tanstack/react-query'

export const useGetParentMilestones = ({ projectId }: { projectId?: string }) => {
  const {
    data: parentMilestones = {
      ...getDefaultPaginationResponse<ParentMilestone>()
    },
    isLoading,
    error
  } = useQuery({
    queryKey: ['parent-milestones', projectId],
    queryFn: () => projectService.getParentMilestones({ projectId }),
    enabled: !!projectId
  })

  return { parentMilestones, isLoading, error }
}
