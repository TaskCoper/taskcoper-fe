import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import UpdateProjectRoleForm from '@/features/projects/components/forms/update-project-role-form'
import { useDeleteProjectRole } from '@/features/projects/hooks/use-delete-project-role'
import { useGetProjectRole } from '@/features/projects/hooks/use-get-project-role'
import { useUpdateProjectRole } from '@/features/projects/hooks/use-update-project-role'
import type { UpdateProjectRoleFormValues } from '@/features/projects/validations'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { SectionKey } from '@/types/project-permission.type'
import type { ProjectRoleDetail, ProjectRoleItem } from '@/types/project.type'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useBeforeUnload, useBlocker, useNavigate, useParams } from 'react-router'

const safeJsonParse = (value: string) => {
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

const normalizeExtensions = (
  sectionKey: SectionKey,
  extensions: ProjectRoleItem['permissions'][number]['extensions']
) => {
  const parsed = typeof extensions === 'string' ? safeJsonParse(extensions) : extensions

  if (sectionKey === SectionKey.TASKS) {
    return {
      canUpdate: {
        canMoveTask: parsed?.canUpdate?.canMoveTask === true,
        canMoveMilestone: parsed?.canUpdate?.canMoveMilestone === true,
        canToggleTaskStatus: parsed?.canUpdate?.canToggleTaskStatus === true
      }
    }
  }

  if (sectionKey === SectionKey.STORAGE) {
    return {
      canRead: {
        canDownload: parsed?.canRead?.canDownload === true
      }
    }
  }

  if (sectionKey === SectionKey.CALENDAR) {
    return {
      canRead: {
        canViewMeetingDetails: parsed?.canRead?.canViewMeetingDetails === true
      },
      canWrite: {
        canPurchasePackage: parsed?.canWrite?.canPurchasePackage === true,
        canBookMeeting: parsed?.canWrite?.canBookMeeting === true
      },
      canUpdate: {
        canRescheduleMeeting: parsed?.canUpdate?.canRescheduleMeeting === true
      },
      canDelete: {
        canCancelMeeting: parsed?.canDelete?.canCancelMeeting === true
      }
    }
  }

  return undefined
}

const mapRoleToFormValues = (projectIdentifier: string, role: ProjectRoleDetail): UpdateProjectRoleFormValues => ({
  projectIdentifier,
  roleId: role.id,
  name: role.name,
  description: role.description ?? '',
  isDefault: false,
  permissions: Object.values(SectionKey).map((sectionKey) => {
    const current = role.permissions.find((permission) => permission.sectionKey === sectionKey)

    return {
      sectionKey,
      canRead: current?.canRead ?? false,
      canWrite: current?.canWrite ?? false,
      canUpdate: current?.canUpdate ?? false,
      canDelete: current?.canDelete ?? false,
      extensions: normalizeExtensions(sectionKey, current?.extensions)
    }
  })
})

const ProjectRolePageSkeleton = () => {
  return (
    <div className='mx-auto w-full space-y-8 px-4 sm:px-6 lg:px-8 pt-8 pb-20'>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Skeleton className='h-9 w-72' />
          <Skeleton className='h-5 w-full max-w-xl' />
        </div>

        <div className='rounded-md border p-3 space-y-3'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </div>

        <Card className='sticky bottom-4 z-20 shadow-none rounded-md py-2 pl-4 pr-2'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <Skeleton className='h-4 w-40' />

            <div className='flex items-center justify-end gap-2'>
              <Skeleton className='h-9 w-24' />
              <Skeleton className='h-9 w-24' />
            </div>
          </div>
        </Card>
      </div>

      <div className='space-y-2'>
        <Skeleton className='h-7 w-48' />
        <div className='rounded-md p-3 space-y-2'>
          <Skeleton className='h-5 w-72' />
          <Skeleton className='h-4 w-full max-w-lg' />
        </div>
      </div>
    </div>
  )
}

export default function ProjectRolePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { identifier: projectIdentifier, roleId } = useParams<{ identifier: string; roleId: string }>()
  const { confirm } = useConfirmStore()

  const { role, isLoadingProjectRole } = useGetProjectRole({ projectIdentifier, roleId })
  const { methods, updateProjectRole, isUpdatingProjectRole } = useUpdateProjectRole({ projectIdentifier })
  const { deleteProjectRole } = useDeleteProjectRole()
  const isDirty = methods.formState.isDirty
  const isGuardEnabled = isDirty && !isUpdatingProjectRole
  const blocker = useBlocker(isGuardEnabled)

  useBeforeUnload(
    (event) => {
      if (!isGuardEnabled) {
        return
      }

      event.preventDefault()
      event.returnValue = ''
    },
    { capture: true }
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      return
    }

    let isCancelled = false

    const runConfirm = async () => {
      const ok = await confirm({
        title: t('project.updateProjectRole.unsavedChanges.title'),
        description: t('project.updateProjectRole.unsavedChanges.description'),
        confirmText: t('common.button.leave'),
        cancelText: t('common.button.cancel'),
        variant: 'default'
      })

      if (isCancelled) {
        return
      }

      if (ok) {
        blocker.proceed()
        return
      }

      blocker.reset()
    }

    runConfirm()

    return () => {
      isCancelled = true
    }
  }, [blocker, confirm, t])

  const navigateToPermissions = () => {
    if (projectIdentifier && role) {
      methods.reset(mapRoleToFormValues(projectIdentifier, role))
    }

    if (projectIdentifier) {
      navigate(`/projects/${projectIdentifier}/settings?tab=permissions`)
      return
    }

    navigate(-1)
  }

  const onSubmit: SubmitHandler<UpdateProjectRoleFormValues> = (body) => {
    updateProjectRole(
      { body },
      {
        onSuccess: () => {
          methods.reset(body)
        }
      }
    )
  }

  const onDelete = async () => {
    if (!projectIdentifier || !roleId) return

    const ok = await confirm({
      title: t('project.deleteProjectRole.confirmation.title'),
      description: t('project.deleteProjectRole.confirmation.description'),
      confirmText: t('common.button.delete'),
      cancelText: t('common.button.cancel'),
      variant: 'destructive'
    })

    if (ok) {
      deleteProjectRole({ projectIdentifier, roleId })
    }
  }

  useEffect(() => {
    if (!projectIdentifier || !role) return

    methods.reset(mapRoleToFormValues(projectIdentifier, role))
  }, [projectIdentifier, role, methods])

  const saveStateText = isUpdatingProjectRole
    ? t('project.updateProjectRole.status.saving')
    : isDirty
      ? t('project.updateProjectRole.status.unsavedChanges')
      : t('project.updateProjectRole.status.noChanges')

  if (isLoadingProjectRole) {
    return <ProjectRolePageSkeleton />
  }

  return (
    <div className='mx-auto w-full space-y-8 px-4 sm:px-6 lg:px-8 pt-8 pb-20'>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
          <UpdateProjectRoleForm />

          <Card className='sticky bottom-20 z-20 rounded-md py-2 pl-4 pr-2'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-xs font-medium'>{saveStateText}</p>

              <div className='flex items-center justify-end gap-2'>
                <Button variant='ghost' type='button' onClick={navigateToPermissions} disabled={isUpdatingProjectRole}>
                  {t('common.button.cancel')}
                </Button>

                <Button disabled={!projectIdentifier || !isDirty || isUpdatingProjectRole}>
                  {isUpdatingProjectRole ? <Spinner /> : null}
                  {t('common.button.save')}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </FormProvider>

      <div className='space-y-2'>
        <p className='text-xl font-medium'>{t('project.deleteProjectRole.dangerZone.title')}</p>

        <div className='rounded-md border border-destructive p-3 text-destructive-foreground'>
          <div className='flex items-center justify-between gap-2'>
            <div>
              <p className='text-sm font-medium'>{t('project.deleteProjectRole.dangerZone.deleteTitle')}</p>
              <p className='text-xs text-muted-foreground'>
                {t('project.deleteProjectRole.dangerZone.deleteDescription')}
              </p>
            </div>
            <div className='flex-1' />

            <Button type='button' variant='destructive' onClick={onDelete}>
              {t('common.button.delete')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
