import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { useUnsavedCloseGuard } from '@/tenants/hoa-theo-mua/features/configs/components/generic/config-dialog-shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { CreateVoucherPayload, UpdateVoucherItem, Voucher, VoucherDiscountType, VoucherVisibility } from '../types'
import { voucherSchema } from '../validations'
import { composeDateTime, displayDate, timeValue, toNullableNumber } from './voucher-date-utils'
import {
  VoucherFormFooter,
  VoucherNumberField,
  VoucherSelectField,
  VoucherTextareaField,
  VoucherTextField,
  VoucherValidityFields
} from './voucher-form-fields'

type VoucherFormValues = {
  codeMode: 'manual' | 'generated'
  code: string
  codePrefix: string
  codeLength: number
  codeSuffix: string
  description: string
  visibility: VoucherVisibility
  discountType: VoucherDiscountType
  discountValue: number
  maxDiscountAmount: number | null
  maxUsageCount: number
  startDate: string | null
  startTime: string
  endDate: string | null
  endTime: string
  minOrderAmount: number | null
  maxOrderAmount: number | null
}

const buildDefaultValues = (voucher?: Voucher | null): VoucherFormValues => ({
  codeMode: 'manual',
  code: voucher?.code ?? '',
  codePrefix: 'HTM',
  codeLength: 7,
  codeSuffix: '',
  description: voucher?.description ?? '',
  visibility: voucher?.visibility ?? 'public',
  discountType: voucher?.discountType ?? 'percent',
  discountValue: voucher?.discountValue ?? 20,
  maxDiscountAmount: voucher?.maxDiscountAmount || null,
  maxUsageCount: voucher?.maxUsageCount ?? 1,
  startDate: voucher?.startAt || null,
  startTime: timeValue(voucher?.startAt ?? '', '00:00'),
  endDate: voucher?.endAt || null,
  endTime: timeValue(voucher?.endAt ?? '', '23:59'),
  minOrderAmount: voucher?.minOrderAmount || null,
  maxOrderAmount: voucher?.maxOrderAmount || null
})

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
  const { confirm } = useConfirmStore()
  const defaultValues = useMemo(() => buildDefaultValues(voucher), [voucher])
  const methods = useForm<VoucherFormValues>({
    mode: 'onChange',
    resolver: zodResolver(voucherSchema(t, voucher?.usedCount ?? 0, Boolean(voucher))),
    defaultValues
  })
  const {
    control,
    setValue,
    trigger,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = methods
  const codeMode = useWatch({ control, name: 'codeMode' })
  const discountType = useWatch({ control, name: 'discountType' })
  const requestClose = useUnsavedCloseGuard(isDirty, () => onOpenChange(false))

  useEffect(() => {
    if (open) reset(defaultValues)
  }, [open, defaultValues, reset])

  const submit = async (form: VoucherFormValues) => {
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

    const shared = {
      description: form.description,
      visibility: form.visibility,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.discountType === 'percent' ? toNullableNumber(form.maxDiscountAmount) : null,
      maxUsageCount: Number(form.maxUsageCount),
      startAt,
      endAt: endAt || null,
      minOrderAmount: toNullableNumber(form.minOrderAmount),
      maxOrderAmount: toNullableNumber(form.maxOrderAmount)
    }

    if (voucher) {
      onSubmit({ id: voucher.id, ...shared })
      return
    }

    onSubmit({
      ...(form.codeMode === 'manual'
        ? { code: form.code }
        : { codePrefix: form.codePrefix, codeLength: Number(form.codeLength), codeSuffix: form.codeSuffix }),
      ...shared
    })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : void requestClose())}>
      <DialogContent position='top-center' className='max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {t(voucher ? 'configsPage.vouchers.editTitle' : 'configsPage.vouchers.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('configsPage.vouchers.formDescription')}</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form noValidate onSubmit={handleSubmit(submit)} className='grid gap-x-4 gap-y-1 sm:grid-cols-2'>
            {!voucher && (
              <VoucherSelectField
                name='codeMode'
                control={control}
                label={t('configsPage.vouchers.codeMode')}
                isRequired
                options={[
                  { value: 'manual', label: t('configsPage.vouchers.manualCode') },
                  { value: 'generated', label: t('configsPage.vouchers.generatedCode') }
                ]}
              />
            )}
            {!voucher && codeMode === 'manual' && (
              <VoucherTextField
                name='code'
                control={control}
                label={t('configsPage.vouchers.code')}
                placeholder={t('configsPage.vouchers.codePlaceholder')}
                isRequired
                autoFocus
                toUpperCase
              />
            )}
            {!voucher && codeMode === 'generated' && (
              <>
                <VoucherTextField
                  name='codePrefix'
                  control={control}
                  label={t('configsPage.vouchers.codePrefix')}
                  toUpperCase
                />
                <VoucherNumberField
                  name='codeLength'
                  control={control}
                  label={t('configsPage.vouchers.codeLength')}
                  min={5}
                  max={10}
                  isRequired
                />
                <VoucherTextField
                  name='codeSuffix'
                  control={control}
                  label={t('configsPage.vouchers.codeSuffix')}
                  toUpperCase
                />
              </>
            )}
            <VoucherSelectField
              name='visibility'
              control={control}
              label={t('configsPage.vouchers.visibility')}
              isRequired
              options={[
                { value: 'public', label: t('configsPage.vouchers.types.public') },
                { value: 'private', label: t('configsPage.vouchers.types.private') }
              ]}
            />
            <VoucherSelectField
              name='discountType'
              control={control}
              label={t('configsPage.vouchers.discountType')}
              isRequired
              disabled={Boolean(voucher)}
              options={[
                { value: 'percent', label: t('configsPage.vouchers.kinds.percent') },
                { value: 'cash', label: t('configsPage.vouchers.kinds.cash') }
              ]}
              onValueChange={(value) => {
                if (value === 'cash') setValue('maxDiscountAmount', null)
                void trigger(['discountValue', 'maxDiscountAmount'])
              }}
            />
            <VoucherNumberField
              name='discountValue'
              control={control}
              label={t('configsPage.vouchers.discountValue')}
              suffix={discountType === 'percent' ? '%' : t('configsPage.vouchers.currency')}
              min={0}
              isRequired
            />
            {discountType === 'percent' && (
              <VoucherNumberField
                name='maxDiscountAmount'
                control={control}
                label={t('configsPage.vouchers.maxDiscountAmount')}
                placeholder={t('configsPage.vouchers.unlimited')}
                suffix={t('configsPage.vouchers.currency')}
                min={0}
                nullable
              />
            )}
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
            <VoucherNumberField
              name='maxUsageCount'
              control={control}
              label={t('configsPage.vouchers.maxUsageCount')}
              min={1}
              isRequired
            />
            <VoucherValidityFields control={control} />
            <VoucherTextareaField
              name='description'
              control={control}
              label={t('configsPage.vouchers.description')}
              placeholder={t('configsPage.vouchers.descriptionPlaceholder')}
              className='sm:col-span-2'
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
