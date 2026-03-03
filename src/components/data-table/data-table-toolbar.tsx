import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { cn } from '@/shared/utils'
import type { Option } from '@/types/data-table.type'
import type { Column, Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { DataTableDateFilter } from './data-table-date-filter'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import DataTableRadioFilter from './data-table-radio-filter'
import { DataTableSliderFilter } from './data-table-slider-filter'
import { DataTableViewOptions } from './data-table-view-options'

const DEBOUNCE_MS = 300

interface DebouncedInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: string
  onValueChange: (value: string) => void
  debounceMs?: number
}

function DebouncedInput({
  value: externalValue,
  onValueChange,
  debounceMs = DEBOUNCE_MS,
  ...props
}: DebouncedInputProps) {
  const [localValue, setLocalValue] = React.useState(externalValue)

  const debouncedOnChange = useDebouncedCallback((value: string) => {
    onValueChange(value)
  }, debounceMs)

  // Sync local value when external value changes (e.g., reset filters)
  React.useLayoutEffect(() => {
    setLocalValue(externalValue)
  }, [externalValue])

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      setLocalValue(newValue)
      debouncedOnChange(newValue)
    },
    [debouncedOnChange]
  )

  return <Input {...props} value={localValue} onChange={handleChange} />
}

interface DataTableToolbarProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>
  /** Override filter options with updated counts - keyed by column.id */
  filterOptionOverrides?: Record<string, Option[]>
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  filterOptionOverrides,
  ...props
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation()
  const isFiltered = table.getState().columnFilters.length > 0

  const columns = React.useMemo(() => table.getAllColumns().filter((column) => column.getCanFilter()), [table])

  const onReset = React.useCallback(() => {
    table.resetColumnFilters()
  }, [table])

  return (
    <div
      role='toolbar'
      aria-orientation='horizontal'
      className={cn('flex w-full items-start justify-between gap-2 p-1', className)}
      {...props}
    >
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        {columns.map((column) => (
          <DataTableToolbarFilter
            key={column.id}
            column={column}
            optionsOverride={filterOptionOverrides?.[column.id]}
          />
        ))}
        {isFiltered && (
          <Button aria-label='Reset filters' variant='outline' size='sm' className='border-dashed' onClick={onReset}>
            <X />
            {t('dataTable.toolbar.reset')}
          </Button>
        )}
      </div>
      <div className='flex items-center gap-2'>
        {children}
        <DataTableViewOptions table={table} align='end' />
      </div>
    </div>
  )
}
interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>
  optionsOverride?: Option[]
}

function DataTableToolbarFilter<TData>({ column, optionsOverride }: DataTableToolbarFilterProps<TData>) {
  const { t } = useTranslation()
  const columnMeta = column.columnDef.meta

  // Use override options if provided, otherwise fall back to column meta options
  const options = optionsOverride ?? columnMeta?.options ?? []

  if (!columnMeta?.variant) return null

  const label = columnMeta.label ? t(columnMeta.label) : column.id
  const placeholder = columnMeta.placeholder ? t(columnMeta.placeholder) : label

  switch (columnMeta.variant) {
    case 'text':
      if (columnMeta.icon) {
        return (
          <div className='relative'>
            <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
              {columnMeta.icon &&
                React.createElement(columnMeta.icon, {
                  className: 'size-4'
                })}
              <span className='sr-only'>{label}</span>
            </div>

            <DebouncedInput
              placeholder={placeholder}
              value={(column.getFilterValue() as string) ?? ''}
              onValueChange={(value) => column.setFilterValue(value)}
              className='h-8 min-w-64 peer pl-9'
              spellCheck={false}
            />
          </div>
        )
      }

      return (
        <DebouncedInput
          placeholder={placeholder}
          value={(column.getFilterValue() as string) ?? ''}
          onValueChange={(value) => column.setFilterValue(value)}
          className='h-8 w-40 lg:w-56'
        />
      )

    case 'number':
      return (
        <div className='relative'>
          <DebouncedInput
            type='number'
            inputMode='numeric'
            placeholder={placeholder}
            value={(column.getFilterValue() as string) ?? ''}
            onValueChange={(value) => column.setFilterValue(value)}
            className={cn('h-8 w-[120px]', columnMeta.unit && 'pr-8')}
          />
          {columnMeta.unit && (
            <span className='absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm'>
              {columnMeta.unit}
            </span>
          )}
        </div>
      )

    case 'range':
      return <DataTableSliderFilter column={column} title={label} />

    case 'date':
    case 'dateRange':
      return <DataTableDateFilter column={column} title={label} multiple={columnMeta.variant === 'dateRange'} />

    case 'select':
    case 'multiSelect':
      return (
        <DataTableFacetedFilter
          column={column}
          title={label}
          options={options}
          multiple={columnMeta.variant === 'multiSelect'}
        />
      )

    case 'radio':
      return <DataTableRadioFilter column={column} title={label} options={options} />
    default:
      return null
  }
}
