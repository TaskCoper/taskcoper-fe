import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { useGetMentorPackageBookings } from '../../hooks/use-get-mentor-package-bookings'
import type { MentorPackageBooking } from '../../types'
import { getColumns } from '../columns/package-booking-columns'
import PackageBookingDialog from '../package-booking-dialog'

export default function PackageBookingsTab() {
  const { packageId } = useParams<{ packageId: string }>()

  const [selectedBooking, setSelectedBooking] = useState<MentorPackageBooking | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleViewDetails = useCallback((booking: MentorPackageBooking) => {
    setSelectedBooking(booking)
    setDialogOpen(true)
  }, [])
  const columns = useMemo(() => getColumns(handleViewDetails), [handleViewDetails])

  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'packageBookings'
  })

  const [statusFilter] = useQueryState('packageBookings_status', parseAsString)

  const status = statusFilter ?? undefined

  const { mentorPackageBookings, isLoadingMentorPackageBookings } = useGetMentorPackageBookings({
    mentorPackageId: packageId,
    pageIndex: page,
    pageSize: limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy.toLowerCase()}` : sortBy.toLowerCase()) : '-createdonutc',
    status
  })

  const { table } = useDataTable({
    data: mentorPackageBookings.value.items,
    columns,
    pageCount: Math.ceil(mentorPackageBookings.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? [{ id: 'createdOnUtc', desc: true }]) as ExtendedColumnSort<MentorPackageBooking>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: ({ packageBookingId }) => packageBookingId,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'packageBookings_page',
      perPage: 'packageBookings_perPage',
      sort: 'packageBookings_sort'
    },
    filterPrefix: 'packageBookings'
  })

  return (
    <>
      <DataTable table={table} isLoading={isLoadingMentorPackageBookings}>
        <DataTableToolbar table={table} />
      </DataTable>

      <PackageBookingDialog open={dialogOpen} onOpenChange={setDialogOpen} booking={selectedBooking} />
    </>
  )
}
