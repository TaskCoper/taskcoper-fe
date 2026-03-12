import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import type { Revenue } from '@/types/project.type'
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetProjectRevenues } from '../hooks/use-get-project-revenues'
import { getColumns } from './columns/project-revenue-columns'
import AddProjectRevenueDialog from './dialogs/add-project-revenue-dialog'

interface ProjectRevenueTableProps {
  projectId: string
}

export default function ProjectRevenueTable({ projectId }: ProjectRevenueTableProps) {
  const { t } = useTranslation()
  const columns = useMemo(() => getColumns(), [])
  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'revenue'
  })

  const filterOptionOverrides = useMemo(() => {
    return {}
  }, [])

  const { projectRevenues, isLoadingProjectRevenues } = useGetProjectRevenues({
    projectId,
    pageIndex: page,
    pageSize: limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy}` : sortBy) : undefined
  })

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

  const isLoading = isLoadingProjectRevenues

  return (
    <DataTable table={table} isLoading={isLoading}>
      <DataTableToolbar table={table} filterOptionOverrides={filterOptionOverrides}>
        <AddProjectRevenueDialog projectId={projectId} type='CashIn'>
          <Button size='sm' className='bg-emerald-600 border-2 border-emerald-400 hover:bg-emerald-700'>
            <TrendingUpIcon />
            {t('project.addProjectRevenue.trigger.cashIn')}
          </Button>
        </AddProjectRevenueDialog>

        <AddProjectRevenueDialog projectId={projectId} type='CashOut'>
          <Button size='sm' className='bg-rose-600 border-2 border-rose-400 hover:bg-rose-700'>
            <TrendingDownIcon />
            {t('project.addProjectRevenue.trigger.cashOut')}
          </Button>
        </AddProjectRevenueDialog>
      </DataTableToolbar>
    </DataTable>
  )
}
