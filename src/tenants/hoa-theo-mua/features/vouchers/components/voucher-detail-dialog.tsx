import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import type { Table } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import type { Voucher, VoucherUsage } from '../types'
import { displayValidityPeriod, formatMoney, isUnlimitedAmount } from './voucher-date-utils'

interface VoucherDetailDialogProps {
  voucher: Voucher | null
  open: boolean
  onOpenChange: (open: boolean) => void
  usageTable: Table<VoucherUsage>
  isLoadingUsages: boolean
  t: TenantT
}

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className='min-w-0 space-y-1'>
    <p className='text-xs text-muted-foreground'>{label}</p>
    <div className='break-words text-sm font-medium'>{value || '—'}</div>
  </div>
)

export function VoucherDetailDialog({
  voucher,
  open,
  onOpenChange,
  usageTable,
  isLoadingUsages,
  t
}: VoucherDetailDialogProps) {
  if (!voucher) return null

  const discountValue =
    voucher.discountType === 'percent'
      ? `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(voucher.discountValue)}%`
      : formatMoney(voucher.discountValue, t('configsPage.vouchers.currency'))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] w-[calc(100vw_-_2rem)] !max-w-5xl overflow-x-hidden overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('configsPage.vouchers.detailTitle')}</DialogTitle>
          <DialogDescription>{t('configsPage.vouchers.detailDescription')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='grid min-w-0 gap-4 rounded-lg border p-4 sm:grid-cols-2'>
            <DetailItem label={t('configsPage.vouchers.code')} value={voucher.code} />
            <DetailItem
              label={t('configsPage.vouchers.voucherType')}
              value={<Badge variant='secondary'>{t(`configsPage.vouchers.types.${voucher.visibility}`)}</Badge>}
            />
            <DetailItem
              label={t('configsPage.vouchers.status')}
              value={
                <Badge variant={voucher.isActive ? 'default' : 'outline'}>
                  {t(voucher.isActive ? 'configsPage.vouchers.active' : 'configsPage.vouchers.inactive')}
                </Badge>
              }
            />
            <DetailItem
              label={t('configsPage.vouchers.discountType')}
              value={t(`configsPage.vouchers.kinds.${voucher.discountType}`)}
            />
            <DetailItem label={t('configsPage.vouchers.discountValue')} value={discountValue} />
            <DetailItem
              label={t('configsPage.vouchers.usage')}
              value={`${voucher.usedCount}/${voucher.maxUsageCount}`}
            />
            <DetailItem
              label={t('configsPage.vouchers.validityPeriod')}
              value={displayValidityPeriod(voucher.startAt, voucher.endAt, t('configsPage.vouchers.unlimited'))}
            />
            <DetailItem
              label={t('configsPage.vouchers.minOrderAmount')}
              value={
                isUnlimitedAmount(voucher.minOrderAmount)
                  ? t('configsPage.vouchers.unlimited')
                  : formatMoney(voucher.minOrderAmount, t('configsPage.vouchers.currency'))
              }
            />
            <DetailItem
              label={t('configsPage.vouchers.maxOrderAmount')}
              value={
                isUnlimitedAmount(voucher.maxOrderAmount)
                  ? t('configsPage.vouchers.unlimited')
                  : formatMoney(voucher.maxOrderAmount, t('configsPage.vouchers.currency'))
              }
            />
            <div className='sm:col-span-2 lg:col-span-3'>
              <DetailItem label={t('configsPage.vouchers.description')} value={voucher.description} />
            </div>
          </div>

          <section className='space-y-3'>
            <div>
              <h3 className='text-base font-semibold'>{t('configsPage.vouchers.usageHistory')}</h3>
              <p className='text-xs text-muted-foreground'>{t('configsPage.vouchers.usageDescription')}</p>
            </div>
            <div className='min-w-0 max-w-full overflow-x-auto'>
              <DataTable<VoucherUsage> className='min-w-0' table={usageTable} isLoading={isLoadingUsages}>
                <DataTableToolbar<VoucherUsage> table={usageTable} />
              </DataTable>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
