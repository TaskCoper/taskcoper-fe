import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import CreateProjectDialog from '@/features/projects/components/create-project-dialog'
import ProjectPreviewCard from '@/features/projects/components/project-preview-card'
import { useGetMyProjects } from '@/features/projects/hooks/use-get-my-projects'
import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const responsiveColSpan = 'col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3'

export default function ProjectsPage() {
  const { t } = useTranslation()
  const { myProjects, isLoadingMyProjects } = useGetMyProjects({})

  return (
    <div className='max-w-4xl w-full mx-auto p-4 space-y-4'>
      <div>
        <p className='text-xl font-bold'>{t('project.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('project.description')}</p>
      </div>

      <div className='grid grid-cols-12 gap-4'>
        {isLoadingMyProjects ? (
          <>
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className={`rounded-xl h-24 ${responsiveColSpan}`} />
            ))}
          </>
        ) : (
          <>
            {myProjects.value.items.map((project) => (
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
          </>
        )}
      </div>
    </div>
  )
}
