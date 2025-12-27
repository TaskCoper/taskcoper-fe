import { Skeleton } from '@/components/ui/skeleton'
import ProjectBoard from '@/features/projects/components/project-board'
import { useGetMilestones } from '@/features/projects/hooks/use-get-milestones'
import { Outlet, useParams } from 'react-router'

export default function ProjectTasksPage() {
  const { projectId, milestoneId } = useParams<{ projectId: string; milestoneId: string }>()
  const { milestones, isLoadingMilestones } = useGetMilestones({ projectId, parentMilestoneId: milestoneId })

  return (
    <>
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

      <Outlet />
    </>
  )
}
