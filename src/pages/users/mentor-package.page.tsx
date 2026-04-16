import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import AddMentorPackageRuleDialog from '@/features/mentor-package-rules/components/add-mentor-package-rule-dialog'
import { useDeleteMentorPackageRule } from '@/features/mentor-package-rules/hooks/use-delete-mentor-package-rule'
import { useUpdateMentorPackageRule } from '@/features/mentor-package-rules/hooks/use-update-mentor-package-rule'
import UpdateMentorPackageForm from '@/features/mentor-packages/components/update-mentor-package-form'
import { useDeleteMentorPackage } from '@/features/mentor-packages/hooks/use-delete-mentor-package'
import { useGetMentorPackage } from '@/features/mentor-packages/hooks/use-get-mentor-package'
import { useUpdateMentorPackage } from '@/features/mentor-packages/hooks/use-update-mentor-package'
import type { UpdateMentorPackageFormValues } from '@/features/mentor-packages/validations'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { MentorPackageRule } from '@/types/mentor-package.type'
import { CheckIcon, ClockIcon, PackageIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

const MentorPackageSkeleton = () => (
  <div className='max-w-4xl mx-auto p-6 space-y-12 pb-20'>
    <div className='space-y-4'>
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Skeleton className='size-6 rounded-full' />
          <Skeleton className='h-7 w-32' />
        </div>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
      </div>

      <div className='space-y-4 pt-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-24 w-full' />
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
        <div className='flex justify-end gap-2'>
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-24' />
        </div>
      </div>
    </div>

    <div className='space-y-6'>
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Skeleton className='size-6 rounded-full' />
          <Skeleton className='h-7 w-48' />
        </div>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
      </div>

      <div className='space-y-2'>
        <div className='flex justify-end'>
          <Skeleton className='h-8 w-28' />
        </div>
        <div className='border rounded-lg overflow-hidden'>
          <div className='divide-y'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='p-4 flex items-center justify-between gap-4'>
                <Skeleton className='h-6 w-24 rounded-md' />
                <Skeleton className='h-6 w-32' />
                <div className='flex gap-2'>
                  <Skeleton className='h-8 w-16' />
                  <Skeleton className='h-8 w-8' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default function MentorPackagePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { packageId } = useParams<{ packageId: string }>()
  const { confirm } = useConfirmStore()
  const { methods, updateMentorPackage, isUpdatingMentorPackage } = useUpdateMentorPackage()
  const { deleteMentorPackage, isDeletingMentorPackage } = useDeleteMentorPackage()

  const { mentorPackage, isLoadingMentorPackage } = useGetMentorPackage({ packageId })

  useEffect(() => {
    if (mentorPackage) {
      methods.reset({
        mentorPackageId: mentorPackage.id,
        name: mentorPackage.name,
        description: mentorPackage.description,
        durationInMinutes: mentorPackage.durationInMinutes,
        totalSessions: mentorPackage.totalSessions.toString(),
        price: mentorPackage.price.toString(),
        currency: mentorPackage.currency,
        isActive: mentorPackage.isActive,
        sortOrder: mentorPackage.sortOrder
      })
    }
  }, [mentorPackage, methods])

  const handleDelete = async () => {
    if (!mentorPackage) return

    const ok = await confirm({
      title: t('mentorPackage.delete.title'),
      description:
        t('mentorPackage.delete.description', {
          packageName: mentorPackage.name,
          defaultValue: `Are you sure you want to delete "${mentorPackage.name}"?`
        }) ?? undefined,
      confirmText: t('common.button.delete'),
      cancelText: t('common.button.cancel'),
      variant: 'destructive'
    })

    if (!ok) return

    deleteMentorPackage(
      { mentorPackageId: mentorPackage.id },
      {
        onSuccess: () => navigate('/packages')
      }
    )
  }

  const onSubmit: SubmitHandler<UpdateMentorPackageFormValues> = (values) => {
    updateMentorPackage({ body: values })
  }

  if (isLoadingMentorPackage) {
    return (
      <div className='absolute inset-0 overflow-auto'>
        <MentorPackageSkeleton />
      </div>
    )
  }

  return (
    <div className='absolute inset-0 overflow-auto'>
      <div className='max-w-4xl mx-auto p-6 space-y-12 pb-20'>
        <div className='space-y-4'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <PackageIcon className='size-6 text-primary' />
              <p className='text-xl font-bold'>{t('mentorPackage.page.infoTitle')}</p>
            </div>
            <p className='text-sm text-muted-foreground'>{t('mentorPackage.page.infoDescription')}</p>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4 pt-4'>
              <UpdateMentorPackageForm />

              <div className='flex justify-end items-center gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='w-full sm:w-auto text-destructive border-destructive/40 hover:text-destructive'
                  onClick={handleDelete}
                  disabled={isDeletingMentorPackage || isUpdatingMentorPackage}
                >
                  {isDeletingMentorPackage ? <Spinner /> : null}
                  {t('common.button.delete')}
                </Button>

                <Button
                  type='submit'
                  size='sm'
                  className='w-full sm:w-auto'
                  disabled={!methods.formState.isDirty || isUpdatingMentorPackage}
                >
                  {isUpdatingMentorPackage ? <Spinner /> : null}
                  {t('common.button.save')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>

        <div className='space-y-6'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <ClockIcon className='size-6 text-primary' />
              <p className='text-xl font-bold'>{t('mentorPackage.page.durationTitle')}</p>
            </div>
            <p className='text-sm text-muted-foreground'>{t('mentorPackage.page.durationDescription')}</p>
          </div>

          <div className='flex flex-col gap-2'>
            {mentorPackage?.id ? (
              <div className='ml-auto'>
                <AddMentorPackageRuleDialog mentorPackageId={mentorPackage.id}>
                  <Button size='sm'>
                    <PlusIcon />
                    {t('mentorPackageRule.item.create')}
                  </Button>
                </AddMentorPackageRuleDialog>
              </div>
            ) : null}

            <div className='border rounded-lg bg-card overflow-hidden'>
              <Table>
                <TableBody>
                  {mentorPackage?.rules?.map((rule) => (
                    <MentorPackageRuleRow key={rule.id} rule={rule} mentorPackageId={mentorPackage.id} />
                  ))}
                  {(!mentorPackage?.rules || mentorPackage.rules.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className='h-32 text-center'>
                        <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                          <ClockIcon className='size-8 opacity-20' />
                          <p>{t('common.ui.noDataAvailable')}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const MentorPackageRuleRow = ({ rule, mentorPackageId }: { rule: MentorPackageRule; mentorPackageId: string }) => {
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()
  const [isEditing, setIsEditing] = useState(false)
  const { updateMentorPackageRule, isUpdatingMentorPackageRule } = useUpdateMentorPackageRule({ mentorPackageId })
  const { deleteMentorPackageRule, isDeletingMentorPackageRule } = useDeleteMentorPackageRule({ mentorPackageId })
  const [values, setValues] = useState({ no: rule.no.toString(), totalTimeSlots: rule.totalTimeSlots.toString() })

  const handleSave = () => {
    updateMentorPackageRule(
      {
        body: {
          id: rule.id,
          no: Number(values.no),
          totalTimeSlots: Number(values.totalTimeSlots)
        }
      },
      {
        onSuccess: () => setIsEditing(false)
      }
    )
  }

  const handleCancel = () => {
    setValues({ no: rule.no.toString(), totalTimeSlots: rule.totalTimeSlots.toString() })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    const ok = await confirm({
      title: t('mentorPackageRule.delete.title'),
      description:
        t('mentorPackageRule.delete.description', {
          no: rule.no,
          defaultValue: `Are you sure you want to delete session ${rule.no}?`
        }) ?? undefined,
      confirmText: t('common.button.delete'),
      cancelText: t('common.button.cancel'),
      variant: 'destructive'
    })

    if (!ok) return

    deleteMentorPackageRule({ ruleId: rule.id })
  }

  return (
    <TableRow className='group transition-colors'>
      <TableCell className='font-medium p-4'>
        {isEditing ? (
          <div className='flex items-center gap-2'>
            <p className='text-xs font-semibold text-muted-foreground'>{t('mentorPackageRule.item.session')}</p>
            <Input
              type='number'
              value={values.no}
              onChange={(e) => setValues((prev) => ({ ...prev, no: e.target.value }))}
              className='h-8 w-16'
              autoFocus
            />
          </div>
        ) : (
          <Badge className='rounded-md'>
            {t('mentorPackageRule.item.session')} {rule.no}
          </Badge>
        )}
      </TableCell>

      <TableCell className='p-4'>
        {isEditing ? (
          <div className='flex items-center gap-2'>
            <Input
              type='number'
              value={values.totalTimeSlots}
              onChange={(e) => setValues((prev) => ({ ...prev, totalTimeSlots: e.target.value }))}
              className='h-8 w-20'
            />
            <p className='text-sm text-muted-foreground'>{t('mentorPackageRule.item.hours')}</p>
          </div>
        ) : (
          <div className='flex items-center gap-1'>
            <p className='text-sm font-semibold'>{rule.totalTimeSlots}</p>
            <p className='text-sm text-muted-foreground'>{t('mentorPackageRule.item.hours')}</p>
          </div>
        )}
      </TableCell>

      <TableCell className='text-right p-4'>
        {isEditing ? (
          <div className='flex items-center justify-end gap-1'>
            <Button size='icon-sm' variant='ghost' onClick={handleSave} disabled={isUpdatingMentorPackageRule}>
              {isUpdatingMentorPackageRule ? <Spinner className='size-4' /> : <CheckIcon className='size-4' />}
            </Button>

            <Button size='icon-sm' variant='ghost' onClick={handleCancel} disabled={isUpdatingMentorPackageRule}>
              <XIcon className='size-4' />
            </Button>
          </div>
        ) : (
          <div className='flex items-center justify-end gap-2'>
            <Button variant='secondary' size='sm' onClick={() => setIsEditing(true)}>
              {t('mentorPackageRule.item.edit')}
            </Button>
            <Button
              size='icon-sm'
              variant='ghost'
              className='text-destructive hover:text-destructive hover:bg-destructive/10'
              onClick={handleDelete}
              disabled={isDeletingMentorPackageRule}
            >
              {isDeletingMentorPackageRule ? <Spinner className='size-4' /> : <Trash2Icon className='size-4' />}
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}
