import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { zodResolver } from '@hookform/resolvers/zod'
import { parseISO } from 'date-fns'
import { useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { CreateVoucherPayload, UpdateVoucherItem, Voucher, VoucherDiscountType, VoucherVisibility } from '../types'
import { voucherSchema } from '../validations'
import { dateValue, displayDate, displayNumberInput, parseNumberInput, timeValue } from './voucher-date-utils'
import { VoucherDateRangeField, VoucherField, VoucherInputWithSuffix } from './voucher-form-fields'

type VoucherFormValues = {
  code: string
  codePrefix: string
  codeLength: number
  codeSuffix: string
  description: string
  visibility: VoucherVisibility
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscountAmount: string | number | null
  maxUsageCount: number
  startAt: string
  endAt: string
  minOrderAmount: string | number | null
  maxOrderAmount: string | number | null
}

export function VoucherFormDialog({
  open,
  voucher,
  onOpenChange,
  onSubmit,
  pending
}: {
  open: boolean
  voucher?: Voucher | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreateVoucherPayload | UpdateVoucherItem) => void
  pending: boolean
}) {
  const { t } = useTenantTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>
            {t(voucher ? 'configsPage.vouchers.editTitle' : 'configsPage.vouchers.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('configsPage.vouchers.formDescription')}</DialogDescription>
        </DialogHeader>
        <VoucherForm voucher={voucher} onCancel={() => onOpenChange(false)} onSubmit={onSubmit} pending={pending} />
      </DialogContent>
    </Dialog>
  )
}

function VoucherForm({
  voucher,
  onCancel,
  onSubmit,
  pending
}: {
  voucher?: Voucher | null
  onCancel: () => void
  onSubmit: (payload: CreateVoucherPayload | UpdateVoucherItem) => void
  pending: boolean
}) {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const [codeMode, setCodeMode] = useState<'manual' | 'generated'>('manual')
  const methods = useForm<VoucherFormValues>({
    mode: 'onChange',
    resolver: zodResolver(voucherSchema(t, voucher?.usedCount ?? 0, voucher ? 'edit' : codeMode)),
    defaultValues: {
      code: voucher?.code ?? '',
      codePrefix: 'HTM',
      codeLength: 7,
      codeSuffix: '',
      description: voucher?.description ?? '',
      discountValue: voucher?.discountValue ?? 20,
      maxDiscountAmount: voucher?.maxDiscountAmount ?? '',
      maxUsageCount: voucher?.maxUsageCount ?? 1,
      startAt: voucher?.startAt ?? '',
      endAt: voucher?.endAt ?? '',
      minOrderAmount: voucher?.minOrderAmount ?? '',
      maxOrderAmount: voucher?.maxOrderAmount ?? '',
      visibility: voucher?.visibility ?? 'public',
      discountType: voucher?.discountType ?? 'percent'
    }
  })
  const {
    register,
    control,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors }
  } = methods
  const values = useWatch({ control }) as VoucherFormValues
  const submit = async (form: VoucherFormValues) => {
    if (form.startAt && !form.endAt) {
      const confirmed = await confirm({
        description: t('configsPage.vouchers.unlimitedEndDateConfirm', { date: displayDate(form.startAt) }),
        confirmText: t('common.confirm.confirmText'),
        cancelText: t('common.button.cancel')
      })
      if (!confirmed) return
    }

    if (voucher) {
      onSubmit({
        id: voucher.id,
        description: form.description,
        visibility: form.visibility,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscountAmount:
          form.discountType === 'percent' && form.maxDiscountAmount !== '' && form.maxDiscountAmount !== null
            ? Number(form.maxDiscountAmount)
            : null,
        maxUsageCount: Number(form.maxUsageCount),
        startAt: form.startAt,
        endAt: form.endAt || null,
        minOrderAmount: form.minOrderAmount === '' ? null : Number(form.minOrderAmount),
        maxOrderAmount: form.maxOrderAmount === '' ? null : Number(form.maxOrderAmount)
      })
      return
    }
    onSubmit({
      ...(codeMode === 'manual'
        ? { code: form.code }
        : { codePrefix: form.codePrefix, codeLength: Number(form.codeLength), codeSuffix: form.codeSuffix }),
      description: form.description,
      visibility: form.visibility,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscountAmount:
        form.discountType === 'percent' && form.maxDiscountAmount !== '' && form.maxDiscountAmount !== null
          ? Number(form.maxDiscountAmount)
          : null,
      maxUsageCount: Number(form.maxUsageCount),
      startAt: form.startAt,
      endAt: form.endAt || null,
      minOrderAmount: form.minOrderAmount === '' ? null : Number(form.minOrderAmount),
      maxOrderAmount: form.maxOrderAmount === '' ? null : Number(form.maxOrderAmount)
    })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submit)} className='grid gap-4 sm:grid-cols-2'>
        {!voucher && (
          <VoucherField label={t('configsPage.vouchers.codeMode')}>
            <Select value={codeMode} onValueChange={(value) => setCodeMode(value as typeof codeMode)}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='manual'>{t('configsPage.vouchers.manualCode')}</SelectItem>
                <SelectItem value='generated'>{t('configsPage.vouchers.generatedCode')}</SelectItem>
              </SelectContent>
            </Select>
          </VoucherField>
        )}
        {!voucher && codeMode === 'manual' && (
          <VoucherField label={t('configsPage.vouchers.code')} error={errors.code?.message}>
            <Input
              {...register('code')}
              value={values.code}
              onChange={(event) => setValue('code', event.target.value.toUpperCase(), { shouldValidate: true })}
            />
          </VoucherField>
        )}
        {!voucher && codeMode === 'generated' && (
          <>
            <VoucherField label={t('configsPage.vouchers.codePrefix')} error={errors.codePrefix?.message}>
              <Input
                {...register('codePrefix')}
                value={values.codePrefix}
                onChange={(event) => setValue('codePrefix', event.target.value.toUpperCase(), { shouldValidate: true })}
              />
            </VoucherField>
            <VoucherField label={t('configsPage.vouchers.codeLength')} error={errors.codeLength?.message}>
              <Input
                type='number'
                min={5}
                max={10}
                {...register('codeLength', { valueAsNumber: true })}
                value={values.codeLength}
                onChange={(event) => setValue('codeLength', Number(event.target.value), { shouldValidate: true })}
              />
            </VoucherField>
            <VoucherField label={t('configsPage.vouchers.codeSuffix')} error={errors.codeSuffix?.message}>
              <Input
                {...register('codeSuffix')}
                value={values.codeSuffix}
                onChange={(event) => setValue('codeSuffix', event.target.value.toUpperCase(), { shouldValidate: true })}
              />
            </VoucherField>
          </>
        )}
        <VoucherField label={t('configsPage.vouchers.visibility')}>
          <Select
            value={values.visibility}
            onValueChange={(value) => setValue('visibility', value as VoucherVisibility, { shouldValidate: true })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='public'>{t('configsPage.vouchers.types.public')}</SelectItem>
              <SelectItem value='private'>{t('configsPage.vouchers.types.private')}</SelectItem>
            </SelectContent>
          </Select>
        </VoucherField>
        <VoucherField label={t('configsPage.vouchers.discountType')}>
          <Select
            value={values.discountType}
            disabled={Boolean(voucher)}
            onValueChange={(value) => {
              setValue('discountType', value as VoucherDiscountType)
              if (value === 'cash') setValue('maxDiscountAmount', '')
              void trigger(['discountValue', 'maxDiscountAmount'])
            }}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='percent'>{t('configsPage.vouchers.kinds.percent')}</SelectItem>
              <SelectItem value='cash'>{t('configsPage.vouchers.kinds.cash')}</SelectItem>
            </SelectContent>
          </Select>
        </VoucherField>
        <VoucherField label={t('configsPage.vouchers.discountValue')} error={errors.discountValue?.message}>
          <VoucherInputWithSuffix
            type='number'
            min={0}
            {...register('discountValue', { valueAsNumber: true })}
            value={displayNumberInput(values.discountValue)}
            suffix={values.discountType === 'percent' ? '%' : t('configsPage.vouchers.currency')}
            onChange={(event) =>
              setValue('discountValue', parseNumberInput(event.target.value), { shouldValidate: true })
            }
          />
        </VoucherField>
        {values.discountType === 'percent' && (
          <VoucherField label={t('configsPage.vouchers.maxDiscountAmount')} error={errors.maxDiscountAmount?.message}>
            <VoucherInputWithSuffix
              type='number'
              min={0}
              {...register('maxDiscountAmount')}
              value={values.maxDiscountAmount ?? ''}
              suffix={t('configsPage.vouchers.currency')}
              onChange={(event) => setValue('maxDiscountAmount', event.target.value, { shouldValidate: true })}
            />
          </VoucherField>
        )}
        <div className='grid gap-4 sm:col-span-2 sm:grid-cols-2'>
          <VoucherField label={t('configsPage.vouchers.minOrderAmount')} error={errors.minOrderAmount?.message}>
            <VoucherInputWithSuffix
              {...register('minOrderAmount')}
              type='number'
              min={0}
              value={values.minOrderAmount ?? ''}
              suffix={t('configsPage.vouchers.currency')}
              onChange={(event) => setValue('minOrderAmount', event.target.value, { shouldValidate: true })}
            />
          </VoucherField>
          <VoucherField label={t('configsPage.vouchers.maxOrderAmount')} error={errors.maxOrderAmount?.message}>
            <VoucherInputWithSuffix
              {...register('maxOrderAmount')}
              type='number'
              min={0}
              value={values.maxOrderAmount ?? ''}
              suffix={t('configsPage.vouchers.currency')}
              onChange={(event) => setValue('maxOrderAmount', event.target.value, { shouldValidate: true })}
            />
          </VoucherField>
        </div>
        <VoucherField label={t('configsPage.vouchers.maxUsageCount')} error={errors.maxUsageCount?.message}>
          <Input
            type='number'
            min={1}
            {...register('maxUsageCount', { valueAsNumber: true })}
            value={values.maxUsageCount}
            onChange={(event) => setValue('maxUsageCount', Number(event.target.value), { shouldValidate: true })}
          />
        </VoucherField>
        <VoucherField
          label={t('configsPage.vouchers.validityPeriod')}
          error={errors.startAt?.message || errors.endAt?.message}
          className='sm:col-span-2'
        >
          <VoucherDateRangeField
            startAt={values.startAt}
            endAt={values.endAt}
            onSelect={(next) => {
              setValue('startAt', dateValue(next?.from, false, timeValue(values.startAt, '00:00')), {
                shouldValidate: true
              })
              setValue('endAt', dateValue(next?.to, true, timeValue(values.endAt, '23:59')), {
                shouldValidate: true
              })
            }}
            startTime={timeValue(values.startAt, '00:00')}
            endTime={timeValue(values.endAt, '23:59')}
            onTimeChange={(field, value) => {
              const current = field === 'start' ? values.startAt : values.endAt
              const date = current ? parseISO(current) : undefined
              setValue(field === 'start' ? 'startAt' : 'endAt', dateValue(date, field === 'end', value), {
                shouldValidate: true
              })
            }}
          />
        </VoucherField>
        <VoucherField label={t('configsPage.vouchers.description')} className='sm:col-span-2'>
          <Textarea
            {...register('description')}
            value={values.description}
            onChange={(event) => setValue('description', event.target.value)}
          />
        </VoucherField>
        <DialogFooter className='sm:col-span-2'>
          <Button type='button' variant='outline' onClick={onCancel}>
            {t('common.button.cancel')}
          </Button>
          <Button type='submit' disabled={pending}>
            {t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  )
}
