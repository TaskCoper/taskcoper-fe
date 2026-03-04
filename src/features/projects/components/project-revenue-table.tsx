import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { PlusIcon } from 'lucide-react'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getColumns } from './columns/project-revenue-columns'

export type RevenueItem = {
  id: string
  name: string
  amount: number
  balanceAfter: number
  type: 'income' | 'expense'
  note: string
  createdOnUtc: string
}

const MOCK_ITEMS: RevenueItem[] = [
  {
    id: '1',
    name: 'Thanh toán hợp đồng website',
    amount: 15000000,
    balanceAfter: 45000000,
    type: 'income',
    note: 'Khách thanh toán đợt 1',
    createdOnUtc: '2026-03-01T08:30:00Z'
  },
  {
    id: '2',
    name: 'Thanh toán hosting',
    amount: 2000000,
    balanceAfter: 43000000,
    type: 'expense',
    note: '',
    createdOnUtc: '2026-03-02T09:00:00Z'
  }
]

interface ProjectRevenueTableProps {
  projectId: string
  onAddRevenue: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ProjectRevenueTable({ projectId: _projectId, onAddRevenue }: ProjectRevenueTableProps) {
  const { t } = useTranslation()
  const confirm = useConfirmStore((s) => s.confirm)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<RevenueItem[]>(MOCK_ITEMS)

  const onDeleteRevenue = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: t('project.projectRevenue.deleteRevenue.title'),
        description: t('project.projectRevenue.deleteRevenue.description'),
        confirmText: t('project.projectRevenue.deleteRevenue.confirmText'),
        cancelText: t('common.button.cancel'),
        variant: 'destructive'
      })
      if (confirmed) {
        setData((prev) => prev.filter((item) => item.id !== id))
      }
    },
    [confirm, t]
  )

  const columns = useMemo(() => getColumns({ onDeleteRevenue }), [onDeleteRevenue])

  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'revenue'
  })

  const [nameFilter] = useQueryState('revenue_name', parseAsString)
  const [dateFilter] = useQueryState('revenue_createdOnUtc', parseAsArrayOf(parseAsString))
  const [typeFilter] = useQueryState('revenue_type', parseAsArrayOf(parseAsString))

  const name = nameFilter ?? undefined
  const date = dateFilter && dateFilter.length > 1 ? dateFilter : undefined
  const types = typeFilter && typeFilter.length > 0 ? typeFilter : undefined

  const filteredData = useMemo(() => {
    let result = [...MOCK_ITEMS]

    if (name) {
      result = result.filter((item) => item.name.toLowerCase().includes(name.toLowerCase()))
    }
    if (date) {
      result = result.filter((item) => item.createdOnUtc >= date[0] && item.createdOnUtc <= date[1])
    }
    if (types) {
      result = result.filter((item) => types.includes(item.type))
    }
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy as keyof RevenueItem]
        const bVal = b[sortBy as keyof RevenueItem]
        if (aVal < bVal) return orderBy === 'desc' ? 1 : -1
        if (aVal > bVal) return orderBy === 'desc' ? -1 : 1
        return 0
      })
    }

    return result
  }, [name, date, types, sortBy, orderBy])

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit
    return filteredData.slice(start, start + limit)
  }, [filteredData, page, limit])

  const { table } = useDataTable({
    data: paginatedData,
    columns,
    pageCount: Math.ceil(filteredData.length / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<RevenueItem>[],
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

  return (
    <DataTable table={table} isLoading={false}>
      <DataTableToolbar table={table}>
        <Button size='sm' onClick={onAddRevenue}>
          <PlusIcon />
          {t('project.projectRevenue.actions.add')}
        </Button>
      </DataTableToolbar>
    </DataTable>
  )
}
