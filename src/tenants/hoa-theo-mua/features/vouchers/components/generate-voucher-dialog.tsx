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
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { GenerateVouchersPayload, VoucherProgram } from '../types'
import { generateVoucherSchema } from '../validations'
import { VoucherField, VoucherInputWithSuffix } from './voucher-form-fields'

type GenerateFormValues = {
  codePrefix?: string
  codeLength: number
  codeSuffix?: string
  quantity: number
  maxUsageCount: number
  discountType: 'percent' | 'cash'
  discountValue: number
  maxDiscountAmount?: number | null
  description?: string
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{t('configsPage.vouchers.generateTitle')}</DialogTitle>
          <DialogDescription>{program?.name}</DialogDescription>
        </DialogHeader>
        <GenerateForm program={program} onCancel={() => onOpenChange(false)} onSubmit={onSubmit} pending={pending} />
      </DialogContent>
    </Dialog>
  )
}

function GenerateForm({
  program,
  onCancel,
  onSubmit,
  pending
}: {
  program: VoucherProgram | null
  onCancel: () => void
  onSubmit: (payload: GenerateVouchersPayload) => void
  pending: boolean
}) {
  const { t } = useTenantTranslation()
  const maxQuantity = Math.min(1000, Math.max(0, 10000 - (program?.voucherCount ?? 0)))
  const methods = useForm<GenerateFormValues>({
    mode: 'onChange',
    resolver: zodResolver(generateVoucherSchema(t, maxQuantity)),
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
    trigger,
    handleSubmit,
    formState: { errors }
  } = methods
  const form = useWatch({ control }) as GenerateFormValues
  const submit = (form: GenerateFormValues) => {
    onSubmit(form)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submit)} className='grid gap-4 sm:grid-cols-2'>
        <VoucherField label={t('configsPage.vouchers.codePrefix')} error={errors.codePrefix?.message}>
          <Input
            {...register('codePrefix')}
            value={form.codePrefix ?? ''}
            onChange={(event) => setValue('codePrefix', event.target.value.toUpperCase(), { shouldValidate: true })}
          />
        </VoucherField>
        <VoucherField label={t('configsPage.vouchers.codeLength')} error={errors.codeLength?.message}>
          <Input
            type='number'
            min={5}
            max={10}
            {...register('codeLength', { valueAsNumber: true })}
            value={form.codeLength}
            onChange={(event) => setValue('codeLength', Number(event.target.value), { shouldValidate: true })}
          />
        </VoucherField>
        <VoucherField label={t('configsPage.vouchers.quantity')} error={errors.quantity?.message}>
          <Input
            type='number'
            min={1}
            max={1000}
            {...register('quantity', { valueAsNumber: true })}
            value={form.quantity ?? 1}
            onChange={(event) => setValue('quantity', Number(event.target.value), { shouldValidate: true })}
          />
        </VoucherField>
        <VoucherField label={t('configsPage.vouchers.maxUsageCount')} error={errors.maxUsageCount?.message}>
          <Input
            type='number'
            min={1}
            {...register('maxUsageCount', { valueAsNumber: true })}
            value={form.maxUsageCount ?? 1}
            onChange={(event) => setValue('maxUsageCount', Number(event.target.value), { shouldValidate: true })}
          />
        </VoucherField>
        <VoucherField label={t('configsPage.vouchers.discountType')}>
          <Select
            value={form.discountType}
            onValueChange={(value) => {
              setValue('discountType', value as GenerateFormValues['discountType'])
              if (value === 'cash') setValue('maxDiscountAmount', null)
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
            {...register('discountValue', { valueAsNumber: true })}
            value={form.discountValue}
            suffix={form.discountType === 'percent' ? '%' : t('configsPage.vouchers.currency')}
            onChange={(event) => setValue('discountValue', Number(event.target.value), { shouldValidate: true })}
          />
        </VoucherField>
        {form.discountType === 'percent' && (
          <VoucherField label={t('configsPage.vouchers.maxDiscountAmount')} error={errors.maxDiscountAmount?.message}>
            <VoucherInputWithSuffix
              type='number'
              min={0}
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
          <Button type='button' variant='outline' onClick={onCancel}>
            {t('common.button.cancel')}
          </Button>
          <Button type='submit' disabled={pending || !program}>
            {t('configsPage.vouchers.generate')}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  )
}
