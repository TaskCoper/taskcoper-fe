import { useGetMyProjectPermissions } from '@/features/projects/roles/hooks/use-get-my-project-permissions'
import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import projectService from '../services'
import type { ParentMilestone } from '../types'

export const useGetParentMilestones = ({ identifier, enabled = true }: { identifier?: string; enabled?: boolean }) => {
  const { check, permissions } = useGetMyProjectPermissions({ projectIdentifier: identifier })
  const canRead = check('TASKS', 'canRead')

  const {
    data: parentMilestones = getDefaultPaginationResponse<ParentMilestone>(),
    isLoading: isLoadingParentMilestones
  } = useQuery({
    queryKey: queryKeys.projects.parentMilestones(identifier),
    queryFn: () => projectService.getParentMilestones({ identifier }),
    enabled: !!identifier && enabled && !!permissions && canRead
  })

  return { parentMilestones, isLoadingParentMilestones }
}
