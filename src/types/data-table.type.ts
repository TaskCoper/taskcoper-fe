/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DataTableConfig } from '@/lib/data-table/data-table'
import type { FilterItemSchema } from '@/lib/data-table/parsers'
import type { I18nKey } from '@/lib/i18n/types'
import type { ColumnSort, Row, RowData } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // biome-ignore lint/correctness/noUnusedVariables: TData is used in the TableMeta interface
  interface TableMeta<TData extends RowData> {
    queryKeys?: QueryKeys
  }

  // biome-ignore lint/correctness/noUnusedVariables: TData and TValue are used in the ColumnMeta interface
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: I18nKey
    placeholder?: I18nKey
    variant?: FilterVariant
    options?: Option[]
    range?: [number, number]
    unit?: string
    icon?: React.FC<React.SVGProps<SVGSVGElement>>
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
