import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { parseISO } from 'date-fns'
import { Download, Gift, Plus } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useDataTable } from '@/hooks/use-data-table'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../config'
import EditorSection from '../../configs/components/shared/editor-section'
import { dateValue, timeValue } from './voucher-date-utils'
import { VoucherDateRangeField, VoucherField, VoucherInputWithSuffix } from './voucher-form-fields'
import { getVoucherColumns } from './voucher-columns'
import { getVoucherProgramColumns } from './voucher-program-columns'
import { getVoucherUsageColumns } from './voucher-usage-columns'
import { VoucherDetailDialog } from './voucher-detail-dialog'
import {
  useCreateVoucher,
  useCreateVoucherProgram,
  useDeleteVoucher,
  useDeleteVoucherProgram,
  useGenerateVouchers,
  useGetVoucherPrograms,
  useGetVoucherUsages,
  useGetVouchers,
  useSetVoucherProgramActive,
  useSetVouchersActive,
  useUpdateVoucherProgram,
  useUpdateVouchers
} from '../hooks'
import type {
  CreateProgramPayload,
  CreateVoucherPayload,
  GenerateVouchersPayload,
  UpdateVoucherItem,
  Voucher,
  VoucherDiscountType,
  VoucherProgram,
  VoucherUsage,
  VoucherVisibility
} from '../types'

type View = 'vouchers' | 'programs'

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

type ProgramFormValues = {
  name: string
  startAt: string
  endAt: string
  minOrderAmount: string | number | null
  maxOrderAmount: string | number | null
}

type GenerateFormValues = GenerateVouchersPayload

function isEmpty(value: string | number | null | undefined) {
  return value === '' || value == null
}

function VoucherFormDialog({
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
  const [codeMode, setCodeMode] = useState<'manual' | 'generated'>('manual')
  const methods = useForm<VoucherFormValues>({
    mode: 'onChange',
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
    handleSubmit,
    getValues,
    formState: { errors }
  } = methods
  const values = useWatch({ control }) as VoucherFormValues
  register('startAt', {
    validate: (value) => {
      if (!value) return t('configsPage.vouchers.validityRequired')
      return !values.endAt || parseISO(values.endAt) > parseISO(value) || t('configsPage.vouchers.endDateValidation')
    }
  })
  register('endAt', {
    validate: (value) => {
      if (!value) return t('configsPage.vouchers.validityRequired')
      return (
        !values.startAt || parseISO(value) > parseISO(values.startAt) || t('configsPage.vouchers.endDateValidation')
      )
    }
  })
  const amountValidation = () => {
    const min = getValues('minOrderAmount')
    const max = getValues('maxOrderAmount')
    if (isEmpty(min) || isEmpty(max)) return true
    return Number(min) <= Number(max) ? true : t('configsPage.vouchers.minOrderAmountValidation')
  }
  const submit = (form: VoucherFormValues) => {
    if (voucher) {
      onSubmit({
        id: voucher.id,
        description: form.description,
        visibility: form.visibility,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscountAmount:
          form.discountType === 'percent' && !isEmpty(form.maxDiscountAmount) ? Number(form.maxDiscountAmount) : null,
        maxUsageCount: Number(form.maxUsageCount),
        startAt: form.startAt,
        endAt: form.endAt,
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
        form.discountType === 'percent' && !isEmpty(form.maxDiscountAmount) ? Number(form.maxDiscountAmount) : null,
      maxUsageCount: Number(form.maxUsageCount),
      startAt: form.startAt,
      endAt: form.endAt,
      minOrderAmount: form.minOrderAmount === '' ? null : Number(form.minOrderAmount),
      maxOrderAmount: form.maxOrderAmount === '' ? null : Number(form.maxOrderAmount)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>
            {t(voucher ? 'configsPage.vouchers.editTitle' : 'configsPage.vouchers.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('configsPage.vouchers.formDescription')}</DialogDescription>
        </DialogHeader>
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
                  {...register('code', {
                    validate: (value) =>
                      /^[A-Z0-9]{4,20}$/.test(value.trim()) || t('configsPage.vouchers.codeFormatValidation')
                  })}
                  value={values.code}
                  onChange={(event) => setValue('code', event.target.value.toUpperCase(), { shouldValidate: true })}
                />
              </VoucherField>
            )}
            {!voucher && codeMode === 'generated' && (
              <>
                <VoucherField label={t('configsPage.vouchers.codePrefix')}>
                  <Input
                    {...register('codePrefix', {
                      validate: (value) =>
                        /^[A-Z0-9]*$/.test(value) || t('configsPage.vouchers.generatedCodeValidation')
                    })}
                    value={values.codePrefix}
                    onChange={(event) =>
                      setValue('codePrefix', event.target.value.toUpperCase(), { shouldValidate: true })
                    }
                  />
                </VoucherField>
                <VoucherField label={t('configsPage.vouchers.codeLength')}>
                  <Input
                    type='number'
                    min={5}
                    max={10}
                    {...register('codeLength', {
                      valueAsNumber: true,
                      validate: (value) =>
                        (value >= 5 &&
                          value <= 10 &&
                          values.codePrefix.length + value + values.codeSuffix.length <= 20) ||
                        t('configsPage.vouchers.generatedCodeValidation')
                    })}
                    value={values.codeLength}
                    onChange={(event) => setValue('codeLength', Number(event.target.value), { shouldValidate: true })}
                  />
                </VoucherField>
                <VoucherField label={t('configsPage.vouchers.codeSuffix')}>
                  <Input
                    {...register('codeSuffix', {
                      validate: (value) =>
                        /^[A-Z0-9]*$/.test(value) || t('configsPage.vouchers.generatedCodeValidation')
                    })}
                    value={values.codeSuffix}
                    onChange={(event) =>
                      setValue('codeSuffix', event.target.value.toUpperCase(), { shouldValidate: true })
                    }
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
                onValueChange={(value) =>
                  setValue('discountType', value as VoucherDiscountType, { shouldValidate: true })
                }
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
            <VoucherField label={t('configsPage.vouchers.discountValue')}>
              <VoucherInputWithSuffix
                type='number'
                min={0}
                {...register('discountValue', {
                  valueAsNumber: true,
                  validate: (value) =>
                    (value > 0 && (values.discountType !== 'percent' || value <= 100)) ||
                    t('configsPage.vouchers.discountValueValidation')
                })}
                value={values.discountValue}
                suffix={values.discountType === 'percent' ? '%' : t('configsPage.vouchers.currency')}
                onChange={(event) => setValue('discountValue', Number(event.target.value), { shouldValidate: true })}
              />
            </VoucherField>
            {values.discountType === 'percent' && (
              <VoucherField
                label={t('configsPage.vouchers.maxDiscountAmount')}
                error={errors.maxDiscountAmount?.message}
              >
                <VoucherInputWithSuffix
                  type='number'
                  min={0}
                  {...register('maxDiscountAmount', {
                    validate: (value) =>
                      isEmpty(value) || Number(value) > 0 || t('configsPage.vouchers.maxDiscountValidation')
                  })}
                  value={values.maxDiscountAmount ?? ''}
                  suffix={t('configsPage.vouchers.currency')}
                  onChange={(event) => setValue('maxDiscountAmount', event.target.value, { shouldValidate: true })}
                />
              </VoucherField>
            )}
            <div className='grid gap-4 sm:col-span-2 sm:grid-cols-2'>
              <VoucherField label={t('configsPage.vouchers.minOrderAmount')} error={errors.minOrderAmount?.message}>
                <VoucherInputWithSuffix
                  {...register('minOrderAmount', { validate: amountValidation })}
                  type='number'
                  min={0}
                  value={values.minOrderAmount ?? ''}
                  suffix={t('configsPage.vouchers.currency')}
                  onChange={(event) => setValue('minOrderAmount', event.target.value, { shouldValidate: true })}
                />
              </VoucherField>
              <VoucherField label={t('configsPage.vouchers.maxOrderAmount')} error={errors.maxOrderAmount?.message}>
                <VoucherInputWithSuffix
                  {...register('maxOrderAmount', { validate: amountValidation })}
                  type='number'
                  min={0}
                  value={values.maxOrderAmount ?? ''}
                  suffix={t('configsPage.vouchers.currency')}
                  onChange={(event) => setValue('maxOrderAmount', event.target.value, { shouldValidate: true })}
                />
              </VoucherField>
            </div>
            <VoucherField label={t('configsPage.vouchers.maxUsageCount')}>
              <Input
                type='number'
                min={1}
                {...register('maxUsageCount', {
                  valueAsNumber: true,
                  validate: (value) => value > 0 || t('configsPage.vouchers.maxUsageValidation')
                })}
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

function ProgramFormDialog({
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
  const methods = useForm<ProgramFormValues>({
    mode: 'onChange',
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
    getValues,
    formState: { errors }
  } = methods
  const form = useWatch({ control }) as ProgramFormValues
  register('startAt', {
    validate: (value) =>
      !value
        ? t('configsPage.vouchers.validityRequired')
        : !form.endAt || parseISO(form.endAt) > parseISO(value) || t('configsPage.vouchers.endDateValidation')
  })
  register('endAt', {
    validate: (value) =>
      !value
        ? t('configsPage.vouchers.validityRequired')
        : !form.startAt || parseISO(value) > parseISO(form.startAt) || t('configsPage.vouchers.endDateValidation')
  })
  const amountValidation = () => {
    const min = getValues('minOrderAmount')
    const max = getValues('maxOrderAmount')
    if (isEmpty(min) || isEmpty(max)) return true
    return Number(min) <= Number(max) || t('configsPage.vouchers.minOrderAmountValidation')
  }
  const submit = (form: ProgramFormValues) => {
    onSubmit(
      program
        ? {
            id: program.id,
            name: form.name.trim(),
            startAt: form.startAt,
            endAt: form.endAt,
            minOrderAmount: form.minOrderAmount === '' ? null : Number(form.minOrderAmount),
            maxOrderAmount: form.maxOrderAmount === '' ? null : Number(form.maxOrderAmount)
          }
        : {
            name: form.name.trim(),
            startAt: form.startAt,
            endAt: form.endAt,
            minOrderAmount: form.minOrderAmount === '' ? null : Number(form.minOrderAmount),
            maxOrderAmount: form.maxOrderAmount === '' ? null : Number(form.maxOrderAmount)
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
                {...register('name', {
                  validate: (value) => (value.trim() ? true : t('configsPage.vouchers.programNameValidation'))
                })}
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
                  {...register('minOrderAmount', { validate: amountValidation })}
                  type='number'
                  value={form.minOrderAmount ?? ''}
                  suffix={t('configsPage.vouchers.currency')}
                  onChange={(event) => setValue('minOrderAmount', event.target.value, { shouldValidate: true })}
                />
              </VoucherField>
              <VoucherField label={t('configsPage.vouchers.maxOrderAmount')} error={errors.maxOrderAmount?.message}>
                <VoucherInputWithSuffix
                  {...register('maxOrderAmount', { validate: amountValidation })}
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

export function GenerateDialog({
  open,
  program,
  onOpenChange,
  onSubmit,
  pending
}: {
  open: boolean
  program: VoucherProgram | null
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: GenerateVouchersPayload) => void
  pending: boolean
}) {
  const { t } = useTenantTranslation()
  const methods = useForm<GenerateFormValues>({
    mode: 'onChange',
    defaultValues: {
      codePrefix: 'HTM',
      codeLength: 7,
      codeSuffix: '',
      quantity: 1,
      maxUsageCount: 1,
      discountType: 'percent',
      discountValue: 20,
      maxDiscountAmount: null,
      description: ''
    }
  })
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = methods
  const form = useWatch({ control }) as GenerateFormValues
  const maxQuantity = Math.min(1000, Math.max(0, 10000 - (program?.voucherCount ?? 0)))
  const submit = (form: GenerateFormValues) => {
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{t('configsPage.vouchers.generateTitle')}</DialogTitle>
          <DialogDescription>{program?.name}</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(submit)} className='grid gap-4 sm:grid-cols-2'>
            <VoucherField label={t('configsPage.vouchers.codePrefix')} error={errors.codePrefix?.message}>
              <Input
                {...register('codePrefix', {
                  validate: (value) =>
                    /^[A-Z0-9]*$/.test(value ?? '') || t('configsPage.vouchers.generatedCodeValidation')
                })}
                value={form.codePrefix ?? ''}
                onChange={(event) => setValue('codePrefix', event.target.value.toUpperCase(), { shouldValidate: true })}
              />
            </VoucherField>
            <VoucherField label={t('configsPage.vouchers.codeLength')} error={errors.codeLength?.message}>
              <Input
                type='number'
                min={5}
                max={10}
                {...register('codeLength', {
                  valueAsNumber: true,
                  validate: (value) =>
                    (value >= 5 &&
                      value <= 10 &&
                      (form.codePrefix ?? '').length + value + (form.codeSuffix ?? '').length <= 20) ||
                    t('configsPage.vouchers.generatedCodeValidation')
                })}
                value={form.codeLength}
                onChange={(event) => setValue('codeLength', Number(event.target.value), { shouldValidate: true })}
              />
            </VoucherField>
            <VoucherField label={t('configsPage.vouchers.quantity')} error={errors.quantity?.message}>
              <Input
                type='number'
                min={1}
                max={1000}
                {...register('quantity', {
                  valueAsNumber: true,
                  validate: (value) =>
                    (value >= 1 && value <= maxQuantity) ||
                    t('configsPage.vouchers.quantityValidation', { max: maxQuantity })
                })}
                value={form.quantity ?? 1}
                onChange={(event) => setValue('quantity', Number(event.target.value), { shouldValidate: true })}
              />
            </VoucherField>
            <VoucherField label={t('configsPage.vouchers.maxUsageCount')} error={errors.maxUsageCount?.message}>
              <Input
                type='number'
                min={1}
                {...register('maxUsageCount', {
                  valueAsNumber: true,
                  validate: (value) => value > 0 || t('configsPage.vouchers.maxUsageValidation')
                })}
                value={form.maxUsageCount ?? 1}
                onChange={(event) => setValue('maxUsageCount', Number(event.target.value), { shouldValidate: true })}
              />
            </VoucherField>
            <VoucherField label={t('configsPage.vouchers.discountType')}>
              <Select
                value={form.discountType}
                onValueChange={(value) =>
                  setValue('discountType', value as GenerateFormValues['discountType'], { shouldValidate: true })
                }
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
                {...register('discountValue', {
                  valueAsNumber: true,
                  validate: (value) =>
                    (value > 0 && (form.discountType !== 'percent' || value <= 100)) ||
                    t('configsPage.vouchers.discountValueValidation')
                })}
                value={form.discountValue}
                suffix={form.discountType === 'percent' ? '%' : t('configsPage.vouchers.currency')}
                onChange={(event) => setValue('discountValue', Number(event.target.value), { shouldValidate: true })}
              />
            </VoucherField>
            {form.discountType === 'percent' && (
              <VoucherField
                label={t('configsPage.vouchers.maxDiscountAmount')}
                error={errors.maxDiscountAmount?.message}
              >
                <VoucherInputWithSuffix
                  type='number'
                  min={0}
                  {...register('maxDiscountAmount', {
                    validate: (value) =>
                      isEmpty(value) || Number(value) > 0 || t('configsPage.vouchers.maxDiscountValidation')
                  })}
                  value={form.maxDiscountAmount ?? ''}
                  suffix={t('configsPage.vouchers.currency')}
                  onChange={(event) =>
                    setValue('maxDiscountAmount', event.target.value ? Number(event.target.value) : null, {
                      shouldValidate: true
                    })
                  }
                />
              </VoucherField>
            )}
            <div className='sm:col-span-2'>
              <VoucherField label={t('configsPage.vouchers.description')}>
                <Textarea
                  {...register('description')}
                  value={form.description}
                  onChange={(event) => setValue('description', event.target.value)}
                />
              </VoucherField>
            </div>
            <DialogFooter className='sm:col-span-2'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                {t('common.button.cancel')}
              </Button>
              <Button type='submit' disabled={pending || !program}>
                {t('configsPage.vouchers.generate')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default function VouchersEditor() {
  const { t } = useTenantTranslation()
  const navigate = useNavigate()
  const { confirm } = useConfirmStore()
  const [viewTab] = useQueryState('tab', parseAsString)
  const [view, setView] = useState<View>(viewTab === 'program' ? 'programs' : 'vouchers')
  const [keyword] = useQueryState('vouchers_code', parseAsString)
  const [programKeyword] = useQueryState('voucher_programs_name', parseAsString)
  const [visibilityFilter] = useQueryState('vouchers_visibility', parseAsString)
  const visibility: VoucherVisibility | undefined =
    visibilityFilter === 'public' || visibilityFilter === 'private' ? visibilityFilter : undefined
  const [voucherPage] = useQueryState('vouchers_page', parseAsInteger)
  const [voucherPerPage] = useQueryState('vouchers_perPage', parseAsInteger)
  const [programPage] = useQueryState('voucher_programs_page', parseAsInteger)
  const [programPerPage] = useQueryState('voucher_programs_perPage', parseAsInteger)
  const [dialog, setDialog] = useState<'voucher' | 'program' | 'generate' | null>(null)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [detailVoucher, setDetailVoucher] = useState<Voucher | null>(null)
  const [editingProgram, setEditingProgram] = useState<VoucherProgram | null>(null)
  const [generateProgram, setGenerateProgram] = useState<VoucherProgram | null>(null)
  const [usageVoucherId, setUsageVoucherId] = useState<string | null>(null)
  const [usagePage] = useQueryState('voucher_usages_page', parseAsInteger)
  const [usagePerPage] = useQueryState('voucher_usages_perPage', parseAsInteger)
  const voucherParams = useMemo(
    () => ({
      pageIndex: voucherPage ?? 1,
      pageSize: voucherPerPage ?? 20,
      keyword: keyword || undefined,
      visibility
    }),
    [keyword, voucherPage, voucherPerPage, visibility]
  )
  const programParams = useMemo(
    () => ({
      pageIndex: programPage ?? 1,
      pageSize: programPerPage ?? 20,
      keyword: programKeyword || undefined
    }),
    [programKeyword, programPage, programPerPage]
  )
  const { vouchers } = useGetVouchers(voucherParams)
  const { programs } = useGetVoucherPrograms(programParams)
  const { usages } = useGetVoucherUsages(usageVoucherId, {
    pageIndex: usagePage ?? 1,
    pageSize: usagePerPage ?? 20
  })
  const { createVoucher, isCreatingVoucher } = useCreateVoucher()
  const { updateVouchers, isUpdatingVouchers } = useUpdateVouchers()
  const { setVouchersActive, isSettingVouchersActive } = useSetVouchersActive()
  const { deleteVoucher, isDeletingVoucher } = useDeleteVoucher()
  const { createVoucherProgram, isCreatingVoucherProgram } = useCreateVoucherProgram()
  const { updateVoucherProgram, isUpdatingVoucherProgram } = useUpdateVoucherProgram()
  const { setVoucherProgramActive } = useSetVoucherProgramActive()
  const { deleteVoucherProgram, isDeletingVoucherProgram } = useDeleteVoucherProgram()
  const { generateVouchers, isGeneratingVouchers } = useGenerateVouchers()
  const mutations = {
    createVoucher: { mutate: createVoucher, isPending: isCreatingVoucher },
    updateVouchers: { mutate: updateVouchers, isPending: isUpdatingVouchers },
    setVouchersActive: { mutate: setVouchersActive, isPending: isSettingVouchersActive },
    deleteVoucher: { mutate: deleteVoucher, isPending: isDeletingVoucher },
    createProgram: { mutate: createVoucherProgram, isPending: isCreatingVoucherProgram },
    updateProgram: { mutate: updateVoucherProgram, isPending: isUpdatingVoucherProgram },
    deleteProgram: { mutate: deleteVoucherProgram, isPending: isDeletingVoucherProgram },
    generateVouchers: { mutate: generateVouchers, isPending: isGeneratingVouchers }
  }
  const voucherItems = vouchers.data?.items ?? []
  const programItems = programs.data?.items ?? []

  const requestDelete = useCallback(
    async (target: { type: 'voucher'; id: string } | { type: 'program'; id: string }) => {
      const isProgram = target.type === 'program'
      const confirmed = await confirm({
        title: t(
          isProgram ? 'configsPage.vouchers.deleteProgramConfirmTitle' : 'configsPage.vouchers.deleteConfirmTitle'
        ),
        description: t(
          isProgram
            ? 'configsPage.vouchers.deleteProgramConfirmDescription'
            : 'configsPage.vouchers.deleteConfirmDescription'
        ),
        confirmText: t('configsPage.vouchers.deleteConfirm'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })

      if (!confirmed) return

      if (target.type === 'program') {
        deleteVoucherProgram(target.id)
      } else {
        deleteVoucher(target.id)
      }
    },
    [confirm, deleteVoucher, deleteVoucherProgram, t]
  )

  const voucherColumns = useMemo(
    () =>
      getVoucherColumns({
        t,
        onEdit: (voucher) => {
          setEditingVoucher(voucher)
          setDialog('voucher')
        },
        onViewUsage: (voucher) => {
          setDetailVoucher(voucher)
          setUsageVoucherId(voucher.id)
        },
        onToggleActive: (voucher, isActive) => setVouchersActive({ ids: [voucher.id], isActive }),
        onDelete: (id) => void requestDelete({ type: 'voucher', id })
      }),
    [requestDelete, setVouchersActive, t]
  )
  const usageColumns = useMemo(() => getVoucherUsageColumns(t), [t])
  const programColumns = useMemo(
    () =>
      getVoucherProgramColumns({
        t,
        onViewDetail: (program) => navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers/programs/${program.id}`),
        onToggleActive: (program, isActive) => setVoucherProgramActive({ id: program.id, isActive }),
        onGenerate: (program) => {
          setGenerateProgram(program)
          setDialog('generate')
        },
        onEdit: (program) => {
          setEditingProgram(program)
          setDialog('program')
        },
        onDelete: (program) => void requestDelete({ type: 'program', id: program.id })
      }),
    [navigate, requestDelete, setVoucherProgramActive, t]
  )
  const { table: voucherTable } = useDataTable({
    data: voucherItems,
    columns: voucherColumns,
    pageCount: Math.ceil((vouchers.data?.totalCount ?? 0) / (voucherPerPage ?? 20)) || 1,
    initialState: { pagination: { pageIndex: 0, pageSize: 20 }, columnPinning: { right: ['actions'] } },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: { page: 'vouchers_page', perPage: 'vouchers_perPage', sort: 'vouchers_sort' },
    filterPrefix: 'vouchers'
  })
  const { table: usageTable } = useDataTable({
    data: usages.data?.items ?? [],
    columns: usageColumns,
    pageCount: Math.ceil((usages.data?.totalCount ?? 0) / (usagePerPage ?? 20)) || 1,
    initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
    getRowId: (row) => row.orderId,
    shallow: false,
    clearOnDefault: true,
    queryKeys: { page: 'voucher_usages_page', perPage: 'voucher_usages_perPage', sort: 'voucher_usages_sort' }
  })
  const { table: programTable } = useDataTable({
    data: programItems,
    columns: programColumns,
    pageCount: Math.ceil((programs.data?.totalCount ?? 0) / (programPerPage ?? 20)) || 1,
    initialState: { pagination: { pageIndex: 0, pageSize: 20 }, columnPinning: { right: ['actions'] } },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'voucher_programs_page',
      perPage: 'voucher_programs_perPage',
      sort: 'voucher_programs_sort'
    },
    filterPrefix: 'voucher_programs'
  })

  const success = (message: string) => {
    toast.success(message)
    setDialog(null)
    setEditingVoucher(null)
    setEditingProgram(null)
    setGenerateProgram(null)
  }
  const exportVouchers = async (params: { visibility?: string; programIds?: string[] } = {}) => {
    try {
      const exportParams = params.programIds?.length
        ? { programIds: params.programIds }
        : { visibility: params.visibility ?? visibility ?? 'all' }
      const blob = await (await import('../services')).default.exportVouchers(exportParams)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'vouchers.xlsx'
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(t('error.somethingWentWrong'), {
        description: (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
      })
    }
  }

  return (
    <div className='space-y-5'>
      <Tabs
        value={view}
        onValueChange={(value) => {
          setView(value as View)
          void navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/vouchers?tab=${value === 'programs' ? 'program' : 'list'}`)
        }}
      >
        <TabsList>
          <TabsTrigger value='vouchers'>
            <Gift className='size-4' />
            {t('configsPage.vouchers.list')}
          </TabsTrigger>
          <TabsTrigger value='programs'>
            <Gift className='size-4' />
            {t('configsPage.vouchers.programs')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='ml-auto flex gap-2'>
          {view === 'vouchers' && (
            <>
              <Button variant='outline' onClick={() => void exportVouchers()}>
                <Download />
                {t('configsPage.vouchers.export')}
              </Button>
              <Button
                onClick={() => {
                  setEditingVoucher(null)
                  setDialog('voucher')
                }}
              >
                <Plus />
                {t('configsPage.vouchers.create')}
              </Button>
            </>
          )}
          {view === 'programs' && (
            <>
              <Button
                variant='outline'
                disabled={programTable.getSelectedRowModel().rows.length === 0}
                onClick={() =>
                  void exportVouchers({
                    programIds: programTable.getSelectedRowModel().rows.map((row) => row.original.id)
                  })
                }
              >
                <Download />
                {t('configsPage.vouchers.export')}
              </Button>
              <Button
                onClick={() => {
                  setEditingProgram(null)
                  setDialog('program')
                }}
              >
                <Plus />
                {t('configsPage.vouchers.createProgram')}
              </Button>
            </>
          )}
        </div>
      </div>
      {view === 'vouchers' ? (
        <EditorSection title={t('configsPage.vouchers.list')} description={t('configsPage.vouchers.listDescription')}>
          <DataTable<Voucher> table={voucherTable} isLoading={vouchers.isLoading}>
            <DataTableToolbar<Voucher> table={voucherTable} />
            {/*
                      {voucher.discountType === 'percent' ? '%' : ' ₫'}
                    </td>
            */}
          </DataTable>
        </EditorSection>
      ) : (
        <EditorSection
          title={t('configsPage.vouchers.programs')}
          description={t('configsPage.vouchers.programDescription')}
        >
          <DataTable<VoucherProgram> table={programTable} isLoading={programs.isLoading}>
            <DataTableToolbar<VoucherProgram> table={programTable} />
          </DataTable>
        </EditorSection>
      )}
      {usageVoucherId && !detailVoucher && (
        <EditorSection
          title={t('configsPage.vouchers.usageHistory')}
          description={t('configsPage.vouchers.usageDescription')}
        >
          <div className='flex justify-end'>
            <Button variant='ghost' onClick={() => setUsageVoucherId(null)}>
              ×
            </Button>
          </div>
          <DataTable<VoucherUsage> table={usageTable} isLoading={usages.isLoading}>
            <DataTableToolbar<VoucherUsage> table={usageTable} />
          </DataTable>
        </EditorSection>
      )}
      <VoucherDetailDialog
        voucher={detailVoucher}
        open={Boolean(detailVoucher)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailVoucher(null)
            setUsageVoucherId(null)
          }
        }}
        usageTable={usageTable}
        isLoadingUsages={usages.isLoading}
        t={t}
      />
      <VoucherFormDialog
        key={`voucher-${editingVoucher?.id ?? 'new'}`}
        open={dialog === 'voucher'}
        voucher={editingVoucher}
        onOpenChange={(open) => !open && setDialog(null)}
        pending={mutations.createVoucher.isPending || mutations.updateVouchers.isPending}
        onSubmit={(payload) => {
          if ('id' in payload)
            mutations.updateVouchers.mutate([payload], { onSuccess: () => success(t('configsPage.vouchers.updated')) })
          else mutations.createVoucher.mutate(payload, { onSuccess: () => success(t('configsPage.vouchers.created')) })
        }}
      />
      <ProgramFormDialog
        key={`program-${editingProgram?.id ?? 'new'}`}
        open={dialog === 'program'}
        program={editingProgram}
        onOpenChange={(open) => !open && setDialog(null)}
        pending={mutations.createProgram.isPending || mutations.updateProgram.isPending}
        onSubmit={(payload) => {
          if ('id' in payload)
            mutations.updateProgram.mutate(payload, { onSuccess: () => success(t('configsPage.vouchers.updated')) })
          else mutations.createProgram.mutate(payload, { onSuccess: () => success(t('configsPage.vouchers.created')) })
        }}
      />
      <GenerateDialog
        key={`generate-${generateProgram?.id ?? 'new'}`}
        open={dialog === 'generate'}
        program={generateProgram}
        onOpenChange={(open) => !open && setDialog(null)}
        pending={mutations.generateVouchers.isPending}
        onSubmit={(payload) =>
          generateProgram &&
          generateVouchers(
            { programId: generateProgram.id, payload },
            { onSuccess: () => success(t('configsPage.vouchers.generated')) }
          )
        }
      />
    </div>
  )
}
