import { queryKeys } from '@/lib/query-keys'
import projectService from '@/services/project.service'
import type { ActionKey, SectionKey } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

export const useGetMyProjectPermissions = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const {
    data: permissions,
    isLoading: isLoadingPermissions,
    error
  } = useQuery({
    queryKey: queryKeys.projects.myPermissions(projectIdentifier),
    queryFn: () => projectService.getMyProjectPermissions({ projectIdentifier }),
    enabled: !!projectIdentifier,
    staleTime: 5 * 60 * 1000
  })

  const can = useCallback(
    (sectionKey: SectionKey, action: ActionKey): boolean => {
      if (!permissions?.sections) return false

      const section = permissions.sections.find((s) => s.sectionKey === sectionKey)
      return section ? section[action] : false
    },
    [permissions]
  )

  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!permissions?.effectiveRoleNames) return false

      return permissions.effectiveRoleNames.includes(roleName)
    },
    [permissions]
  )

  const getExtension = useCallback(
    <T>(sectionKey: SectionKey, extensionKey: string): T | null => {
      if (!permissions?.sections) return null

      const section = permissions.sections.find((s) => s.sectionKey === sectionKey)
      if (!section || !section.extensions) return null

      return (section.extensions[extensionKey] as T) ?? null
    },
    [permissions]
  )

  return {
    permissions,
    isLoadingPermissions,
    error,
    can,
    hasRole,
    getExtension
  }
}
