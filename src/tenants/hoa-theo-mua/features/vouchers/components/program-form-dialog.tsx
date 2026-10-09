import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { zodResolver } from '@hookform/resolvers/zod'
import { parseISO } from 'date-fns'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { CreateProgramPayload, VoucherProgram } from '../types'
import { programSchema } from '../validations'
import { dateValue, displayDate, timeValue } from './voucher-date-utils'
import { VoucherDateRangeField, VoucherField, VoucherInputWithSuffix } from './voucher-form-fields'

type ProgramFormValues = {
  name: string
  startAt: string
  endAt: string
  minOrderAmount: string | number | null
  maxOrderAmount: string | number | null
}

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
  onSubmit: (payload: CreateProgramPayload | ({ id: string } & Partial<CreateProgramPayload>)) => void
  pending: boolean
}) {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const methods = useForm<ProgramFormValues>({
    mode: 'onChange',
    resolver: zodResolver(programSchema(t)),
    defaultValues: {
      name: program?.name ?? '',
      startAt: program?.startAt ?? '',
      endAt: program?.endAt ?? '',
      minOrderAmount: program?.minOrderAmount ?? '',
      maxOrderAmount: program?.maxOrderAmount ?? ''
    }
  })
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = methods
  const form = useWatch({ control }) as ProgramFormValues
  const submit = async (form: ProgramFormValues) => {
    if (form.startAt && !form.endAt) {
      const confirmed = await confirm({
        description: t('configsPage.vouchers.unlimitedEndDateConfirm', { date: displayDate(form.startAt) }),
        confirmText: t('common.confirm.confirmText'),
        cancelText: t('common.button.cancel')
      })
      if (!confirmed) return
    }

    onSubmit(
      program
        ? {
            id: program.id,
            name: form.name.trim(),
            startAt: form.startAt,
            endAt: form.endAt,
            minOrderAmount: form.minOrderAmount === '' ? null : Number(form.minOrderAmount),
            maxOrderAmount: form.maxOrderAmount === '' ? 0 : Number(form.maxOrderAmount)
          }
        : {
            name: form.name.trim(),
            startAt: form.startAt,
            endAt: form.endAt,
            minOrderAmount: form.minOrderAmount === '' ? null : Number(form.minOrderAmount),
            maxOrderAmount: form.maxOrderAmount === '' ? 0 : Number(form.maxOrderAmount)
          }
    )
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>
            {t(program ? 'configsPage.vouchers.editProgram' : 'configsPage.vouchers.createProgram')}
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(submit)} className='grid gap-4'>
            <VoucherField
              label={t('configsPage.vouchers.programName')}
              error={errors.name?.message}
              className='w-full sm:col-span-2'
            >
              <Input
                {...register('name')}
                value={form.name}
                onChange={(event) => setValue('name', event.target.value, { shouldValidate: true })}
              />
            </VoucherField>
            <VoucherField
              label={t('configsPage.vouchers.validityPeriod')}
              error={errors.startAt?.message || errors.endAt?.message}
              className='sm:col-span-2'
            >
              <VoucherDateRangeField
                startAt={form.startAt}
                endAt={form.endAt}
                onSelect={(next) => {
                  setValue('startAt', dateValue(next?.from, false, timeValue(form.startAt, '00:00')), {
                    shouldValidate: true
                  })
                  setValue('endAt', dateValue(next?.to, true, timeValue(form.endAt, '23:59')), { shouldValidate: true })
                }}
                startTime={timeValue(form.startAt, '00:00')}
                endTime={timeValue(form.endAt, '23:59')}
                onTimeChange={(field, value) => {
                  const current = field === 'start' ? form.startAt : form.endAt
                  const date = current ? parseISO(current) : undefined
                  setValue(field === 'start' ? 'startAt' : 'endAt', dateValue(date, field === 'end', value), {
                    shouldValidate: true
                  })
                }}
              />
            </VoucherField>
            <div className='grid w-full grid-cols-2 gap-3 sm:col-span-2'>
              <VoucherField label={t('configsPage.vouchers.minOrderAmount')} error={errors.minOrderAmount?.message}>
                <VoucherInputWithSuffix
                  {...register('minOrderAmount')}
                  type='number'
                  value={form.minOrderAmount ?? ''}
                  suffix={t('configsPage.vouchers.currency')}
                  onChange={(event) => setValue('minOrderAmount', event.target.value, { shouldValidate: true })}
                />
              </VoucherField>
              <VoucherField label={t('configsPage.vouchers.maxOrderAmount')} error={errors.maxOrderAmount?.message}>
                <VoucherInputWithSuffix
                  {...register('maxOrderAmount')}
                  type='number'
                  value={form.maxOrderAmount ?? ''}
                  suffix={t('configsPage.vouchers.currency')}
                  onChange={(event) => setValue('maxOrderAmount', event.target.value, { shouldValidate: true })}
                />
              </VoucherField>
            </div>
            <DialogFooter className='sm:col-span-2'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                {t('common.button.cancel')}
              </Button>
              <Button type='submit' disabled={pending}>
                {t('configsPage.dialog.save')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
