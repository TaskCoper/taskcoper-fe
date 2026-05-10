import { queryKeys } from '@/lib/query-keys'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import projectRoleService from '../services'
import type { ActionKey, SectionExtensionsMap, SectionKey } from '../types'

export const useGetMyProjectPermissions = ({ projectIdentifier }: { projectIdentifier?: string }) => {
  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: queryKeys.projects.myPermissions(projectIdentifier),
    queryFn: () => projectRoleService.getMyProjectPermissions({ projectIdentifier }),
    enabled: !!projectIdentifier,
    staleTime: 5 * 60 * 1000,
    select: (data) => {
      if (!data) return data
      return {
        ...data,
        sections: data.sections.map((section) => ({
          ...section,
          extensions: typeof section.extensions === 'string' ? JSON.parse(section.extensions) : section.extensions
        })) as typeof data.sections
      }
    }
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

  const getExtensions = useCallback(
    <K extends SectionKey, E extends K extends keyof SectionExtensionsMap ? keyof SectionExtensionsMap[K] : never>(
      sectionKey: K,
      extensionKey: E
    ): (K extends keyof SectionExtensionsMap ? SectionExtensionsMap[K][E] : never) | null => {
      if (!permissions?.sections) return null

      const section = permissions.sections.find((s) => s.sectionKey === sectionKey)
      if (!section || !section.extensions) return null

      const parsed = section.extensions as K extends keyof SectionExtensionsMap ? SectionExtensionsMap[K] : never
      return (parsed[extensionKey] ?? null) as
        | (K extends keyof SectionExtensionsMap ? SectionExtensionsMap[K][E] : never)
        | null
    },
    [permissions]
  )

  const check = useCallback(
    <
      K extends SectionKey,
      P extends ActionKey,
      A extends K extends keyof SectionExtensionsMap
        ? P extends keyof SectionExtensionsMap[K]
          ? keyof NonNullable<SectionExtensionsMap[K][P]>
          : never
        : never
    >(
      sectionKey: K,
      parentAction: P,
      action?: A
    ): boolean => {
      // take the top-level permission
      const topLevelPermission = can(sectionKey, parentAction)

      // if no specific action is provided, return the top-level permission
      if (!topLevelPermission || !action) return topLevelPermission

      // get the section extensions
      const section = permissions?.sections?.find((s) => s.sectionKey === sectionKey)

      // if no extensions, return the top-level permission
      if (!section?.extensions) return topLevelPermission

      // get the specific override
      const ext = section.extensions as unknown as Record<string, Record<string, boolean>>
      const specificOverride = ext[parentAction as string]?.[action as string]

      // return the specific override if it exists, otherwise return the top-level permission
      return (specificOverride as boolean) ?? topLevelPermission
    },
    [can, permissions]
  )

  return {
    permissions,
    isLoadingPermissions,
    can,
    hasRole,
    getExtensions,
    check
  }
}
