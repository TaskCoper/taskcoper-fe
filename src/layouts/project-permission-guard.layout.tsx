import { Spinner } from '@/components/ui/spinner'
import { useGetMyProjectPermissions } from '@/features/projects/hooks/use-get-my-project-permissions'
import type { ActionKey, SectionExtensionsMap, SectionKey } from '@/types/project-permission.type'
import { Navigate, Outlet, useParams } from 'react-router'

interface ProjectPermissionGuardLayoutProps<K extends SectionKey = SectionKey, A extends ActionKey = ActionKey> {
  sectionKey: K
  action?: A
  extensionKey?: K extends keyof SectionExtensionsMap
    ? A extends keyof SectionExtensionsMap[K]
      ? keyof NonNullable<SectionExtensionsMap[K][A]>
      : never
    : never
  redirectTo?: string | ((identifier?: string) => string)
}

export default function ProjectPermissionGuardLayout({
  sectionKey,
  action,
  extensionKey,
  redirectTo
}: ProjectPermissionGuardLayoutProps) {
  const { identifier } = useParams<{ identifier: string }>()
  const { check, isLoadingPermissions } = useGetMyProjectPermissions({ projectIdentifier: identifier })
  const actionKey = action ?? 'canRead'
  const isAllowed = check(sectionKey, actionKey, extensionKey)

  if (isLoadingPermissions) {
    return (
      <div className='flex h-full w-full items-center justify-center py-20'>
        <Spinner className='text-muted-foreground' />
      </div>
    )
  }

  if (!isAllowed) {
    const resolvedRedirect = typeof redirectTo === 'function' ? redirectTo(identifier) : redirectTo

    if (resolvedRedirect) {
      return <Navigate to={resolvedRedirect} replace />
    }

    // if the user doesnt have permission to read the section, redirect to overview
    if (sectionKey === 'OVERVIEW') {
      return <Navigate to='/projects' replace />
    }

    // if the user can't even read overview (RARE), redirect to projects
    return <Navigate to={`/projects/${identifier}/info`} replace />
  }

  return <Outlet />
}
