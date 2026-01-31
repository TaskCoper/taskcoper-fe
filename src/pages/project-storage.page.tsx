import { Spinner } from '@/components/ui/spinner'
import StorageTimeline from '@/features/projects/components/storage-timeline'
import { useGetProjectResources } from '@/features/projects/hooks/use-get-project-resources'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

export default function ProjectStoragePage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const { projectResources, isLoadingProjectResources } = useGetProjectResources({ projectId })

  if (isLoadingProjectResources) {
    return (
      <div className='flex h-full items-center justify-center p-8'>
        <Spinner />
      </div>
    )
  }

  if (!projectResources?.value.items.length) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-8 text-muted-foreground'>
        <p>{t('project.sidebar.storagePage.noFiles')}</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-4xl py-6'>
      <div className='mb-6 px-6'>
        <p className='text-2xl font-bold tracking-tight'>{t('project.sidebar.storagePage.title')}</p>
        <p className='text-sm text-muted-foreground'>{t('project.sidebar.storagePage.description')}</p>
      </div>

      <StorageTimeline resources={projectResources.value.items} />
    </div>
  )
}
