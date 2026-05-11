import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import type { TransactionRow } from '@/features/transactions/types'
import { useDataTable } from '@/hooks/use-data-table'
import { useTableQueryParams } from '@/hooks/use-table-query-params'
import type { ExtendedColumnSort } from '@/types/data-table.type'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetMyTransactionStatusStats } from '../hooks/use-get-my-transaction-status-stats'
import { useGetMyTransactionTypeStats } from '../hooks/use-get-my-transaction-type-stats'
import { useGetMyTransactions } from '../hooks/use-get-my-transactions'
import { getColumns } from './transaction-columns'

export default function TransactionsTable() {
  const { t } = useTranslation()
  const columns = useMemo(() => getColumns(), [])

  const { page, limit, sorting, sortBy, orderBy } = useTableQueryParams({
    columns,
    prefix: 'transactions'
  })

  const [descriptionFilter] = useQueryState('transactions_description', parseAsString)
  const [createdOnFilter] = useQueryState('transactions_createdOnUtc', parseAsArrayOf(parseAsString))
  const [statusFilter] = useQueryState('transactions_status', parseAsArrayOf(parseAsString))
  const [typeFilter] = useQueryState('transactions_type', parseAsArrayOf(parseAsString))

  const description = descriptionFilter ?? undefined
  const createdOn = createdOnFilter && createdOnFilter.length > 1 ? createdOnFilter : undefined
  const statuses = statusFilter && statusFilter.length > 0 ? statusFilter : undefined
  const types = typeFilter && typeFilter.length > 0 ? typeFilter : undefined

  const { transactions, isLoadingTransactions } = useGetMyTransactions({
    pageIndex: page,
    pageSize: limit,
    sortBy: sortBy ? (orderBy === 'desc' ? `-${sortBy.toLowerCase()}` : sortBy.toLowerCase()) : undefined,
    searchTerm: description,
    createdFrom: createdOn?.[0],
    createdTo: createdOn?.[1],
    status: statuses,
    type: types
  })

  const { transactionStatusStats, isLoadingTransactionStatusStats } = useGetMyTransactionStatusStats()
  const { transactionTypeStats, isLoadingTransactionTypeStats } = useGetMyTransactionTypeStats()

  const filterOptionOverrides = useMemo(() => {
    return {
      status: transactionStatusStats.value.items.map((item) => ({
        value: item.status,
        label: t(`transactions.status.${item.status.toLowerCase()}`),
        count: item.totalTransactions
      })),
      type: transactionTypeStats.value.items.map((item) => ({
        value: item.type,
        label: t(`transactions.type.${item.type.toLowerCase()}`),
        count: item.totalTransactions
      }))
    }
  }, [transactionStatusStats, transactionTypeStats, t])

  const { table } = useDataTable({
    data: transactions.items,
    columns,
    pageCount: Math.ceil(transactions.totalCount / limit),
    initialState: {
      sorting: (sorting ?? []) as ExtendedColumnSort<TransactionRow>[],
      columnPinning: { right: ['actions'] }
    },
    getRowId: ({ transactionId }) => transactionId,
    shallow: false,
    clearOnDefault: true,
    queryKeys: {
      page: 'transactions_page',
      perPage: 'transactions_perPage',
      sort: 'transactions_sort'
    },
    filterPrefix: 'transactions'
  })

  const isLoading = isLoadingTransactions || isLoadingTransactionStatusStats || isLoadingTransactionTypeStats

  return (
    <DataTable table={table} isLoading={isLoading}>
      <DataTableToolbar table={table} filterOptionOverrides={filterOptionOverrides} />
    </DataTable>
  )
}
