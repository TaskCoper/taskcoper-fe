import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import CreateProjectDialog from '@/features/projects/components/create-project-dialog'
import ProjectPreviewCard from '@/features/projects/components/project-preview-card'
import { useGetMyProjects } from '@/features/projects/hooks/use-get-my-projects'
import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ProjectsPage() {
  const { t } = useTranslation()
  const { myProjects, isLoadingMyProjects } = useGetMyProjects({})

  return (
    <div className='w-4xl mx-auto p-4 space-y-4'>
      <div>
        <p className='text-xl font-bold'>{t('project.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('project.description')}</p>
      </div>

      <div className='grid grid-cols-12 gap-4'>
        {isLoadingMyProjects ? (
          <>
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className='rounded-xl col-span-3 h-24' />
            ))}
          </>
        ) : (
          <>
            {myProjects.value.items.map((project) => (
              <ProjectPreviewCard key={project.projectId} project={project} />
            ))}

            <CreateProjectDialog>
              <Button variant='outline' className='border-dashed col-span-3 h-24 rounded-xl'>
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
