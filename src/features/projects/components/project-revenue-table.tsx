import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useGetProjectRevenueLabelStats } from '@/features/labels/hooks/use-get-project-revenue-label-stats'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { RevenueType, RevenueTypeLabel, type Revenue } from '@/types/project.type'
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteProjectRevenue } from '../hooks/use-delete-project-revenue'
import { useGetProjectRevenueTypeStats } from '../hooks/use-get-project-revenue-type-stats'
import { useGetProjectRevenues } from '../hooks/use-get-project-revenues'
import { getColumns } from './columns/project-revenue-columns'
import AddProjectRevenueDialog from './dialogs/add-project-revenue-dialog'
import UpdateProjectRevenueDialog from './dialogs/update-project-revenue-dialog'

interface ProjectRevenueTableProps {
  projectIdentifier: string
}

export default function ProjectRevenueTable({ projectIdentifier }: ProjectRevenueTableProps) {
  const { t } = useTranslation()
  const { confirm } = useConfirmStore()

  const { deleteProjectRevenue } = useDeleteProjectRevenue()
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null)

  const onDeleteRevenue = useCallback(
    async (id: string, revenueName: string) => {
      const confirmed = await confirm({
        title: t('task.deleteTask.title'),
        description: t('task.deleteTask.description', { taskName: revenueName }),
        confirmText: t('task.deleteTask.confirmText'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })
      if (confirmed) {
        deleteProjectRevenue({ projectIdentifier, revenueId: id })
      }
    },
    [confirm, deleteProjectRevenue, t, projectIdentifier]
  )

  const onEditRevenue = useCallback((revenue: Revenue) => {
    setEditingRevenue(revenue)
  }, [])

  const columns = useMemo(() => getColumns({ onDeleteRevenue, onEditRevenue }), [onDeleteRevenue, onEditRevenue])

  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'revenue'
  })

  const [nameFilter] = useQueryState('revenue_name', parseAsString)
  const [createdAtFilter] = useQueryState('revenue_createdOnUtc', parseAsArrayOf(parseAsString))
  const [typeFilter] = useQueryState('revenue_type', parseAsString)
  const [labelFilter] = useQueryState('revenue_labels', parseAsArrayOf(parseAsString))

  const name = nameFilter ?? undefined
  const createdAt = createdAtFilter && createdAtFilter.length > 1 ? createdAtFilter : undefined
  const type = typeFilter ?? undefined
  const labels = labelFilter && labelFilter.length > 0 ? labelFilter : undefined

  const { projectRevenues, isLoadingProjectRevenues } = useGetProjectRevenues({
    projectIdentifier,
    pageIndex: page,
    pageSize: limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy}` : sortBy) : undefined,
    searchTerm: name,
    startDate: createdAt?.[0],
    endDate: createdAt?.[1],
    type,
    labelIds: labels
  })

  const { revenueLabelStats, isLoadingRevenueLabelStats } = useGetProjectRevenueLabelStats({ projectIdentifier })
  const { revenueTypeStats, isLoadingRevenueTypeStats } = useGetProjectRevenueTypeStats({ projectIdentifier })

  const filterOptionOverrides = useMemo(() => {
    return {
      labels:
        revenueLabelStats?.map((item) => ({
          label: item.name,
          value: item.id,
          count: item.transactionCount
        })) ?? [],
      type:
        revenueTypeStats?.map((item) => ({
          label: t(RevenueTypeLabel[item.name as RevenueType]),
          value: item.name,
          count: item.transactionCount
        })) ?? []
    }
  }, [revenueLabelStats, revenueTypeStats, t])

  const { table } = useDataTable({
    data: projectRevenues?.value?.items ?? [],
    columns,
    pageCount: Math.ceil((projectRevenues?.value?.totalCount ?? 0) / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<Revenue>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'revenue_page',
      perPage: 'revenue_perPage',
      sort: 'revenue_sort'
    },
    filterPrefix: 'revenue'
  })

  const isLoading = isLoadingProjectRevenues || isLoadingRevenueLabelStats || isLoadingRevenueTypeStats

  return (
    <DataTable table={table} isLoading={isLoading}>
      <DataTableToolbar table={table} filterOptionOverrides={filterOptionOverrides}>
        <AddProjectRevenueDialog projectIdentifier={projectIdentifier} type='CashIn'>
          <Button size='sm' className='bg-emerald-600 border-2 border-emerald-400 hover:bg-emerald-700'>
            <TrendingUpIcon />
            {t('project.addProjectRevenue.trigger.cashIn')}
          </Button>
        </AddProjectRevenueDialog>

        <AddProjectRevenueDialog projectIdentifier={projectIdentifier} type='CashOut'>
          <Button size='sm' className='bg-rose-600 border-2 border-rose-400 hover:bg-rose-700'>
            <TrendingDownIcon />
            {t('project.addProjectRevenue.trigger.cashOut')}
          </Button>
        </AddProjectRevenueDialog>
      </DataTableToolbar>

      <UpdateProjectRevenueDialog
        revenue={editingRevenue}
        projectIdentifier={projectIdentifier}
        open={!!editingRevenue}
        onOpenChange={(open) => {
          if (!open) setEditingRevenue(null)
        }}
      />
    </DataTable>
  )
}
