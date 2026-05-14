import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { getSortingStateParser } from '@/lib/data-table/parsers'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import type { ExtendedColumnSort, QueryKeys } from '@/types/data-table.type'
import {
  type ColumnFiltersState,
  type ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Updater,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table'
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  type SingleParser,
  useQueryState,
  type UseQueryStateOptions,
  useQueryStates
} from 'nuqs'
import * as React from 'react'

const PAGE_KEY = 'page'
const PER_PAGE_KEY = 'perPage'
const SORT_KEY = 'sort'
const FILTERS_KEY = 'filters'
const JOIN_OPERATOR_KEY = 'joinOperator'
const ARRAY_SEPARATOR = ','
const DEBOUNCE_MS = 300
const THROTTLE_MS = 50

interface UseDataTableProps<TData>
  extends
    Omit<
      TableOptions<TData>,
      'state' | 'pageCount' | 'getCoreRowModel' | 'manualFiltering' | 'manualPagination' | 'manualSorting'
    >,
    Required<Pick<TableOptions<TData>, 'pageCount'>> {
  initialState?: Omit<Partial<TableState>, 'sorting'> & {
    sorting?: ExtendedColumnSort<TData>[]
  }
  queryKeys?: Partial<QueryKeys>
  filterPrefix?: string
  history?: 'push' | 'replace'
  debounceMs?: number
  throttleMs?: number
  clearOnDefault?: boolean
  enableAdvancedFilter?: boolean
  scroll?: boolean
  shallow?: boolean
  startTransition?: React.TransitionStartFunction
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const {
    columns,
    pageCount = -1,
    initialState,
    queryKeys,
    filterPrefix = '',
    history = 'replace',
    debounceMs = DEBOUNCE_MS,
    throttleMs = THROTTLE_MS,
    clearOnDefault = false,
    enableAdvancedFilter = false,
    scroll = false,
    shallow = true,
    startTransition,
    ...tableProps
  } = props
  const pageKey = queryKeys?.page ?? PAGE_KEY
  const perPageKey = queryKeys?.perPage ?? PER_PAGE_KEY
  const sortKey = queryKeys?.sort ?? SORT_KEY
  const filtersKey = queryKeys?.filters ?? FILTERS_KEY
  const joinOperatorKey = queryKeys?.joinOperator ?? JOIN_OPERATOR_KEY

  const queryStateOptions = React.useMemo<Omit<UseQueryStateOptions<string>, 'parse'>>(
    () => ({
      history,
      scroll,
      shallow,
      throttleMs,
      debounceMs,
      clearOnDefault,
      startTransition
    }),
    [history, scroll, shallow, throttleMs, debounceMs, clearOnDefault, startTransition]
  )

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialState?.rowSelection ?? {})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialState?.columnVisibility ?? {})
  const [expanded, setExpanded] = React.useState<ExpandedState>(initialState?.expanded ?? {})

  const [page, setPage] = useQueryState(
    pageKey,
    parseAsInteger.withOptions(queryStateOptions).withDefault(DEFAULT_PAGE_INDEX)
  )
  const [perPage, setPerPage] = useQueryState(
    perPageKey,
    parseAsInteger.withOptions(queryStateOptions).withDefault(initialState?.pagination?.pageSize ?? DEFAULT_PAGE_SIZE)
  )

  const pagination: PaginationState = React.useMemo(() => {
    return {
      pageIndex: page - 1, // zero-based index -> one-based index
      pageSize: perPage
    }
  }, [page, perPage])

  const onPaginationChange = React.useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      if (typeof updaterOrValue === 'function') {
        const newPagination = updaterOrValue(pagination)
        void setPage(newPagination.pageIndex + 1)
        void setPerPage(newPagination.pageSize)
      } else {
        void setPage(updaterOrValue.pageIndex + 1)
        void setPerPage(updaterOrValue.pageSize)
      }
    },
    [pagination, setPage, setPerPage]
  )

  const columnIds = React.useMemo(() => {
    return new Set(columns.map((column) => column.id).filter(Boolean) as string[])
  }, [columns])

  const [sorting, setSorting] = useQueryState(
    sortKey,
    getSortingStateParser<TData>(columnIds)
      .withOptions(queryStateOptions)
      .withDefault(initialState?.sorting ?? [])
  )

  const onSortingChange = React.useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      if (typeof updaterOrValue === 'function') {
        const newSorting = updaterOrValue(sorting)
        setSorting(newSorting as ExtendedColumnSort<TData>[])
      } else {
        setSorting(updaterOrValue as ExtendedColumnSort<TData>[])
      }
    },
    [sorting, setSorting]
  )

  const filterableColumns = React.useMemo(() => {
    if (enableAdvancedFilter) return []

    return columns.filter((column) => column.enableColumnFilter)
  }, [columns, enableAdvancedFilter])

  const filterParsers = React.useMemo(() => {
    if (enableAdvancedFilter) return {}

    return filterableColumns.reduce<Record<string, SingleParser<string> | SingleParser<string[]>>>((acc, column) => {
      const variant = column.meta?.variant
      const queryKey = filterPrefix ? `${filterPrefix}_${column.id}` : (column.id ?? '')
      // Parse as array for multi-select, date ranges, and range filters
      // Radio and select should be parsed as single strings
      if (variant === 'multiSelect' || variant === 'dateRange' || variant === 'range') {
        acc[queryKey] = parseAsArrayOf(parseAsString, ARRAY_SEPARATOR).withOptions(queryStateOptions)
      } else {
        acc[queryKey] = parseAsString.withOptions(queryStateOptions)
      }
      return acc
    }, {})
  }, [filterableColumns, queryStateOptions, enableAdvancedFilter, filterPrefix])

  const [filterValues, setFilterValues] = useQueryStates(filterParsers)

  const debouncedSetFilterValues = useDebouncedCallback((values: typeof filterValues) => {
    void setPage(1)
    void setFilterValues(values)
  }, debounceMs)

  const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
    if (enableAdvancedFilter) return []

    return Object.entries(filterValues).reduce<ColumnFiltersState>((filters, [key, value]) => {
      if (value !== null) {
        // Strip filter prefix to get the original column ID
        const columnId = filterPrefix && key.startsWith(`${filterPrefix}_`) ? key.slice(filterPrefix.length + 1) : key

        // Find the column to validate against its options
        const column = filterableColumns.find((col) => col.id === columnId)
        const columnOptions = column?.meta?.options

        // If column has options, validate the values
        if (columnOptions) {
          const validOptionValues = new Set(columnOptions.map((opt) => opt.value))

          if (Array.isArray(value)) {
            // For multiSelect - validate array
            const validValues = value.filter((val) => validOptionValues.has(val))
            if (validValues.length > 0) {
              filters.push({
                id: columnId,
                value: validValues.length === value.length ? value : validValues
              })
            }
          } else if (typeof value === 'string') {
            // For radio/select - validate single string
            if (validOptionValues.has(value)) {
              filters.push({
                id: columnId,
                value: value
              })
            }
          }
        } else {
          // No options to validate against, use value as-is
          filters.push({
            id: columnId,
            value: value
          })
        }
      }
      return filters
    }, [])
  }, [filterValues, enableAdvancedFilter, filterPrefix, filterableColumns])

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters)

  // Update columnFilters when filterValues change (e.g., after URL cleanup)
  React.useEffect(() => {
    if (enableAdvancedFilter) return
    setColumnFilters(initialColumnFilters)
  }, [initialColumnFilters, enableAdvancedFilter])

  // Sync filterValues (URL) when invalid values are filtered out from initialColumnFilters
  React.useLayoutEffect(() => {
    if (enableAdvancedFilter) return

    const updates: Record<string, string | string[] | null> = {}
    let hasUpdates = false

    // Check each filter value against its column's valid options
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value === null) return

      const columnId = filterPrefix && key.startsWith(`${filterPrefix}_`) ? key.slice(filterPrefix.length + 1) : key
      const column = filterableColumns.find((col) => col.id === columnId)
      const columnOptions = column?.meta?.options

      // If column has options, validate the values
      if (columnOptions) {
        const validOptionValues = new Set(columnOptions.map((opt) => opt.value))

        if (Array.isArray(value)) {
          // For multiSelect - validate array
          const validValues = value.filter((val) => validOptionValues.has(val))
          if (validValues.length !== value.length) {
            updates[key] = validValues.length > 0 ? validValues : null
            hasUpdates = true
          }
        } else if (typeof value === 'string') {
          // For radio/select - validate single string
          if (!validOptionValues.has(value)) {
            updates[key] = null
            hasUpdates = true
          }
        }
      }
    })

    // Update URL if there were invalid values
    if (hasUpdates) {
      void setFilterValues((prev) => ({ ...prev, ...updates }))
    }
  }, [filterValues, filterableColumns, filterPrefix, enableAdvancedFilter, setFilterValues])

  const onColumnFiltersChange = React.useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      if (enableAdvancedFilter) return

      setColumnFilters((prev) => {
        const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue

        const filterUpdates = next.reduce<Record<string, string | string[] | null>>((acc, filter) => {
          if (filterableColumns.find((column) => column.id === filter.id)) {
            // Add filter prefix to the query parameter key
            const queryKey = filterPrefix ? `${filterPrefix}_${filter.id}` : filter.id
            acc[queryKey] = filter.value as string | string[]
          }
          return acc
        }, {})

        for (const prevFilter of prev) {
          if (!next.some((filter) => filter.id === prevFilter.id)) {
            // Add filter prefix to the query parameter key
            const queryKey = filterPrefix ? `${filterPrefix}_${prevFilter.id}` : prevFilter.id
            filterUpdates[queryKey] = null
          }
        }

        debouncedSetFilterValues(filterUpdates)
        return next
      })
    },
    [debouncedSetFilterValues, filterableColumns, enableAdvancedFilter, filterPrefix]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    ...tableProps,
    columns,
    initialState,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      expanded
    },
    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: false
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    meta: {
      ...tableProps.meta,
      queryKeys: {
        page: pageKey,
        perPage: perPageKey,
        sort: sortKey,
        filters: filtersKey,
        joinOperator: joinOperatorKey
      }
    }
  })

  return { table, shallow, debounceMs, throttleMs }
}
