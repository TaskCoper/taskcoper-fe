import AsyncMultiSelectField from '@/components/async-multi-select-field'
import FileDropzone from '@/components/file-dropzone'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { useGetDomains } from '@/hooks/use-get-domains'
import { useUploadFile } from '@/hooks/use-upload-file'
import type { ErrorResponse } from '@/lib/axios'
import { MAX_COVER_SIZE, MAX_LOGO_SIZE } from '@/shared/constants'
import { cn } from '@/shared/utils'
import type { AxiosError } from 'axios'
import { CameraIcon, ImageOffIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, type Path, type SubmitHandler, useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useGetProject } from '../hooks/use-get-project'
import { useUpdateProject } from '../hooks/use-update-project'
import type { DomainItem, UpdateProjectFormValues } from '../validations'
import UpdateProjectDomainsForm from './forms/update-project-domains-form'
import UpdateProjectGeneralForm from './forms/update-project-general-form'
import UpdateProjectInfoForm from './forms/update-project-info-form'
import UpdateProjectTimelineForm from './forms/update-project-timeline-form'

interface ProjectInfoTabProps {
  projectIdentifier?: string
}

interface ComboboxDomainItem {
  id: string
  name: string
}

export default function ProjectInfoTab({ projectIdentifier }: ProjectInfoTabProps) {
  const { t } = useTranslation()
  const { project, isLoadingProject } = useGetProject({ identifier: projectIdentifier })
  const { methods, updateProject, isUpdatingProject } = useUpdateProject({ projectIdentifier })
  const {
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { isDirty }
  } = methods

  const { fields, remove, replace } = useFieldArray({
    control,
    name: 'domainIds'
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [domainSearchTerm, setDomainSearchTerm] = useState('')
  const debouncedSetDomainSearchTerm = useDebouncedCallback((value: string) => {
    setDomainSearchTerm(value)
  }, 500)

  const handleSearchTermChange = useCallback(
    (value: string) => {
      setSearchTerm(value)
      debouncedSetDomainSearchTerm(value)
    },
    [debouncedSetDomainSearchTerm]
  )

  const { domains, isLoadingDomains } = useGetDomains({
    searchTerm: domainSearchTerm || undefined
  })

  const domainItems: ComboboxDomainItem[] = useMemo(
    () =>
      domains.value.items.map((domain) => ({
        id: domain.id,
        name: domain.name
      })),
    [domains.value.items]
  )

  const { uploadFileAsync } = useUploadFile()

  const onSubmit: SubmitHandler<UpdateProjectFormValues> = (body) => {
    updateProject({
      body: {
        ...body,
        domainIds: body.domainIds.map((domain) => domain.id)
      }
    })
  }

  const debouncedAutoSubmit = useDebouncedCallback(() => {
    if (isDirty && project && !isUpdatingProject) {
      handleSubmit(onSubmit)()
    }
  }, 1000)

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
              <div className='w-72 space-y-1'>
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

  if (isLoadingProject) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 pt-3'>
        <Skeleton className='h-24 col-span-1 lg:col-span-12' />
        <Skeleton className='h-60 col-span-1 lg:col-span-8' />
        <Skeleton className='h-28 col-span-1 lg:col-span-4' />
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onChange={debouncedAutoSubmit}
        id='update-project-info-form'
        className='grid grid-cols-1 lg:grid-cols-12 lg:gap-6 max-w-7xl mx-auto'
      >
        <div className='col-span-1 lg:col-span-8'>
          <div className='relative h-48 sm:h-52'>
            <FileDropzone
              onFileChange={(file) => handleUpload(file, 'coverImage')}
              className={cn('size-full group/cover relative')}
              maxSize={MAX_COVER_SIZE}
              accept={{
                'image/png': ['.png'],
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/webp': ['.webp'],
                'image/svg+xml': ['.svg']
              }}
            >
              {project?.coverImage ? (
                <img
                  src={project.coverImage}
                  alt={t('project.coverImageAlt', { name: project.name })}
                  className='size-full object-cover rounded-2xl shadow-sm border border-border'
                />
              ) : (
                <div className='size-full rounded-2xl bg-muted flex items-center justify-center'>
                  <ImageOffIcon className='size-10 text-muted-foreground' />
                </div>
              )}

              <Button
                variant='outline'
                size='sm'
                type='button'
                className='absolute bottom-2 right-2 opacity-0 group-hover/cover:opacity-100 transition-opacity'
              >
                <CameraIcon />
                {t('project.addCoverImage')}
              </Button>
            </FileDropzone>

            <FileDropzone
              onFileChange={(file) => handleUpload(file, 'logoImage')}
              className={cn(
                'absolute -bottom-12 left-1/2 -translate-x-1/2 lg:left-6 lg:translate-x-0 size-28 lg:size-32 z-20 group/logo rounded-2xl bg-muted shadow-sm'
              )}
              maxSize={MAX_LOGO_SIZE}
              accept={{
                'image/png': ['.png'],
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/webp': ['.webp'],
                'image/svg+xml': ['.svg']
              }}
            >
              {project?.logoImage ? (
                <img
                  src={project.logoImage}
                  alt={t('project.logoImageAlt', { name: project.name })}
                  className='size-full object-cover rounded-xl shadow-sm border border-border'
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
                className='absolute bottom-2 right-2 opacity-0 group-hover/logo:opacity-100 transition-opacity'
              >
                <CameraIcon className='size-4' />
              </Button>
            </FileDropzone>
          </div>

          <div className='mt-20'>
            {/* <div>
              <p className='font-semibold'>{t('project.updateProjectInfo.title')}</p>
              <p className='text-xs text-muted-foreground'>{t('project.updateProjectInfo.description')}</p>
            </div> */}
            <UpdateProjectInfoForm />
          </div>
        </div>

        <div className='col-span-1 lg:col-span-4 space-y-4'>
          <div className='space-y-2'>
            <div>
              <p className='font-semibold'>
                {t('project.info.progress')} ({project?.progress ? project.progress : 0}%)
              </p>
              <p className='text-xs text-muted-foreground'>{t('project.info.progressDescription')}</p>
            </div>
            <Progress value={project?.progress ?? 0} className='h-2' />
          </div>

          <Card className='p-3 gap-4 rounded-lg shadow-none'>
            <div>
              <p className='font-semibold'>{t('project.updateProjectGeneral.title')}</p>
              <p className='text-xs text-muted-foreground'>{t('project.updateProjectGeneral.description')}</p>
            </div>
            <UpdateProjectGeneralForm />
          </Card>

          <Card className='p-3 gap-4 rounded-lg shadow-none'>
            <div>
              <p className='font-semibold'>{t('project.updateProjectDomains.title')}</p>
              <p className='text-xs text-muted-foreground'>{t('project.updateProjectDomains.description')}</p>
            </div>

            <div>
              <AsyncMultiSelectField<UpdateProjectFormValues, DomainItem, ComboboxDomainItem>
                name='domainIds'
                items={domainItems}
                isLoading={isLoadingDomains}
                searchValue={searchTerm}
                onSearchChange={handleSearchTermChange}
                label='project.updateProjectDomains.searchLabel'
                isRequired
                getId={(domain) => domain.id}
                getValueId={(item) => item.id}
                getLabel={(domain) => domain.name}
                createValue={(domain) => ({
                  id: domain.id,
                  name: domain.name
                })}
                renderOption={(domain) => <p>{domain.name}</p>}
                onChange={(val) => {
                  replace(val)
                  debouncedAutoSubmit()
                }}
                displayError={false}
              />

              <UpdateProjectDomainsForm fields={fields} remove={remove} onRemoveDomain={debouncedAutoSubmit} />
            </div>
          </Card>

          <Card className='p-3 gap-4 rounded-lg shadow-none'>
            <div>
              <p className='font-semibold'>{t('project.updateProjectTimeline.title')}</p>
              <p className='text-xs text-muted-foreground'>{t('project.updateProjectTimeline.description')}</p>
            </div>
            <UpdateProjectTimelineForm onDateChange={debouncedAutoSubmit} />
          </Card>
        </div>
      </form>
    </FormProvider>
  )
}
