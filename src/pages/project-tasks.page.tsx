import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import ProjectBoard from '@/features/projects/core/components/project-board'
import ProjectTable from '@/features/projects/core/components/project-table'
import { useGetMilestones } from '@/features/projects/core/hooks/use-get-milestones'
import { useGetProject } from '@/features/projects/core/hooks/use-get-project'
import { SquareKanbanIcon, TablePropertiesIcon } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useParams } from 'react-router'

export default function ProjectTasksPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useQueryState('mode', parseAsStringEnum(['board', 'table']).withDefault('board'))

  const { identifier, milestoneIdentifier } = useParams<{ identifier: string; milestoneIdentifier: string }>()

  const { project } = useGetProject({
    identifier
  })

  const { milestones, isLoadingMilestones } = useGetMilestones({
    projectIdentifier: project?.slug,
    parentMilestoneIdentifier: milestoneIdentifier,
    enabled: mode === 'board'
  })

  useEffect(() => {
    if (project) {
      document.title = `${project?.name} | TaskCoper`
    }
  }, [project])

  return (
    <>
      <div className='w-full h-full relative'>
        {mode === 'board' && milestoneIdentifier && project?.id ? (
          <div className='w-full h-full bg-linear-to-br from-blue-600 via-cyan-400 to-green-600'>
            {isLoadingMilestones ? (
              <div className='flex items-start gap-3 p-4'>
                <Skeleton className='w-64 shrink-0 h-48' />
                <Skeleton className='w-64 shrink-0 h-96' />
                <Skeleton className='w-64 shrink-0 h-72' />
              </div>
            ) : (
              <ProjectBoard initialColumns={milestones?.milestones ?? []} initialTasks={milestones?.tasks ?? []} />
            )}
          </div>
        ) : null}

        {mode === 'table' && milestoneIdentifier && project?.slug ? (
          <div className='w-full h-full p-4'>
            <ProjectTable projectIdentifier={project.slug} parentMilestoneIdentifier={milestoneIdentifier} />
          </div>
        ) : null}

        <Card className='fixed bottom-4 left-1/2 z-10 -translate-x-1/2 p-1 flex-row items-center gap-1 rounded-xl shadow-[inset_0_0_3px_rgba(0,0,0,0.2)]'>
          <Button
            className='rounded-lg'
            variant={mode === 'board' ? 'default' : 'ghost'}
            onClick={() => setMode('board')}
            size='sm'
          >
            <SquareKanbanIcon />
            {t('project.views.board')}
          </Button>

          <Button
            className='rounded-lg'
            variant={mode === 'table' ? 'default' : 'ghost'}
            onClick={() => setMode('table')}
            size='sm'
          >
            <TablePropertiesIcon />
            {t('project.views.table')}
          </Button>
        </Card>
      </div>

      <Outlet />
    </>
  )
}
