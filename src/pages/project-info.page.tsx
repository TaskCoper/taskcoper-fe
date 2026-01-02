import FileDropzone from '@/components/file-dropzone'
import SanitizedHtml from '@/components/sanitized-html'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import ProjectDomainsSection from '@/features/projects/components/project-domains-section'
import ProjectGeneralSection from '@/features/projects/components/project-general-section'
import ProjectMembersSection from '@/features/projects/components/project-members-section'
import ProjectTimelineSection from '@/features/projects/components/project-timeline-section'
import UpdateProjectInfoDialog from '@/features/projects/components/update-project-info-dialog'
import { useGetProject } from '@/features/projects/hooks/use-get-project'
import { useGetProjectMembers } from '@/features/projects/hooks/use-get-project-members'
import { useUpdateProject } from '@/features/projects/hooks/use-update-project'
import type { UpdateProjectFormValues } from '@/features/projects/validations'
import { useGetPresignedUrl } from '@/hooks/use-get-presigned-url'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { cn, prepareFileUpload } from '@/shared/utils'
import axios from 'axios'
import { CameraIcon, EditIcon, ImageOffIcon } from 'lucide-react'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

export default function ProjectInfoPage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const { members, isLoadingMembers } = useGetProjectMembers({ projectId })
  const isMobile = useIsMobile()

  const { project, isLoadingProject } = useGetProject({ projectId })

  const { getPresignedUrlAsync } = useGetPresignedUrl()
  const { accessToken } = useAuthStore()

  const { methods, updateProject, isUpdatingProject } = useUpdateProject({ projectId })
  const { handleSubmit, reset } = methods

  useEffect(() => {
    if (project) {
      reset({
        projectId: project.id,
        name: project.name,
        description: project.description,
        coverImage: project.coverImage,
        logoImage: project.logoImage,
        startDate: project.startDate,
        endDate: project.endDate,
        domainIds: project.domains.map((domain) => domain.domainId),
        schoolSubject: project.schoolSubject,
        teamContact: project.teamContact,
        teamEmail: project.teamEmail,
        teamSize: project.teamSize
      })
    }
  }, [project, reset])

  const handleUpload = async (file: File | null) => {
    if (!file || !accessToken) return

    try {
      const response = await getPresignedUrlAsync(prepareFileUpload(file))
      const { data } = await axios.put(response.presignedUrl, file, {
        headers: {
          'Content-Type': response.contentType,
          'x-amz-meta-owner': accessToken
        }
      })

      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  const onSubmit: SubmitHandler<UpdateProjectFormValues> = (body) => {
    updateProject({ body })
  }

  if (isLoadingProject || isLoadingMembers) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10'>
        <Skeleton className='h-24 col-span-1 lg:col-span-12' />
        <Skeleton className='h-52 col-span-1 lg:col-span-8' />
        <Skeleton className='h-32 col-span-1 lg:col-span-4' />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6',
        isMobile ? 'pb-20' : 'pb-12'
      )}
    >
      {/* progress bar section */}
      <div className='col-span-1 lg:col-span-12'>
        <Card className='p-4 gap-3 border-dashed shadow-none'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1'>
            <div>
              <p className='font-semibold'>
                {t('project.info.progress')} ({project?.progress ? project.progress : 0}%)
              </p>
              <p className='text-xs text-muted-foreground'>{t('project.info.progressDescription')}</p>
            </div>
          </div>
          <Progress value={project?.progress ?? 0} className='h-2' />
        </Card>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          id='update-project-info-form'
          className='col-span-1 lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6'
        >
          {/* left column */}
          <div className='col-span-1 lg:col-span-8'>
            <div className='relative h-48 sm:h-52'>
              {/* cover image */}
              <FileDropzone onFileChange={handleUpload} className='size-full group/cover relative'>
                {project?.coverImage ? (
                  <img
                    src={project.coverImage}
                    alt={project.name + ' Cover'}
                    className='size-full object-cover rounded-xl'
                  />
                ) : (
                  <div className='size-full rounded-xl bg-muted flex items-center justify-center'>
                    <ImageOffIcon className='size-10 text-muted-foreground' />
                  </div>
                )}

                <Button variant='outline' size='sm' className='hidden group-hover/cover:flex absolute bottom-2 right-2'>
                  <CameraIcon />
                  {t('project.addCoverImage')}
                </Button>
              </FileDropzone>

              {/* logo image */}
              <FileDropzone
                onFileChange={handleUpload}
                className='absolute -bottom-12 left-1/2 -translate-x-1/2 lg:left-8 lg:translate-x-0 size-28 lg:size-32 z-20 group/logo rounded-2xl border-4 border-background bg-muted shadow-sm'
              >
                {project?.logoImage ? (
                  <img
                    src={project.logoImage}
                    alt={project.name + ' Logo'}
                    className='size-full object-cover rounded-xl'
                  />
                ) : (
                  <div className='size-full flex items-center justify-center'>
                    <ImageOffIcon className='size-8 text-muted-foreground' />
                  </div>
                )}

                <Button
                  variant='outline'
                  size='icon-sm'
                  className='hidden group-hover/logo:flex absolute bottom-2 right-2'
                >
                  <CameraIcon />
                </Button>
              </FileDropzone>

              <UpdateProjectInfoDialog isDirty={methods.formState.isDirty} isPending={isUpdatingProject}>
                <Button
                  className='absolute -bottom-10 right-0 z-10'
                  size={isMobile ? 'icon-sm' : 'sm'}
                  variant='secondary'
                >
                  <EditIcon />
                  {isMobile ? null : t('common.edit')}
                </Button>
              </UpdateProjectInfoDialog>
            </div>

            <div className='mt-16 mb-8 px-0 lg:px-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4'>
              <h1 className='text-3xl sm:text-4xl font-bold text-foreground wrap-break-word w-full'>{project?.name}</h1>
              <div className='w-full text-sm sm:text-base text-left'>
                <SanitizedHtml html={project?.description ?? ''} />
              </div>
            </div>
          </div>

          {/* right column */}
          <div className='col-span-1 lg:col-span-4 space-y-8 lg:space-y-12'>
            <ProjectGeneralSection
              teamSize={project?.teamSize ?? null}
              teamContact={project?.teamContact ?? null}
              teamEmail={project?.teamEmail ?? null}
              schoolSubject={project?.schoolSubject ?? null}
            />

            <ProjectDomainsSection domains={project?.domains ?? []} />

            <ProjectTimelineSection startDate={project?.startDate ?? ''} endDate={project?.endDate ?? ''} />

            <ProjectMembersSection
              members={members?.value.items ?? []}
              totalMembers={members?.value.items.length ?? 0}
              projectId={projectId}
            />
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
