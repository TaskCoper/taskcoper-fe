import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDateFormat } from '@/lib/date'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { isValid, parseISO } from 'date-fns'
import { CalendarDays, Gift, Plus, Ticket, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { DateRange } from 'react-day-picker'
import InlineEditorShell from '../settings/inline-editor-shell'
import EditorSection from '../shared/editor-section'

type VoucherType = 'public' | 'private'

interface VoucherDraft {
  id: number
  code: string
  name: string
  description: string
  type: VoucherType
  kind: 'percent' | 'fixed'
  value: number
  startsAt: string
  expiresAt: string
  totalUsageLimit: number
  usageLimitPerUser: number
  isActive: boolean
}

function VoucherField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Field className='gap-1'>
      <FieldLabel className='text-xs'>{label}</FieldLabel>
      {children}
    </Field>
  )
}

function VoucherDateRangePicker({
  startsAt,
  expiresAt,
  label,
  onChange
}: {
  startsAt: string
  expiresAt: string
  label: string
  onChange: (range: DateRange | undefined) => void
}) {
  const { t } = useTenantTranslation()
  const { formatDate } = useDateFormat()
  const from = startsAt ? parseISO(startsAt) : undefined
  const to = expiresAt ? parseISO(expiresAt) : undefined
  const hasValidFrom = from ? isValid(from) : false
  const hasValidTo = to ? isValid(to) : false
  const selectedRange: DateRange | undefined =
    hasValidFrom || hasValidTo ? { from: hasValidFrom ? from : undefined, to: hasValidTo ? to : undefined } : undefined

  return (
    <VoucherField label={label}>
      <Popover>
        <PopoverTrigger asChild>
          <Button type='button' variant='outline' className='h-9 w-full justify-start px-3 font-normal'>
            <CalendarDays className='mr-2 size-4 text-muted-foreground' />
            {hasValidFrom && from ? (
              `${formatDate(from, 'dateLong')}${hasValidTo && to ? ` - ${formatDate(to, 'dateLong')}` : ''}`
            ) : (
              <span className='text-muted-foreground'>{t('configsPage.vouchers.datePlaceholder')}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align='start' className='w-auto p-0'>
          <Calendar
            mode='range'
            required={false}
            selected={selectedRange}
            defaultMonth={hasValidFrom && from ? from : new Date()}
            captionLayout='dropdown'
            onSelect={onChange}
          />
        </PopoverContent>
      </Popover>
    </VoucherField>
  )
}

const INITIAL_VOUCHERS: VoucherDraft[] = [
  {
    id: 1,
    code: '',
    name: '',
    description: '',
    type: 'public',
    kind: 'percent',
    value: 20,
    startsAt: '',
    expiresAt: '',
    totalUsageLimit: 100,
    usageLimitPerUser: 1,
    isActive: true
  }
]

export default function VouchersEditor() {
  const { t } = useTenantTranslation()
  const [activeType, setActiveType] = useState<VoucherType>('public')
  const [vouchers, setVouchers] = useState(INITIAL_VOUCHERS)

  const visibleVouchers = vouchers.filter((voucher) => voucher.type === activeType)

  const addVoucher = () => {
    setVouchers((current) => [
      ...current,
      {
        id: Date.now(),
        code: activeType === 'private' ? 'VOUCHER-XXXX' : '',
        name: '',
        description: '',
        type: activeType,
        kind: 'percent',
        value: 20,
        startsAt: '',
        expiresAt: '',
        totalUsageLimit: 100,
        usageLimitPerUser: 1,
        isActive: true
      }
    ])
  }

  const updateVoucher = (id: number, patch: Partial<VoucherDraft>) => {
    setVouchers((current) => current.map((voucher) => (voucher.id === id ? { ...voucher, ...patch } : voucher)))
  }

  return (
    <InlineEditorShell
      editorId='vouchers-draft'
      icon={<Gift className='size-4' />}
      title={t('configsPage.vouchers.title')}
      description={t('configsPage.vouchers.description')}
      isDirty={false}
      isSaving={false}
      onRevert={() => undefined}
      onSave={() => undefined}
      hideHeader
      saveDisabledReason={t('configsPage.pendingApi')}
    >
      <Tabs value={activeType} onValueChange={(value) => setActiveType(value as VoucherType)}>
        <TabsList className='h-9'>
          <TabsTrigger
            value='public'
            className='text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
          >
            <Ticket />
            {t('configsPage.vouchers.types.public')}
          </TabsTrigger>
          <TabsTrigger
            value='private'
            className='text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
          >
            <Ticket />
            {t('configsPage.vouchers.types.private')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <EditorSection
        title={t(`configsPage.vouchers.types.${activeType}`)}
        description={t(`configsPage.vouchers.typeDescriptions.${activeType}`)}
        action={
          <Button type='button' variant='outline' size='sm' onClick={addVoucher}>
            <Plus />
            {t('configsPage.vouchers.add')}
          </Button>
        }
      >
        <div className='space-y-3'>
          {visibleVouchers.map((voucher) => (
            <div key={voucher.id} className='space-y-5 rounded-xl border bg-card p-5 shadow-sm'>
              <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end'>
                <VoucherField label={t('configsPage.vouchers.name')}>
                  <Input
                    value={voucher.name}
                    placeholder={t('configsPage.vouchers.namePlaceholder')}
                    onChange={(event) => updateVoucher(voucher.id, { name: event.target.value })}
                  />
                </VoucherField>
                <VoucherField label={t('configsPage.vouchers.code')}>
                  <Input
                    value={voucher.code}
                    placeholder={t('configsPage.vouchers.codePlaceholder')}
                    readOnly={activeType === 'private' && voucher.code.startsWith('VOUCHER-')}
                    onChange={(event) => updateVoucher(voucher.id, { code: event.target.value })}
                  />
                </VoucherField>
                <VoucherField label={t('configsPage.vouchers.status')}>
                  <div className='flex h-9 w-28 items-center gap-2 rounded-md border px-3'>
                    <Switch
                      checked={voucher.isActive}
                      onCheckedChange={(isActive) => updateVoucher(voucher.id, { isActive })}
                    />
                    <span className='text-xs text-muted-foreground'>
                      {t(voucher.isActive ? 'configsPage.vouchers.active' : 'configsPage.vouchers.inactive')}
                    </span>
                  </div>
                </VoucherField>
              </div>

              <VoucherField label={t('configsPage.vouchers.description')}>
                <textarea
                  value={voucher.description}
                  placeholder={t('configsPage.vouchers.descriptionPlaceholder')}
                  onChange={(event) => updateVoucher(voucher.id, { description: event.target.value })}
                  className='border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px]'
                />
              </VoucherField>

              <div className='grid gap-3 md:grid-cols-2'>
                <VoucherField label={t('configsPage.vouchers.discountType')}>
                  <Select
                    value={voucher.kind}
                    onValueChange={(kind) => updateVoucher(voucher.id, { kind: kind as VoucherDraft['kind'] })}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='percent'>{t('configsPage.vouchers.kinds.percent')}</SelectItem>
                      <SelectItem value='fixed'>{t('configsPage.vouchers.kinds.fixed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </VoucherField>
                <VoucherField
                  label={t(
                    voucher.kind === 'percent'
                      ? 'configsPage.vouchers.discountValuePercent'
                      : 'configsPage.vouchers.discountValueFixed'
                  )}
                >
                  <InputGroup>
                    <InputGroupInput
                      type='number'
                      min={0}
                      value={voucher.value}
                      placeholder={voucher.kind === 'percent' ? '20' : '50000'}
                      onChange={(event) => updateVoucher(voucher.id, { value: Number(event.target.value) })}
                    />
                    <InputGroupAddon align='inline-end' className='justify-center px-3'>
                      <InputGroupText className='min-w-6 justify-center'>
                        {voucher.kind === 'percent' ? '%' : '₫'}
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </VoucherField>
              </div>

              <div className='grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end'>
                <VoucherDateRangePicker
                  startsAt={voucher.startsAt}
                  expiresAt={voucher.expiresAt}
                  label={t('configsPage.vouchers.validityPeriod')}
                  onChange={(range) => {
                    if (!range) {
                      updateVoucher(voucher.id, { startsAt: '', expiresAt: '' })
                      return
                    }

                    const toDateValue = (date: Date | undefined, fallbackTime: string) => {
                      if (!date) return ''
                      const dateValue = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
                        .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, '0')))
                        .join('-')
                      return `${dateValue}T${fallbackTime}`
                    }

                    updateVoucher(voucher.id, {
                      startsAt: toDateValue(range.from, voucher.startsAt.slice(11, 16) || '00:00'),
                      expiresAt: toDateValue(range.to, voucher.expiresAt.slice(11, 16) || '23:59')
                    })
                  }}
                />
                <VoucherField label={t('configsPage.vouchers.totalUsageLimit')}>
                  <Input
                    type='number'
                    min={0}
                    value={voucher.totalUsageLimit}
                    onChange={(event) => updateVoucher(voucher.id, { totalUsageLimit: Number(event.target.value) })}
                  />
                </VoucherField>
                <VoucherField label={t('configsPage.vouchers.usageLimitPerUser')}>
                  <Input
                    type='number'
                    min={0}
                    value={voucher.usageLimitPerUser}
                    onChange={(event) => updateVoucher(voucher.id, { usageLimitPerUser: Number(event.target.value) })}
                  />
                </VoucherField>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  aria-label={t('configsPage.vouchers.remove')}
                  onClick={() => setVouchers((current) => current.filter((item) => item.id !== voucher.id))}
                >
                  <Trash2 className='size-4 text-muted-foreground' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </EditorSection>
    </InlineEditorShell>
  )
}
