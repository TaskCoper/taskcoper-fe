import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectMemberStats } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectMemberStats = ({
  projectId,
  parentMilestoneId
}: {
  projectId: string
  parentMilestoneId?: string
}) => {
  const {
    data: projectMemberStats = getDefaultPaginationResponse<ProjectMemberStats>(),
    isLoading: isLoadingProjectMemberStats
  } = useQuery({
    queryKey: queryKeys.projects.memberStats(projectId, parentMilestoneId),
    queryFn: () => projectService.getProjectMemberStats({ projectId, parentMilestoneId }),
    enabled: !!projectId
  })

  return { projectMemberStats, isLoadingProjectMemberStats }
}
