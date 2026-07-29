/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DataTableConfig } from '@/lib/data-table/data-table'
import type { FilterItemSchema } from '@/lib/data-table/parsers'
import type { Column, ColumnSort, Row, RowData } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // biome-ignore lint/correctness/noUnusedVariables: TData is used in the TableMeta interface
  interface TableMeta<TData extends RowData> {
    queryKeys?: QueryKeys
  }

  // biome-ignore lint/correctness/noUnusedVariables: TData and TValue are used in the ColumnMeta interface
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string
    placeholder?: string
    variant?: FilterVariant
    options?: Option[]
    range?: RangeValue
    unit?: string
    icon?: React.FC<React.SVGProps<SVGSVGElement>>
    // Escape hatch for filters whose UI can't be expressed by `variant` alone (e.g. a tree picker) -
    // when set, the toolbar renders this instead of switching on `variant`.
    renderFilter?: (context: { column: Column<TData, TValue>; label: string }) => React.ReactNode
  }
}

export interface QueryKeys {
  page: string
  perPage: string
  sort: string
  filters: string
  joinOperator: string
}

export interface Option {
  label: string | React.ReactNode
  value: string
  count?: number | string
  icon?: React.FC<React.SVGProps<SVGSVGElement>>
}

export type RangeValue = [number, number]

export type FilterOperator = DataTableConfig['operators'][number]
export type FilterVariant = DataTableConfig['filterVariants'][number]
export type JoinOperator = DataTableConfig['joinOperators'][number]

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, 'id'> {
  id: Extract<keyof TData, string>
}

export interface ExtendedColumnFilter<TData> extends FilterItemSchema {
  id: Extract<keyof TData, string>
}

export interface DataTableRowAction<TData> {
  row: Row<TData>
  variant: 'update' | 'delete'
}
