import { Spinner } from '@/components/ui/spinner'
import { useGetMyProjectPermissions } from '@/features/projects/hooks/use-get-my-project-permissions'
import { type SectionKey } from '@/types/project.type'
import { Navigate, Outlet, useParams } from 'react-router'

interface ProjectPermissionGuardLayoutProps {
  sectionKey: SectionKey
}

export default function ProjectPermissionGuardLayout({ sectionKey }: ProjectPermissionGuardLayoutProps) {
  const { identifier } = useParams<{ identifier: string }>()
  const { can, isLoadingPermissions } = useGetMyProjectPermissions({ projectIdentifier: identifier })

  if (isLoadingPermissions) {
    return (
      <div className='flex h-full w-full items-center justify-center py-20'>
        <Spinner className='text-muted-foreground' />
      </div>
    )
  }

  if (!can(sectionKey, 'canRead')) {
    // if the user doesnt have permission to read the section, redirect to overview
    if (sectionKey === 'OVERVIEW') {
      return <Navigate to='/projects' replace />
    }

    // if the user can't even read overview (RARE), redirect to projects
    return <Navigate to={`/projects/${identifier}/info`} replace />
  }

  return <Outlet />
}
