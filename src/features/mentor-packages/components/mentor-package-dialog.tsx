import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useDeleteMentorPackage } from '@/features/mentor-packages/hooks/use-delete-mentor-package'
import { useUpdateMentorPackage } from '@/features/mentor-packages/hooks/use-update-mentor-package'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { MentorPackage } from '@/types/mentor-package.type'
import { Trash2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { UpdateMentorPackageFormValues } from '../validations'
import UpdateMentorPackageForm from './update-mentor-package-form'

interface MentorPackageDialogProps {
  children: React.ReactNode
  mentorPackage: MentorPackage
}

export default function MentorPackageDialog({ mentorPackage, children }: MentorPackageDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { confirm } = useConfirmStore()
  const { methods, updateMentorPackage, isUpdatingMentorPackage } = useUpdateMentorPackage()
  const { deleteMentorPackage, isDeletingMentorPackage } = useDeleteMentorPackage()

  useEffect(() => {
    if (open) {
      methods.reset({
        mentorPackageId: mentorPackage.id,
        name: mentorPackage.name,
        description: mentorPackage.description,
        durationInMinutes: mentorPackage.durationInMinutes,
        totalSessions: mentorPackage.totalSessions.toString(),
        price: mentorPackage.price.toString(),
        currency: mentorPackage.currency,
        isActive: mentorPackage.isActive,
        position: mentorPackage.position
      })
    }
  }, [open, mentorPackage, methods])

  const handleDelete = async () => {
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
        onSuccess: () => setOpen(false)
      }
    )
  }

  const onSubmit: SubmitHandler<UpdateMentorPackageFormValues> = (values) => {
    updateMentorPackage(
      { body: values },
      {
        onSuccess: () => setOpen(false)
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          methods.reset()
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        position='top-center'
        className='min-w-xl sm:w-full sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6'
      >
        <DialogHeader className='gap-1'>
          <DialogTitle>{t('mentorPackage.dialog.title')}</DialogTitle>
          <DialogDescription>{t('mentorPackage.dialog.description')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4 pt-4'>
            <UpdateMentorPackageForm />

            <div className='flex flex-col-reverse sm:flex-row items-center justify-between gap-3'>
              <Button
                type='button'
                variant='outline'
                className='w-full sm:w-auto text-destructive border-destructive/40 hover:text-destructive'
                onClick={handleDelete}
                disabled={isDeletingMentorPackage || isUpdatingMentorPackage}
              >
                <Trash2Icon />
                {t('common.button.delete')}
              </Button>

              <div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(false)}
                  className='w-full sm:w-auto'
                  disabled={isUpdatingMentorPackage}
                >
                  {t('common.button.cancel')}
                </Button>

                <Button type='submit' className='w-full sm:w-auto' disabled={isUpdatingMentorPackage}>
                  {t('common.button.save')}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
