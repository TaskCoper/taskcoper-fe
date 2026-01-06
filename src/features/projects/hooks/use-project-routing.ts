import { useMilestonePreferencesStore } from '@/lib/zustand/last-active-milestones.store'
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
  const { getLastActiveMilestone, setLastActiveMilestone } = useMilestonePreferencesStore()

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
    if (projectId) {
      setLastActiveMilestone(projectId, milestoneId)
    }
    navigate(`milestones/${milestoneId}`)
  }

  // Auto-navigate to saved milestone or first milestone when landing on project or milestones root
  useEffect(() => {
    if (!isLoading && items.length > 0 && (isProjectRoot || isMilestonesRoot) && projectId) {
      const savedMilestoneId = getLastActiveMilestone(projectId)
      const milestoneExists = savedMilestoneId && items.some((item) => item.id === savedMilestoneId)

      // Use saved milestone if it exists, otherwise fall back to first milestone
      const targetMilestoneId = milestoneExists ? savedMilestoneId : items[0].id

      navigate(`milestones/${targetMilestoneId}`, { replace: true })
    }
  }, [isLoading, items, isProjectRoot, isMilestonesRoot, navigate, projectId, getLastActiveMilestone])

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
