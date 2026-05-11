import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useGetVouchers } from '@/features/vouchers/hooks/use-get-vouchers'
import { DiscountTypeLabel, ScopeLabel, TargetTypeLabel, type VoucherRow } from '@/features/vouchers/types'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { PlusIcon } from 'lucide-react'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteVoucher } from '../hooks/use-delete-voucher'
import { useGetVoucherScopeStats } from '../hooks/use-get-voucher-scope-stats'
import { useGetVoucherStatusStats } from '../hooks/use-get-voucher-status-stats'
import { useGetVoucherTargetStats } from '../hooks/use-get-voucher-target-stats'
import { useGetVoucherTypeStats } from '../hooks/use-get-voucher-type-stats'
import { getColumns } from './columns/voucher-columns'
import CreateVoucherDialog from './create-voucher-dialog'

export default function VouchersTable() {
  const { t } = useTranslation()
  const { deleteVoucher, isDeletingVoucher } = useDeleteVoucher()
  const { confirm } = useConfirmStore()

  const onDelete = useCallback(
    async ({ voucherId, voucherCode }: { voucherId: string; voucherCode: string }) => {
      const ok = await confirm({
        title: t('voucher.delete.title'),
        description: t('voucher.delete.description', { voucherCode }),
        confirmText: t('common.button.delete'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })

      if (ok) {
        deleteVoucher({ voucherId })
      }
    },
    [confirm, deleteVoucher, t]
  )

  const columns = useMemo(() => getColumns({ onDelete, isDeletingVoucher }), [onDelete, isDeletingVoucher])

  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'vouchers'
  })

  const [codeFilter] = useQueryState('vouchers_code', parseAsString)
  const [discountTypeFilter] = useQueryState('vouchers_discountType', parseAsString)
  const [scopeFilter] = useQueryState('vouchers_scope', parseAsString)
  const [targetTypeFilter] = useQueryState('vouchers_targets', parseAsString)
  const [statusFilter] = useQueryState('vouchers_status', parseAsString)

  const [startAtFilter] = useQueryState('vouchers_startsAt', parseAsString)
  const [endAtFilter] = useQueryState('vouchers_endsAt', parseAsString)

  const code = codeFilter ?? undefined
  const discountType = discountTypeFilter ? [discountTypeFilter] : undefined
  const scope = scopeFilter ? [scopeFilter] : undefined
  const targetType = targetTypeFilter ?? undefined
  const status = statusFilter ?? undefined
  const startsAt = startAtFilter ?? undefined
  const endsAt = endAtFilter ?? undefined

  const { vouchers, isLoadingVouchers } = useGetVouchers({
    pageIndex: page,
    pageSize: limit,
    searchTerm: code,
    discountType,
    scope,
    targetType,
    startTime: startsAt,
    endTime: endsAt,
    isActive: status ? (status === 'Active' ? true : false) : undefined,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy.toLowerCase()}` : sortBy.toLowerCase()) : undefined
  })

  const { voucherScopeStats, isLoadingVoucherScopeStats } = useGetVoucherScopeStats()
  const { voucherTargetStats, isLoadingVoucherTargetStats } = useGetVoucherTargetStats()
  const { voucherTypeStats, isLoadingVoucherTypeStats } = useGetVoucherTypeStats()
  const { voucherStatusStats, isLoadingVoucherStatusStats } = useGetVoucherStatusStats()

  const filterOptionOverrides = useMemo(() => {
    return {
      scope: voucherScopeStats.map((scope) => ({
        value: scope.scope,
        label: t(ScopeLabel[scope.scope]),
        count: scope.totalVouchers
      })),
      targets: voucherTargetStats.map((target) => ({
        value: target.targetType,
        label: t(TargetTypeLabel[target.targetType]),
        count: target.totalVouchers
      })),
      discountType: voucherTypeStats.map((type) => ({
        value: type.type,
        label: t(DiscountTypeLabel[type.type]),
        count: type.totalVouchers
      })),
      status: voucherStatusStats.map((status) => ({
        value: status.status,
        label: status.status === 'Active' ? t('voucher.column.active') : t('voucher.column.inactive'),
        count: status.totalVouchers
      }))
    }
  }, [voucherScopeStats, voucherTargetStats, voucherTypeStats, voucherStatusStats, t])

  const { table } = useDataTable({
    data: vouchers.value.items,
    columns,
    pageCount: Math.ceil(vouchers.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<VoucherRow>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'vouchers_page',
      perPage: 'vouchers_perPage',
      sort: 'vouchers_sort'
    },
    filterPrefix: 'vouchers'
  })

  const isLoading =
    isLoadingVouchers ||
    isLoadingVoucherScopeStats ||
    isLoadingVoucherTargetStats ||
    isLoadingVoucherTypeStats ||
    isLoadingVoucherStatusStats

  return (
    <DataTable table={table} isLoading={isLoading}>
      <DataTableToolbar table={table} filterOptionOverrides={filterOptionOverrides}>
        <CreateVoucherDialog>
          <Button size='sm'>
            <PlusIcon />
            {t('voucher.button.addVoucher')}
          </Button>
        </CreateVoucherDialog>
      </DataTableToolbar>
    </DataTable>
  )
}
