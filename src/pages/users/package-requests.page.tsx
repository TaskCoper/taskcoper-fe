import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { getColumns } from '@/features/package-bookings/components/columns/package-request-columns'
import RequestInfoDialog from '@/features/package-bookings/components/incoming-request-dialog'
import { useGetMyIncomingRequests } from '@/features/package-bookings/hooks/use-get-my-incoming-requests'
import type { PackageIncomingRequest } from '@/features/package-bookings/types'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function PackageRequestsPage() {
  const { t } = useTranslation()
  const [selectedRequestId, setSelectedRequestId] = useState<string>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleViewDetails = useCallback((request: PackageIncomingRequest) => {
    setSelectedRequestId(request.id)
    setDialogOpen(true)
  }, [])

  const columns = useMemo(() => getColumns(handleViewDetails), [handleViewDetails])

  const { page, limit, sorting } = useTableQueryParams({
    columns,
    prefix: 'packageRequests'
  })

  const [statusFilter] = useQueryState('packageRequests_status', parseAsString)

  const status = statusFilter ?? undefined

  const { packageIncomingRequests, isLoadingPackageRequests } = useGetMyIncomingRequests({
    status,
    pageIndex: page,
    pageSize: limit
  })

  const { table } = useDataTable({
    data: packageIncomingRequests.value.items,
    columns,
    pageCount: Math.ceil(packageIncomingRequests.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<PackageIncomingRequest>[]
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'packageRequests_page',
      perPage: 'packageRequests_perPage',
      sort: 'packageRequests_sort'
    },
    filterPrefix: 'packageRequests'
  })

  return (
    <div className='mx-auto p-6 space-y-6'>
      <div className='flex justify-between items-center gap-4'>
        <div>
          <p className='text-2xl font-bold'>{t('packageBooking.incomingRequests.title')}</p>
          <p className='text-sm text-muted-foreground'>{t('packageBooking.incomingRequests.description')}</p>
        </div>
      </div>

      <DataTable table={table} isLoading={isLoadingPackageRequests}>
        <DataTableToolbar table={table} />
      </DataTable>

      <RequestInfoDialog open={dialogOpen} onOpenChange={setDialogOpen} requestId={selectedRequestId} />
    </div>
  )
}
