import { useMilestonePreferencesStore } from '@/lib/zustand/last-active-milestones.store'
import type { ParentMilestone } from '@/types/milestone.type'
import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useGetMyProjectPermissions } from './use-get-my-project-permissions'

interface UseProjectRoutingProps {
  identifier?: string
  items: ParentMilestone[]
  isLoading: boolean
}

export const useProjectRouting = ({ identifier, items, isLoading }: UseProjectRoutingProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { getLastActiveMilestone, setLastActiveMilestone } = useMilestonePreferencesStore()
  const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })
  const canRead = check('TASKS', 'canRead')

  const activeSegment = useMemo(() => {
    const parts = location.pathname.split('/')
    const projectIndex = parts.findIndex((p) => p === 'projects')
    if (projectIndex !== -1 && parts.length > projectIndex + 2) {
      return parts[projectIndex + 2]
    }
    return 'milestones'
  }, [location.pathname])

  const isProjectRoot =
    location.pathname === `/projects/${identifier}` || location.pathname === `/projects/${identifier}/`

  const isMilestonesRoot = location.pathname.endsWith('/milestones') || location.pathname.endsWith('/milestones/')

  const shouldDisplayTabs = activeSegment === 'milestones'

  // Renamed to reflect the use of slug
  const currentMilestoneSlug = shouldDisplayTabs ? location.pathname.split('/milestones/')[1]?.split('/')[0] : ''
  const activeTabValue = currentMilestoneSlug || items[0]?.slug || ''

  const handleTabChange = (milestoneSlug: string) => {
    if (identifier) {
      setLastActiveMilestone(identifier, milestoneSlug)
    }
    navigate({ pathname: `milestones/${milestoneSlug}`, search: window.location.search }, { replace: true })
  }

  // Auto-navigate to saved milestone or first milestone when landing on project or milestones root
  useEffect(() => {
    if (!isLoading && items.length > 0 && (isProjectRoot || isMilestonesRoot) && identifier) {
      if (!canRead) {
        navigate(`/projects/${identifier}/info`, { replace: true })
        return
      }

      const savedMilestoneSlug = getLastActiveMilestone(identifier)

      // Match against the slug rather than the ID
      const milestoneExists = savedMilestoneSlug && items.some((item) => item.slug === savedMilestoneSlug)

      // Use saved milestone if it exists, otherwise fall back to first milestone's slug
      const targetMilestoneSlug = milestoneExists ? savedMilestoneSlug : items[0].slug

      navigate({ pathname: `milestones/${targetMilestoneSlug}`, search: window.location.search }, { replace: true })
    }
  }, [isLoading, items, isProjectRoot, isMilestonesRoot, navigate, identifier, getLastActiveMilestone])

  return {
    activeSegment,
    isProjectRoot,
    isMilestonesRoot,
    shouldDisplayTabs,
    currentMilestoneSlug, // Exporting the new variable name
    activeTabValue,
    handleTabChange
  }
}
