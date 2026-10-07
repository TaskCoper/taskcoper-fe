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
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDataTable } from '@/hooks/use-data-table'
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

type OrderAmountValidationValues = {
  minOrderAmount: string | number | null
  maxOrderAmount: string | number | null
}

function useOrderAmountValidation(
  initialMin: string | number | null,
  initialMax: string | number | null,
  message: string
) {
  const {
    register,
    setValue,
    getValues,
    trigger,
    formState: { errors }
  } = useForm<OrderAmountValidationValues>({
    defaultValues: { minOrderAmount: initialMin, maxOrderAmount: initialMax },
    mode: 'onChange'
  })

  const validateMin = (value: string | number | null) => {
    const maxValue = getValues('maxOrderAmount')
    if (value === '' || value == null || maxValue === '' || maxValue == null) return true

    const max = Number(maxValue)
    return Number.isFinite(max) && Number(value) <= max ? true : message
  }
  const validateMax = (value: string | number | null) => {
    const minValue = getValues('minOrderAmount')
    if (value === '' || value == null || minValue === '' || minValue == null) return true

    const min = Number(minValue)
    return Number.isFinite(min) && min <= Number(value) ? true : message
  }

  const minField = register('minOrderAmount', { validate: validateMin })
  const maxField = register('maxOrderAmount', { validate: validateMax })

  const sync = (field: keyof OrderAmountValidationValues, value: string | number | null) => {
    setValue(field, value, { shouldValidate: true, shouldDirty: true })
    void trigger(field === 'minOrderAmount' ? 'maxOrderAmount' : 'minOrderAmount')
  }

  return { minField, maxField, errors, sync, validate: () => trigger(['minOrderAmount', 'maxOrderAmount']) }
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
  const [visibility, setVisibility] = useState<VoucherVisibility>(voucher?.visibility ?? 'public')
  const [discountType, setDiscountType] = useState<VoucherDiscountType>(voucher?.discountType ?? 'percent')
  const [codeMode, setCodeMode] = useState<'manual' | 'generated'>('manual')
  const [form, setForm] = useState({
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
    maxOrderAmount: voucher?.maxOrderAmount ?? ''
  })
  const [dateError, setDateError] = useState('')
  const { minField, maxField, errors, sync, validate } = useOrderAmountValidation(
    form.minOrderAmount,
    form.maxOrderAmount,
    t('configsPage.vouchers.minOrderAmountValidation')
  )
  const update = (key: keyof typeof form, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (key === 'minOrderAmount' || key === 'maxOrderAmount') sync(key, value)
  }
  const submit = async () => {
    if (!form.startAt || !form.endAt) {
      setDateError(t('configsPage.vouchers.validityRequired'))
      return
    }
    setDateError('')
    if (!(await validate())) return
    if (voucher) {
      onSubmit({
        id: voucher.id,
        description: form.description,
        visibility,
        discountType,
        discountValue: Number(form.discountValue),
        maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
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
      visibility,
      discountType,
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
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
        <div className='grid gap-4 sm:grid-cols-2'>
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
            <VoucherField label={t('configsPage.vouchers.code')}>
              <Input value={form.code} onChange={(event) => update('code', event.target.value.toUpperCase())} />
            </VoucherField>
          )}
          {!voucher && codeMode === 'generated' && (
            <>
              <VoucherField label={t('configsPage.vouchers.codePrefix')}>
                <Input
                  value={form.codePrefix}
                  onChange={(event) => update('codePrefix', event.target.value.toUpperCase())}
                />
              </VoucherField>
              <VoucherField label={t('configsPage.vouchers.codeLength')}>
                <Input
                  type='number'
                  min={5}
                  max={10}
                  value={form.codeLength}
                  onChange={(event) => update('codeLength', Number(event.target.value))}
                />
              </VoucherField>
              <VoucherField label={t('configsPage.vouchers.codeSuffix')}>
                <Input
                  value={form.codeSuffix}
                  onChange={(event) => update('codeSuffix', event.target.value.toUpperCase())}
                />
              </VoucherField>
            </>
          )}
          <VoucherField label={t('configsPage.vouchers.visibility')}>
            <Select value={visibility} onValueChange={(value) => setVisibility(value as VoucherVisibility)}>
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
            <Select value={discountType} onValueChange={(value) => setDiscountType(value as VoucherDiscountType)}>
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
              value={form.discountValue}
              suffix={discountType === 'percent' ? '%' : t('configsPage.vouchers.currency')}
              onChange={(event) => update('discountValue', Number(event.target.value))}
            />
          </VoucherField>
          {discountType === 'percent' && (
            <VoucherField label={t('configsPage.vouchers.maxDiscountAmount')}>
              <VoucherInputWithSuffix
                type='number'
                min={0}
                value={form.maxDiscountAmount}
                suffix={t('configsPage.vouchers.currency')}
                onChange={(event) => update('maxDiscountAmount', event.target.value)}
              />
            </VoucherField>
          )}
          <div className='grid gap-4 sm:col-span-2 sm:grid-cols-2'>
            <VoucherField label={t('configsPage.vouchers.minOrderAmount')} error={errors.minOrderAmount?.message}>
              <VoucherInputWithSuffix
                {...minField}
                type='number'
                min={0}
                value={form.minOrderAmount}
                suffix={t('configsPage.vouchers.currency')}
                onChange={(event) => update('minOrderAmount', event.target.value)}
              />
            </VoucherField>
            <VoucherField label={t('configsPage.vouchers.maxOrderAmount')} error={errors.maxOrderAmount?.message}>
              <VoucherInputWithSuffix
                {...maxField}
                type='number'
                min={0}
                value={form.maxOrderAmount}
                suffix={t('configsPage.vouchers.currency')}
                onChange={(event) => update('maxOrderAmount', event.target.value)}
              />
            </VoucherField>
          </div>
          <VoucherField label={t('configsPage.vouchers.maxUsageCount')}>
            <Input
              type='number'
              min={1}
              value={form.maxUsageCount}
              onChange={(event) => update('maxUsageCount', Number(event.target.value))}
            />
          </VoucherField>
          <VoucherField label={t('configsPage.vouchers.validityPeriod')} error={dateError} className='sm:col-span-2'>
            <VoucherDateRangeField
              startAt={form.startAt}
              endAt={form.endAt}
              onSelect={(next) => {
                update('startAt', dateValue(next?.from, false, timeValue(form.startAt, '00:00')))
                update('endAt', dateValue(next?.to, true, timeValue(form.endAt, '23:59')))
              }}
              startTime={timeValue(form.startAt, '00:00')}
              endTime={timeValue(form.endAt, '23:59')}
              onTimeChange={(field, value) => {
                const current = field === 'start' ? form.startAt : form.endAt
                const date = current ? parseISO(current) : undefined
                update(field === 'start' ? 'startAt' : 'endAt', dateValue(date, field === 'end', value))
              }}
            />
          </VoucherField>
          <VoucherField label={t('configsPage.vouchers.description')} className='sm:col-span-2'>
            <Textarea value={form.description} onChange={(event) => update('description', event.target.value)} />
          </VoucherField>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.button.cancel')}
          </Button>
          <Button onClick={submit} disabled={pending}>
            {t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
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
  const [form, setForm] = useState({
    name: program?.name ?? '',
    startAt: program?.startAt ?? '',
    endAt: program?.endAt ?? '',
    minOrderAmount: program?.minOrderAmount ?? '',
    maxOrderAmount: program?.maxOrderAmount ?? ''
  })
  const [dateError, setDateError] = useState('')
  const { minField, maxField, errors, sync, validate } = useOrderAmountValidation(
    form.minOrderAmount,
    form.maxOrderAmount,
    t('configsPage.vouchers.minOrderAmountValidation')
  )
  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (key === 'minOrderAmount' || key === 'maxOrderAmount') sync(key, value)
  }
  const submit = async () => {
    if (!form.startAt || !form.endAt) {
      setDateError(t('configsPage.vouchers.validityRequired'))
      return
    }
    setDateError('')
    if (!(await validate())) return
    onSubmit(
      program
        ? {
            id: program.id,
            name: form.name,
            startAt: form.startAt,
            endAt: form.endAt,
            minOrderAmount: form.minOrderAmount === '' ? null : Number(form.minOrderAmount),
            maxOrderAmount: form.maxOrderAmount === '' ? null : Number(form.maxOrderAmount)
          }
        : {
            name: form.name,
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
        <div className='grid gap-4'>
          <VoucherField label={t('configsPage.vouchers.programName')}>
            <Input value={form.name} onChange={(event) => update('name', event.target.value)} />
          </VoucherField>
          <VoucherField label={t('configsPage.vouchers.validityPeriod')} error={dateError} className='sm:col-span-2'>
            <VoucherDateRangeField
              startAt={form.startAt}
              endAt={form.endAt}
              onSelect={(next) => {
                update('startAt', dateValue(next?.from, false, timeValue(form.startAt, '00:00')))
                update('endAt', dateValue(next?.to, true, timeValue(form.endAt, '23:59')))
              }}
              startTime={timeValue(form.startAt, '00:00')}
              endTime={timeValue(form.endAt, '23:59')}
              onTimeChange={(field, value) => {
                const current = field === 'start' ? form.startAt : form.endAt
                const date = current ? parseISO(current) : undefined
                update(field === 'start' ? 'startAt' : 'endAt', dateValue(date, field === 'end', value))
              }}
            />
          </VoucherField>
          <div className='grid grid-cols-2 gap-3'>
            <VoucherField label={t('configsPage.vouchers.minOrderAmount')} error={errors.minOrderAmount?.message}>
              <VoucherInputWithSuffix
                {...minField}
                type='number'
                value={form.minOrderAmount}
                suffix={t('configsPage.vouchers.currency')}
                onChange={(event) => update('minOrderAmount', event.target.value)}
              />
            </VoucherField>
            <VoucherField label={t('configsPage.vouchers.maxOrderAmount')} error={errors.maxOrderAmount?.message}>
              <VoucherInputWithSuffix
                {...maxField}
                type='number'
                value={form.maxOrderAmount}
                suffix={t('configsPage.vouchers.currency')}
                onChange={(event) => update('maxOrderAmount', event.target.value)}
              />
            </VoucherField>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.button.cancel')}
          </Button>
          <Button onClick={submit} disabled={pending}>
            {t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function GenerateDialog({
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
  const [form, setForm] = useState<GenerateVouchersPayload>({
    codePrefix: 'HTM',
    codeLength: 7,
    codeSuffix: '',
    quantity: 1,
    maxUsageCount: 1,
    discountType: 'percent',
    discountValue: 20,
    maxDiscountAmount: null,
    description: ''
  })
  const update = (key: keyof GenerateVouchersPayload, value: string | number | null) =>
    setForm((current) => ({ ...current, [key]: value }))
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{t('configsPage.vouchers.generateTitle')}</DialogTitle>
          <DialogDescription>{program?.name}</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 sm:grid-cols-2'>
          <VoucherField label={t('configsPage.vouchers.codePrefix')}>
            <Input
              value={form.codePrefix}
              onChange={(event) => update('codePrefix', event.target.value.toUpperCase())}
            />
          </VoucherField>
          <VoucherField label={t('configsPage.vouchers.codeLength')}>
            <Input
              type='number'
              min={5}
              max={10}
              value={form.codeLength}
              onChange={(event) => update('codeLength', Number(event.target.value))}
            />
          </VoucherField>
          <VoucherField label={t('configsPage.vouchers.quantity')}>
            <Input
              type='number'
              min={1}
              max={1000}
              value={form.quantity}
              onChange={(event) => update('quantity', Number(event.target.value))}
            />
          </VoucherField>
          <VoucherField label={t('configsPage.vouchers.maxUsageCount')}>
            <Input
              type='number'
              min={1}
              value={form.maxUsageCount}
              onChange={(event) => update('maxUsageCount', Number(event.target.value))}
            />
          </VoucherField>
          <VoucherField label={t('configsPage.vouchers.discountType')}>
            <Select value={form.discountType} onValueChange={(value) => update('discountType', value)}>
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
              value={form.discountValue}
              suffix={form.discountType === 'percent' ? '%' : t('configsPage.vouchers.currency')}
              onChange={(event) => update('discountValue', Number(event.target.value))}
            />
          </VoucherField>
          {form.discountType === 'percent' && (
            <VoucherField label={t('configsPage.vouchers.maxDiscountAmount')}>
              <VoucherInputWithSuffix
                type='number'
                min={0}
                value={form.maxDiscountAmount ?? ''}
                suffix={t('configsPage.vouchers.currency')}
                onChange={(event) =>
                  update('maxDiscountAmount', event.target.value ? Number(event.target.value) : null)
                }
              />
            </VoucherField>
          )}
          <div className='sm:col-span-2'>
            <VoucherField label={t('configsPage.vouchers.description')}>
              <Textarea value={form.description} onChange={(event) => update('description', event.target.value)} />
            </VoucherField>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.button.cancel')}
          </Button>
          <Button onClick={() => onSubmit(form)} disabled={pending || !program}>
            {t('configsPage.vouchers.generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function VouchersEditor() {
  const { t } = useTenantTranslation()
  const { confirm } = useConfirmStore()
  const [view, setView] = useState<View>('vouchers')
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
    [requestDelete, setVoucherProgramActive, t]
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
  const exportVouchers = async () => {
    try {
      const blob = await (await import('../services')).default.exportVouchers({ visibility: visibility ?? 'all' })
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
      <Tabs value={view} onValueChange={(value) => setView(value as View)}>
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
              <Button variant='outline' onClick={exportVouchers}>
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
            <Button
              onClick={() => {
                setEditingProgram(null)
                setDialog('program')
              }}
            >
              <Plus />
              {t('configsPage.vouchers.createProgram')}
            </Button>
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
