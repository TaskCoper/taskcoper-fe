import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import ProjectStorageTable from '@/features/projects/components/project-storage-table'
import { useGetProject } from '@/features/projects/hooks/use-get-project'
import { useGetProjectResourceStats } from '@/features/projects/hooks/use-get-project-resource-stats'
import { formatBytes } from '@/features/projects/utils'
import { DatabaseIcon, FilesIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useParams } from 'react-router'

export default function ProjectStoragePage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()

  const { projectResourceStats, isLoadingProjectResourceStats } = useGetProjectResourceStats({ projectId })

  const { project } = useGetProject({
    projectId
  })

  useEffect(() => {
    if (project) {
      document.title = `${project?.name} | TaskCoper`
    }
  }, [project])

  return (
    <>
      <div className='mx-auto p-6 space-y-6'>
        <div className='flex justify-between items-center gap-4'>
          <div>
            <p className='text-2xl font-bold tracking-tight'>{t('project.sidebar.storagePage.title')}</p>
            <p className='text-sm text-muted-foreground'>{t('project.sidebar.storagePage.description')}</p>
          </div>

          <div className='flex items-center gap-2'>
            <Card className='px-2 py-1 gap-0 min-w-32 rounded-lg'>
              <p className='text-xs text-muted-foreground font-medium'>{t('projectStorage.stats.totalFiles')}</p>
              {isLoadingProjectResourceStats ? (
                <Skeleton className='h-7 w-16 mt-1' />
              ) : (
                <div className='flex items-center gap-1'>
                  <FilesIcon className='size-4 text-primary' />
                  <p className='font-bold tracking-tight'>{projectResourceStats?.totalResources ?? 0}</p>
                </div>
              )}
            </Card>

            <Card className='px-2 py-1 gap-0 min-w-32 rounded-lg'>
              <p className='text-xs text-muted-foreground font-medium'>{t('projectStorage.stats.totalSize')}</p>
              {isLoadingProjectResourceStats ? (
                <Skeleton className='h-7 w-16 mt-1' />
              ) : (
                <div className='flex items-center gap-1'>
                  <DatabaseIcon className='size-4 text-primary' />
                  <p className='font-bold tracking-tight'>{formatBytes(projectResourceStats?.totalBytes ?? 0)}</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {projectId ? <ProjectStorageTable projectId={projectId} /> : null}
      </div>

      <Outlet />
    </>
  )
}
