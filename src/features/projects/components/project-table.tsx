import { DataTable } from '@/components/data-table/data-table'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { getColumns } from '@/features/tasks/components/columns/task-columns'
import { useGetTasks } from '@/features/tasks/hooks/use-get-tasks'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import type { TaskRow } from '@/types/task.type'
import { PlusCircleIcon } from 'lucide-react'
import { useMemo } from 'react'

interface ProjectTableProps {
  projectId: string
  parentMilestoneId: string
}

export default function ProjectTable({ projectId, parentMilestoneId }: ProjectTableProps) {
  const columns = useMemo(() => getColumns({ projectId, parentMilestoneId }), [projectId, parentMilestoneId])
  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'tasks'
  })

  const { tasks, isLoadingTasks } = useGetTasks({
    parentMilestoneId,
    pageIndex: page,
    pageSize: limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy}` : sortBy) : undefined
  })

  const { table } = useDataTable({
    data: tasks.value.items,
    columns,
    pageCount: Math.ceil(tasks.value.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<TaskRow>[],
      columnPinning: { right: ['actions'] },
      columnVisibility: {
        domainId: false
      }
    },
    getRowId: ({ id }) => id,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'tasks_page',
      perPage: 'tasks_perPage',
      sort: 'tasks_sort'
    },
    filterPrefix: 'tasks'
  })

  if (isLoadingTasks) {
    return <DataTableSkeleton columnCount={6} rowCount={8} filterCount={3} />
  }

  return (
    <div className='pb-24'>
      <DataTable table={table} isLoading={isLoadingTasks}>
        <DataTableToolbar table={table}>
          <Button size='sm'>
            <PlusCircleIcon />
            Thêm thẻ
          </Button>
          <Button size='sm'>
            <PlusCircleIcon />
            Thêm danh sách
          </Button>
        </DataTableToolbar>
      </DataTable>
    </div>
  )
}
