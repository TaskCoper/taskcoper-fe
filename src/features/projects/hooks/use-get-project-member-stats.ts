import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { ProjectMemberStats } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'

export const useGetProjectMemberStats = ({
  projectIdentifier,
  parentMilestoneIdentifier
}: {
  projectIdentifier: string
  parentMilestoneIdentifier?: string
}) => {
  const {
    data: projectMemberStats = getDefaultPaginationResponse<ProjectMemberStats>(),
    isLoading: isLoadingProjectMemberStats
  } = useQuery({
    queryKey: queryKeys.projects.memberStats(projectIdentifier, parentMilestoneIdentifier),
    queryFn: () => projectService.getProjectMemberStats({ projectIdentifier, parentMilestoneIdentifier }),
    enabled: !!projectIdentifier
  })

  return { projectMemberStats, isLoadingProjectMemberStats }
}
