import InfiniteMultiSelect from '@/components/infinite-multi-select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useGetMyMentorPackagesInfinite } from '@/features/mentor-packages/hooks/use-get-my-mentor-packages-infinite'
import { TargetType } from '@/types/voucher.type'
import { PackageIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormProvider, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAddVoucherTargets } from '../hooks/use-add-voucher-targets'
import type { AddVoucherTargetsFormValues } from '../validations'

export default function AddVoucherTargetsDialog({
  voucherId,
  children
}: {
  voucherId: string
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { methods, addVoucherTargets, isAddingVoucherTargets } = useAddVoucherTargets()
  const { control, handleSubmit, reset } = methods

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'targets'
  })

  const { mentorPackages, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetMyMentorPackagesInfinite({
    enabled: open
  })

  const onSubmit: SubmitHandler<AddVoucherTargetsFormValues> = (body) => {
    addVoucherTargets(
      { body: { ...body, voucherId } },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
        }
      }
    )
  }

  const handleSelectPackage = (selectedIds: string[]) => {
    // Current IDs in the field array
    const currentIds = fields.map((f) => f.targetId)

    // Find new IDs to add
    const newIds = selectedIds.filter((id) => !currentIds.includes(id))

    newIds.forEach((id) => {
      const pkg = mentorPackages.find((p) => p.id === id)
      if (pkg) {
        append({
          targetType: TargetType.MentorPackage,
          targetId: pkg.id,
          targetName: pkg.name
        })
      }
    })

    // Find IDs to remove
    const removedIds = currentIds.filter((id) => !selectedIds.includes(id))
    removedIds.forEach((id) => {
      const index = fields.findIndex((f) => f.targetId === id)
      if (index !== -1) {
        remove(index)
      }
    })
  }

  const selectedIds = fields.map((f) => f.targetId)

  const onClose = () => {
    setOpen(false)
    reset()
  }

  useEffect(() => {
    if (open) {
      methods.reset({
        voucherId,
        targets: []
      })
    }
  }, [open, voucherId, methods])

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }

        setOpen(open)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-lg' position='top-center' onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle>{t('voucher.target.create')}</DialogTitle>
          <DialogDescription>{t('voucher.target.createDescription')}</DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <Field className='gap-1'>
              <FieldLabel>{t('voucher.field.targets')}</FieldLabel>
              <InfiniteMultiSelect
                options={mentorPackages.map((p) => ({ value: p.id, label: p.name }))}
                values={selectedIds}
                onChangeValues={handleSelectPackage}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                placeholder={t('voucher.field.targetsPlaceholder')}
              />
            </Field>

            <div className='space-y-1'>
              <p className='text-sm font-medium'>{t('voucher.target.selectedTargets')}</p>

              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className='grid grid-cols-[minmax(0,1fr)_auto] items-center p-2 rounded-md group shadow-none'
                >
                  <div className='flex items-center gap-2 min-w-0'>
                    <PackageIcon className='size-4 text-muted-foreground shrink-0' />
                    <span className='text-sm font-medium truncate'>{field.targetName}</span>
                  </div>

                  <Button type='button' variant='ghost' size='icon-sm' onClick={() => remove(index)}>
                    <Trash2Icon className='text-destructive' />
                  </Button>
                </Card>
              ))}

              {fields.length === 0 && (
                <Card className='rounded-md shadow-none border-dashed'>
                  <p className='text-center text-sm text-muted-foreground'>{t('common.ui.noDataAvailable')}</p>
                </Card>
              )}
            </div>

            <div className='flex items-center gap-2 justify-end'>
              <Button type='button' variant='ghost' onClick={onClose}>
                {t('common.button.cancel')}
              </Button>

              <Button type='submit' disabled={fields.length === 0 || isAddingVoucherTargets}>
                {isAddingVoucherTargets ? <Spinner /> : null}
                {t('common.button.add')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
