import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import PackageFeedbackDialog from '@/features/feedbacks/components/package-feedback-dialog'
import { useGetFeedbacks } from '@/features/feedbacks/hooks/use-get-feedbacks'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import type { Feedback } from '@/types/feedback.type'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { getColumns } from '../../columns/package-feedback-columns'

export default function PackageFeedbacksTab() {
  const { packageId } = useParams<{ packageId: string }>()

  const { t } = useTranslation()

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleViewDetails = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setDialogOpen(true)
  }

  const columns = useMemo(() => getColumns(t, handleViewDetails), [t])
  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'feedbacks'
  })

  const [searchFilter] = useQueryState('feedbacks_author', parseAsString)

  const searchTerm = searchFilter ?? undefined

  const { feedbacks, isLoadingFeedbacks } = useGetFeedbacks({
    targetId: packageId,
    targetType: 'MentorPackage',
    pageIndex: page,
    pageSize: limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy.toLowerCase()}` : sortBy.toLowerCase()) : undefined,
    searchTerm
  })

  const { table } = useDataTable({
    data: feedbacks.value.items,
    columns,
    pageCount: Math.ceil(feedbacks.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<Feedback>[],
      columnPinning: { right: ['actions'] },
      columnVisibility: {
        domainId: false
      }
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'feedbacks_page',
      perPage: 'feedbacks_perPage',
      sort: 'feedbacks_sort'
    },
    filterPrefix: 'feedbacks'
  })

  const isLoading = isLoadingFeedbacks

  return (
    <>
      <DataTable table={table} isLoading={isLoading}>
        <DataTableToolbar table={table} />
      </DataTable>

      <PackageFeedbackDialog open={dialogOpen} onOpenChange={setDialogOpen} feedback={selectedFeedback} />
    </>
  )
}
