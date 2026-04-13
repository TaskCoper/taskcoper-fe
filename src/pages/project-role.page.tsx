import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import UpdateProjectRoleForm from '@/features/projects/components/forms/update-project-role-form'
import { useDeleteProjectRole } from '@/features/projects/hooks/use-delete-project-role'
import { useGetProjectRole } from '@/features/projects/hooks/use-get-project-role'
import { useUpdateProjectRole } from '@/features/projects/hooks/use-update-project-role'
import type { UpdateProjectRoleFormValues } from '@/features/projects/validations'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { SectionKey } from '@/types/project-permission.type'
import type { ProjectRoleItem } from '@/types/project.type'
import { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

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

  return undefined
}

export default function ProjectRolePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { identifier: projectIdentifier, roleId } = useParams<{ identifier: string; roleId: string }>()
  const { confirm } = useConfirmStore()

  const { role, isLoadingProjectRole } = useGetProjectRole({ projectIdentifier, roleId })
  const { methods, updateProjectRole, isUpdatingProjectRole } = useUpdateProjectRole({ projectIdentifier })
  const { deleteProjectRole } = useDeleteProjectRole()

  const navigateToPermissions = () => {
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
          navigateToPermissions()
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

    methods.reset({
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
  }, [projectIdentifier, role, methods])

  if (isLoadingProjectRole) {
    return (
      <div className='flex w-full items-center justify-center py-10'>
        <Spinner />
      </div>
    )
  }

  if (!role) {
    return (
      <div className='space-y-4 px-6 py-6'>
        <p className='text-sm text-muted-foreground'>{t('error.somethingWentWrong')}</p>
        <Button variant='outline' onClick={navigateToPermissions}>
          {t('common.button.cancel')}
        </Button>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-4xl space-y-4 px-4 sm:px-6 lg:px-8 pt-8 pb-20'>
      <div>
        <h1 className='text-2xl font-bold'>{t('project.updateProjectRole.title')}</h1>
        <p className='text-sm text-muted-foreground'>{t('project.updateProjectRole.description')}</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
          <UpdateProjectRoleForm />

          <div className='flex items-center justify-end gap-2'>
            <Button variant='ghost' type='button' onClick={navigateToPermissions} disabled={isUpdatingProjectRole}>
              {t('common.button.cancel')}
            </Button>

            <Button disabled={!projectIdentifier || !methods.formState.isDirty || isUpdatingProjectRole}>
              {isUpdatingProjectRole ? <Spinner /> : null}
              {t('common.button.save')}
            </Button>
          </div>
        </form>
      </FormProvider>

      <div className='space-y-2'>
        <p className='text-xl font-medium'>{t('project.deleteProjectRole.dangerZone.title')}</p>
        <div className='p-3 border border-destructive text-destructive-foreground rounded-md'>
          <div className='flex items-center justify-between gap-2'>
            <div>
              <p className='text-sm font-medium'>{t('project.deleteProjectRole.dangerZone.deleteTitle')}</p>
              <p className='text-xs text-muted-foreground'>
                {t('project.deleteProjectRole.dangerZone.deleteDescription')}
              </p>
            </div>
            <div className='flex-1' />

            <Button variant='destructive' onClick={onDelete}>
              {t('common.button.delete')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
