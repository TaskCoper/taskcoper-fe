import type { ParentMilestone } from '@/types/milestone.type'
import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'

interface UseProjectRoutingProps {
  projectId?: string
  items: ParentMilestone[]
  isLoading: boolean
}

export const useProjectRouting = ({ projectId, items, isLoading }: UseProjectRoutingProps) => {
  const location = useLocation()
  const navigate = useNavigate()

  const activeSegment = useMemo(() => {
    const parts = location.pathname.split('/')
    const projectIndex = parts.findIndex((p) => p === 'projects')
    if (projectIndex !== -1 && parts.length > projectIndex + 2) {
      return parts[projectIndex + 2]
    }
    return 'milestones'
  }, [location.pathname])

  const isProjectRoot =
    location.pathname === `/projects/${projectId}` || location.pathname === `/projects/${projectId}/`

  const isMilestonesRoot = location.pathname.endsWith('/milestones') || location.pathname.endsWith('/milestones/')

  const shouldDisplayTabs = activeSegment === 'milestones'
  const currentMilestoneId = shouldDisplayTabs ? location.pathname.split('/milestones/')[1]?.split('/')[0] : ''
  const activeTabValue = currentMilestoneId || (items[0] as any)?.id || ''

  const handleTabChange = (milestoneId: string) => {
    navigate(`milestones/${milestoneId}`)
  }

  // Auto-navigate to first milestone when landing on project or milestones root
  useEffect(() => {
    if (!isLoading && items.length > 0 && (isProjectRoot || isMilestonesRoot)) {
      navigate(`milestones/${items[0].id}`, { replace: true })
    }
  }, [isLoading, items, isProjectRoot, isMilestonesRoot, navigate])

  return {
    activeSegment,
    isProjectRoot,
    isMilestonesRoot,
    shouldDisplayTabs,
    currentMilestoneId,
    activeTabValue,
    handleTabChange
  }
}
