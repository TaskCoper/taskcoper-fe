import { getSortingStateParser } from '@/lib/data-table/parsers'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/shared/constants'
import type { ColumnDef } from '@tanstack/react-table'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useMemo } from 'react'

interface UseTableQueryParamsOptions<TData = unknown> {
  /**
   * Prefix for all query parameters (e.g., 'courts', 'rooms', 'branches')
   * If not provided, no prefix is used
   */
  prefix?: string
  /**
   * Column definitions to extract column IDs for sorting validation
   */
  columns: ColumnDef<TData>[]
  page?: number
  limit?: number
}

interface UseTableQueryParamsReturn {
  page: number
  limit: number
  sortBy?: string
  orderBy: 'asc' | 'desc'
  isActive?: string[]
  sorting: Array<{ id: string; desc: boolean }> | null
}

/**
 * Reusable hook for managing table query parameters with namespacing support.
 * Handles common patterns: pagination, sorting, name filter, and isActive filter.
 *
 * For custom filters, use useQueryState directly in your component with the same prefix.
 *
 * @example
 * ```tsx
 * const { page, limit, sortBy, orderBy, name, isActive } = useTableQueryParams({
 *   prefix: 'courts',
 *   columns,
 * })
 *
 * // For custom filters, use useQueryState directly:
 * const [surfaceFilter] = useQueryState('courts_surface', parseAsArrayOf(parseAsString, ','))
 */
export const useTableQueryParams = <TData = unknown>(
  options: UseTableQueryParamsOptions<TData>
): UseTableQueryParamsReturn => {
  const { prefix = '', columns } = options

  const getParamName = (name: string) => (prefix ? `${prefix}_${name}` : name)

  const [pageFilter] = useQueryState(getParamName('page'), parseAsInteger)
  const [perPageFilter] = useQueryState(getParamName('perPage'), parseAsInteger)

  // Sorting
  const columnIds = useMemo(() => new Set(columns.map((column) => column.id).filter(Boolean) as string[]), [columns])
  const [sorting] = useQueryState(getParamName('sort'), getSortingStateParser(columnIds))

  // Transform to API-ready values
  const page = pageFilter ?? options.page ?? DEFAULT_PAGE_INDEX
  const limit = perPageFilter ?? options.limit ?? DEFAULT_PAGE_SIZE
  const sortBy = sorting?.[0]?.id
  const orderBy = (sorting?.[0]?.desc ?? true) ? 'desc' : 'asc'

  return {
    page,
    limit,
    sortBy,
    orderBy,
    sorting: sorting as Array<{ id: string; desc: boolean }> | null
  }
}
