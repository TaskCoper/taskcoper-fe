import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { useUnsavedCloseGuard } from '@/tenants/hoa-theo-mua/features/configs/components/generic/config-dialog-shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { CreateProgramPayload, UpdateProgramPayload, VoucherProgram } from '../types'
import { programSchema } from '../validations'
import { composeDateTime, displayDate, timeValue, toNullableNumber } from './voucher-date-utils'
import { VoucherFormFooter, VoucherNumberField, VoucherTextField, VoucherValidityFields } from './voucher-form-fields'

type ProgramFormValues = {
  name: string
  startDate: string | null
  startTime: string
  endDate: string | null
  endTime: string
  minOrderAmount: number | null
  maxOrderAmount: number | null
}

const buildDefaultValues = (program?: VoucherProgram | null): ProgramFormValues => ({
  name: program?.name ?? '',
  startDate: program?.startAt || null,
  startTime: timeValue(program?.startAt ?? '', '00:00'),
  endDate: program?.endAt || null,
  endTime: timeValue(program?.endAt ?? '', '23:59'),
  minOrderAmount: program?.minOrderAmount || null,
  maxOrderAmount: program?.maxOrderAmount || null
})

export function ProgramFormDialog({
  open,
  program,
  onOpenChange,
  onSubmit,
  pending
}: {
  open: boolean
  program?: VoucherProgram | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreateProgramPayload | UpdateProgramPayload) => void
  pending: boolean
}) {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const defaultValues = useMemo(() => buildDefaultValues(program), [program])
  const methods = useForm<ProgramFormValues>({
    mode: 'onChange',
    resolver: zodResolver(programSchema(t)),
    defaultValues
  })
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = methods
  const requestClose = useUnsavedCloseGuard(isDirty, () => onOpenChange(false))

  useEffect(() => {
    if (open) reset(defaultValues)
  }, [open, defaultValues, reset])

  const submit = async (form: ProgramFormValues) => {
    const startAt = composeDateTime(form.startDate, form.startTime, false)
    const endAt = composeDateTime(form.endDate, form.endTime, true)

    if (startAt && !endAt) {
      const confirmed = await confirm({
        description: t('configsPage.vouchers.unlimitedEndDateConfirm', { date: displayDate(startAt) }),
        confirmText: t('common.confirm.confirmText'),
        cancelText: t('common.button.cancel')
      })
      if (!confirmed) return
    }

    const payload: CreateProgramPayload = {
      name: form.name.trim(),
      startAt,
      endAt: endAt || null,
      minOrderAmount: toNullableNumber(form.minOrderAmount),
      maxOrderAmount: toNullableNumber(form.maxOrderAmount)
    }

    onSubmit(program ? { ...payload, id: program.id } : payload)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : void requestClose())}>
      <DialogContent position='top-center' className='max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {t(program ? 'configsPage.vouchers.editProgram' : 'configsPage.vouchers.createProgram')}
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form noValidate onSubmit={handleSubmit(submit)} className='grid gap-x-4 gap-y-1 sm:grid-cols-2'>
            <VoucherTextField
              name='name'
              control={control}
              label={t('configsPage.vouchers.programName')}
              placeholder={t('configsPage.vouchers.programNamePlaceholder')}
              className='sm:col-span-2'
              isRequired
              autoFocus
            />
            <VoucherValidityFields control={control} />
            <VoucherNumberField
              name='minOrderAmount'
              control={control}
              label={t('configsPage.vouchers.minOrderAmount')}
              placeholder={t('configsPage.vouchers.unlimited')}
              suffix={t('configsPage.vouchers.currency')}
              min={0}
              nullable
            />
            <VoucherNumberField
              name='maxOrderAmount'
              control={control}
              label={t('configsPage.vouchers.maxOrderAmount')}
              placeholder={t('configsPage.vouchers.unlimited')}
              suffix={t('configsPage.vouchers.currency')}
              min={0}
              nullable
            />
            <VoucherFormFooter
              label={t('configsPage.dialog.save')}
              pending={pending}
              onCancel={() => void requestClose()}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
