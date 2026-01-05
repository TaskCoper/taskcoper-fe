import FileDropzone from '@/components/file-dropzone'
import SanitizedHtml from '@/components/sanitized-html'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import UpdateProjectInfoDialog from '@/features/projects/components/dialogs/update-project-info-dialog'
import ProjectDomainsSection from '@/features/projects/components/sections/project-domains-section'
import ProjectGeneralSection from '@/features/projects/components/sections/project-general-section'
import ProjectMembersSection from '@/features/projects/components/sections/project-members-section'
import ProjectTimelineSection from '@/features/projects/components/sections/project-timeline-section'
import { useGetProject } from '@/features/projects/hooks/use-get-project'
import { useGetProjectMembers } from '@/features/projects/hooks/use-get-project-members'
import { useUpdateProject } from '@/features/projects/hooks/use-update-project'
import type { UpdateProjectFormValues } from '@/features/projects/validations'
import { useIsMobile } from '@/hooks/use-mobile'
import { useUploadFile } from '@/hooks/use-upload-file'
import type { ErrorResponse } from '@/lib/axios'
import { useAuthStore } from '@/lib/zustand/auth.store'
import { MAX_COVER_SIZE, MAX_LOGO_SIZE } from '@/shared/constants'
import { cn } from '@/shared/utils'
import type { AxiosError } from 'axios'
import { CameraIcon, EditIcon, ImageOffIcon } from 'lucide-react'
import { useEffect } from 'react'
import { FormProvider, type Path, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { toast } from 'sonner'

export default function ProjectInfoPage() {
  const { t } = useTranslation()
  const { projectId } = useParams<{ projectId: string }>()
  const { members, isLoadingMembers } = useGetProjectMembers({ projectId })
  const isMobile = useIsMobile()
  const { user } = useAuthStore()

  const { project, isLoadingProject } = useGetProject({ projectId })

  const { methods, updateProject, isUpdatingProject } = useUpdateProject({ projectId })
  const { handleSubmit, reset, setValue, getValues } = methods

  const { uploadFileAsync } = useUploadFile()
  const isCurrentUserMain =
    members?.value.items.find((member) => member.userId === user?.UserId && member.isMain) !== undefined

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
        domainIds: project.domains.map((domain) => ({
          id: domain.domainId,
          name: domain.name
        })),
        schoolSubject: project.schoolSubject,
        teamContact: project.teamContact,
        teamEmail: project.teamEmail,
        teamSize: project.teamSize
      })
    }
  }, [project, reset])

  const onSubmit: SubmitHandler<UpdateProjectFormValues> = (body) => {
    updateProject({
      body: {
        ...body,
        domainIds: body.domainIds.map((domain) => domain.id)
      }
    })
  }

  const handleUpload = async (file: File | null, name: Path<UpdateProjectFormValues>) => {
    if (!file) return

    const toastId = toast.loading(t('common.ui.uploading'), {
      description: t('common.ui.pleaseWait')
    })

    try {
      const url = await uploadFileAsync({
        file,
        onProgress: (progress) => {
          toast.loading(t('common.ui.uploading'), {
            id: toastId,
            description: (
              <div className='w-full min-w-72 space-y-1'>
                <Progress value={progress} className='w-full' />
                <p className='text-xs text-muted-foreground'>{progress}%</p>
              </div>
            )
          })
        }
      })

      if (url) {
        toast.success(t('common.ui.uploadSuccess'), {
          id: toastId,
          description: null
        })

        setValue(name, url, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
        onSubmit(getValues())
      }
    } catch (error) {
      toast(t('error.somethingWentWrong'), {
        id: toastId,
        description: (error as AxiosError<ErrorResponse>).response?.data?.detail
      })
    }
  }

  if (isLoadingProject || isLoadingMembers) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10'>
        <Skeleton className='h-24 col-span-1 lg:col-span-12' />
        <Skeleton className='h-60 col-span-1 lg:col-span-8' />
        <Skeleton className='h-28 col-span-1 lg:col-span-4' />
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20'>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          id='update-project-info-form'
          className='col-span-1 lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 lg:gap-8'
        >
          <div className='col-span-1 lg:col-span-8'>
            <div className='relative h-48 sm:h-52'>
              <FileDropzone
                onFileChange={(file) => handleUpload(file, 'coverImage')}
                className={cn('size-full group/cover relative', !isCurrentUserMain && 'cursor-default')}
                maxSize={MAX_COVER_SIZE}
                accept={{
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/webp': ['.webp'],
                  'image/svg+xml': ['.svg']
                }}
                disabled={!isCurrentUserMain}
              >
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

                <Button
                  variant='outline'
                  size='sm'
                  type='button'
                  className={cn('hidden', isCurrentUserMain && 'group-hover/cover:flex absolute bottom-2 right-2')}
                >
                  <CameraIcon />
                  {t('project.addCoverImage')}
                </Button>
              </FileDropzone>

              <FileDropzone
                onFileChange={(file) => handleUpload(file, 'logoImage')}
                className={cn(
                  'absolute -bottom-12 left-1/2 -translate-x-1/2 lg:left-8 lg:translate-x-0 size-28 lg:size-32 z-20 group/logo rounded-2xl border-4 border-background bg-muted shadow-sm',
                  !isCurrentUserMain && 'cursor-default'
                )}
                maxSize={MAX_LOGO_SIZE}
                accept={{
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/webp': ['.webp'],
                  'image/svg+xml': ['.svg']
                }}
                disabled={!isCurrentUserMain}
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
                  type='button'
                  className={cn('hidden', isCurrentUserMain && 'group-hover/logo:flex absolute bottom-2 right-2')}
                >
                  <CameraIcon className='size-4' />
                </Button>
              </FileDropzone>

              {isCurrentUserMain ? (
                <UpdateProjectInfoDialog isPending={isUpdatingProject}>
                  <Button
                    type='button'
                    className='absolute -bottom-10 right-0 z-10'
                    size={isMobile ? 'icon-sm' : 'sm'}
                    variant='secondary'
                    disabled={isUpdatingProject}
                  >
                    <EditIcon />
                    {isMobile ? null : t('common.button.edit')}
                  </Button>
                </UpdateProjectInfoDialog>
              ) : null}
            </div>

            <div className='mt-14 mb-8 px-0 lg:px-8 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4'>
              <h1 className='text-3xl sm:text-4xl font-bold text-foreground wrap-break-word w-full'>{project?.name}</h1>
              <div className='w-full text-sm sm:text-base text-left'>
                <SanitizedHtml html={project?.description ?? ''} />
              </div>
            </div>
          </div>

          <div className='col-span-1 lg:col-span-4 space-y-8'>
            <Card className='p-0 gap-0 h-fit shadow-none'>
              <div className='p-4'>
                <ProjectGeneralSection
                  teamSize={project?.teamSize ?? null}
                  teamContact={project?.teamContact ?? null}
                  teamEmail={project?.teamEmail ?? null}
                  schoolSubject={project?.schoolSubject ?? null}
                  isPending={isUpdatingProject}
                  isCurrentUserMain={isCurrentUserMain}
                />
              </div>
              <Separator />
              <div className='p-4'>
                <ProjectDomainsSection
                  domains={project?.domains ?? []}
                  isPending={isUpdatingProject}
                  isCurrentUserMain={isCurrentUserMain}
                />
              </div>
              <Separator />
              <div className='p-4'>
                <ProjectTimelineSection
                  startDate={project?.startDate ?? ''}
                  endDate={project?.endDate ?? ''}
                  isPending={isUpdatingProject}
                  isCurrentUserMain={isCurrentUserMain}
                />
              </div>
              <Separator />
              <div className='p-4'>
                <ProjectMembersSection
                  members={members?.value.items ?? []}
                  totalMembers={members?.value.items.length ?? 0}
                  projectId={projectId}
                  isCurrentUserMain={isCurrentUserMain}
                />
              </div>
            </Card>

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
        </form>
      </FormProvider>
    </div>
  )
}
