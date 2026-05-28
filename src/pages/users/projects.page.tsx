import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import CreateProjectDialog from '@/features/projects/core/components/dialogs/create-project-dialog'
import ProjectPreviewCard from '@/features/projects/core/components/project-preview-card'
import { useGetMyProjectsInfinite } from '@/features/projects/core/hooks/use-get-my-projects-infinite'
import { PlusIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'

const responsiveColSpan = 'col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3'
const skeletonItems = [1, 2, 3]

export default function ProjectsPage() {
  const { t } = useTranslation()
  const { ref: leaderLoadMoreRef, inView: isLeaderLoadMoreInView } = useInView({ threshold: 0.1 })
  const { ref: memberLoadMoreRef, inView: isMemberLoadMoreInView } = useInView({ threshold: 0.1 })

  const {
    projects: leaderProjects,
    isLoading: isLoadingLeaderProjects,
    hasNextPage: hasNextLeaderProjects,
    isFetchingNextPage: isFetchingNextLeaderProjects,
    fetchNextPage: fetchNextLeaderProjects
  } = useGetMyProjectsInfinite({
    status: ['leader']
  })

  const {
    projects: memberProjects,
    totalCount: memberProjectsCount,
    isLoading: isLoadingMemberProjects,
    hasNextPage: hasNextMemberProjects,
    isFetchingNextPage: isFetchingNextMemberProjects,
    fetchNextPage: fetchNextMemberProjects
  } = useGetMyProjectsInfinite({
    status: ['member']
  })

  useEffect(() => {
    if (isLeaderLoadMoreInView && hasNextLeaderProjects && !isFetchingNextLeaderProjects) {
      fetchNextLeaderProjects()
    }
  }, [isLeaderLoadMoreInView, hasNextLeaderProjects, isFetchingNextLeaderProjects, fetchNextLeaderProjects])

  useEffect(() => {
    if (isMemberLoadMoreInView && hasNextMemberProjects && !isFetchingNextMemberProjects) {
      fetchNextMemberProjects()
    }
  }, [isMemberLoadMoreInView, hasNextMemberProjects, isFetchingNextMemberProjects, fetchNextMemberProjects])

  if (isLoadingLeaderProjects || isLoadingMemberProjects) {
    return (
      <div className='max-w-4xl w-full mx-auto p-4 space-y-16'>
        <div className='grid grid-cols-12 gap-4'>
          {skeletonItems.map((item) => (
            <Skeleton key={item} className={`rounded-xl h-24 ${responsiveColSpan}`} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-4xl w-full mx-auto p-4 space-y-16'>
      <div className='space-y-4'>
        <div>
          <p className='text-xl font-bold'>{t('project.title')}</p>
          <p className='text-sm text-muted-foreground'>{t('project.description')}</p>
        </div>
        <div className='grid grid-cols-12 gap-4'>
          {leaderProjects.map((project) => (
            <div key={project.id} className={`h-24 ${responsiveColSpan}`}>
              <ProjectPreviewCard project={project} />
            </div>
          ))}

          <CreateProjectDialog>
            <Button variant='outline' className={`border-dashed h-24 rounded-xl ${responsiveColSpan}`}>
              <PlusIcon />
              {t('project.createProject.button')}
            </Button>
          </CreateProjectDialog>

          {hasNextLeaderProjects ? (
            <div ref={leaderLoadMoreRef} className='col-span-12 grid grid-cols-12 gap-4 min-h-1'>
              {isFetchingNextLeaderProjects
                ? skeletonItems.map((item) => (
                    <Skeleton key={item} className={`rounded-xl h-24 ${responsiveColSpan}`} />
                  ))
                : null}
            </div>
          ) : null}
        </div>
      </div>

      {memberProjectsCount > 0 ? (
        <div className='space-y-4'>
          <div>
            <p className='text-xl font-bold'>{t('project.memberProjects')}</p>
            <p className='text-sm text-muted-foreground'>{t('project.memberProjectsDescription')}</p>
          </div>
          <div className='grid grid-cols-12 gap-4'>
            {memberProjects.map((project) => (
              <div key={project.id} className={`h-24 ${responsiveColSpan}`}>
                <ProjectPreviewCard project={project} />
              </div>
            ))}

            {hasNextMemberProjects ? (
              <div ref={memberLoadMoreRef} className='col-span-12 grid grid-cols-12 gap-4 min-h-1'>
                {isFetchingNextMemberProjects
                  ? skeletonItems.map((item) => (
                      <Skeleton key={item} className={`rounded-xl h-24 ${responsiveColSpan}`} />
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
