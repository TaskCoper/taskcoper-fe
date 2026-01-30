import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ParentMilestone } from '@/types/milestone.type'
import { useQuery } from '@tanstack/react-query'

export const useGetParentMilestones = ({ projectId, enabled = true }: { projectId?: string; enabled?: boolean }) => {
  const {
    data: parentMilestones = getDefaultPaginationResponse<ParentMilestone>(),
    isLoading: isLoadingParentMilestones,
    error
  } = useQuery({
    queryKey: queryKeys.projects.parentMilestones(projectId),
    queryFn: () => projectService.getParentMilestones({ projectId }),
    enabled: !!projectId && enabled
  })

  return { parentMilestones, isLoadingParentMilestones, error }
}
