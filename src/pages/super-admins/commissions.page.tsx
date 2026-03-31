import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { getColumns } from '@/features/commissions/components/commission-columns'
import CommissionTable from '@/features/commissions/components/commission-table'
import CreateCommissionDialog from '@/features/commissions/components/create-commission-dialog'
import { useDeleteCommission } from '@/features/commissions/hooks/use-delete-commission'
import { useGetCommissions } from '@/features/commissions/hooks/use-get-commissions'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { type CommissionRow } from '@/types/commission.type'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { PlusCircleIcon } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function CommissionsPage() {
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()
  const { deleteCommission } = useDeleteCommission()

  const onDeleteCommission = useCallback(
    async (commissionId: string) => {
      const confirmed = await confirm({
        title: t('common.button.delete'),
        description: t('common.ui.pleaseWait'),
        confirmText: t('common.button.delete'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })
      if (confirmed) {
        deleteCommission({ commissionId })
      }
    },
    [confirm, deleteCommission, t]
  )

  const columns = useMemo(() => getColumns(), [])

  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'commissions'
  })

  const { commissions, isLoadingCommissions } = useGetCommissions({
    page,
    limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy.toLowerCase()}` : sortBy.toLowerCase()) : undefined
  })

  const { table } = useDataTable({
    data: commissions.value.items,
    columns,
    pageCount: Math.ceil(commissions.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<CommissionRow>[]
    },
    getRowId: (row) => row.titleLevel,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'commissions_page',
      perPage: 'commissions_perPage',
      sort: 'commissions_sort'
    },
    filterPrefix: 'commissions'
  })

  return (
    <div className='px-4 pt-2'>
      <DataTable
        table={table}
        isLoading={isLoadingCommissions}
        renderSubComponent={({ row }) => <CommissionTable row={row} onDeleteCommission={onDeleteCommission} />}
      >
        <DataTableToolbar table={table}>
          <CreateCommissionDialog>
            <Button size='sm'>
              <PlusCircleIcon className='size-4' />
              {t('commission.button.addConfig')}
            </Button>
          </CreateCommissionDialog>
        </DataTableToolbar>
      </DataTable>
    </div>
  )
}
