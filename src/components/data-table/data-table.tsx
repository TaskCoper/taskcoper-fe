import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getColumnPinningStyle } from '@/lib/data-table/utils'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { flexRender, type Row, type Table as TanstackTable } from '@tanstack/react-table'
import * as React from 'react'
import { Skeleton } from '../ui/skeleton'
import { DataTableRowDragContext, type DataTableRowDragHandle } from './use-data-table-row-drag'

/**
 * Opt-in vertical row reordering. Provide `rowDnd` to make (a subset of) rows draggable;
 * a draggable row exposes its drag listeners through `useDataTableRowDrag`, which a cell in
 * that row (e.g. a grip-handle column) reads to become the drag activator.
 */
interface RowDndConfig<TData> {
  /** Which rows can be dragged — defaults to every row. */
  getRowCanDrag?: (row: Row<TData>) => boolean
  /** Fired on a valid drop with the dragged row and the row it landed on. */
  onReorder: (params: { activeRow: Row<TData>; overRow: Row<TData> }) => void
}

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>
  actionBar?: React.ReactNode
  isLoading?: boolean
  pageSizeOptions?: number[]
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode
  rowDnd?: RowDndConfig<TData>
}

function SortableTableRow<TData>({
  row,
  children,
  ...props
}: React.ComponentProps<typeof TableRow> & { row: Row<TData> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition
  }

  const handle = React.useMemo<DataTableRowDragHandle>(
    () => ({ attributes, listeners, isDragging }),
    [attributes, listeners, isDragging]
  )

  return (
    <DataTableRowDragContext.Provider value={handle}>
      <TableRow ref={setNodeRef} style={style} className={cn(isDragging && 'relative z-10 bg-background')} {...props}>
        {children}
      </TableRow>
    </DataTableRowDragContext.Provider>
  )
}

export function DataTable<TData>({
  table,
  actionBar,
  renderSubComponent,
  pageSizeOptions,
  children,
  className,
  isLoading = false,
  rowDnd,
  ...props
}: DataTableProps<TData>) {
  const { t } = useTenantTranslation()

  const rows = table.getRowModel().rows

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const draggableRowIds = React.useMemo(
    () => (rowDnd ? rows.filter((row) => rowDnd.getRowCanDrag?.(row) ?? true).map((row) => row.id) : []),
    [rowDnd, rows]
  )

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeRow = rows.find((row) => row.id === active.id)
      const overRow = rows.find((row) => row.id === over.id)
      if (!activeRow || !overRow) return

      rowDnd?.onReorder({ activeRow, overRow })
    },
    [rowDnd, rows]
  )

  const renderDataRow = (row: Row<TData>, index: number) => {
    const cells = row.getVisibleCells().map((cell) => (
      <TableCell
        key={cell.id}
        style={{
          ...getColumnPinningStyle({ column: cell.column }),
          width: cell.column.getSize()
        }}
        className={index % 2 !== 0 ? 'bg-muted!' : ''}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </TableCell>
    ))

    const canDrag = !!rowDnd && (rowDnd.getRowCanDrag?.(row) ?? true)

    return (
      <React.Fragment key={row.id}>
        {canDrag ? (
          <SortableTableRow row={row} data-state={row.getIsSelected() && 'selected'}>
            {cells}
          </SortableTableRow>
        ) : (
          <TableRow data-state={row.getIsSelected() && 'selected'}>{cells}</TableRow>
        )}
        {renderSubComponent && (
          <TableRow className={cn(!row.getIsExpanded() && 'border-b-0')}>
            <TableCell colSpan={row.getVisibleCells().length} className='bg-muted/50 p-0'>
              <div
                className={cn(
                  'grid transition-[grid-template-rows] duration-200 ease-in-out',
                  row.getIsExpanded() ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className='overflow-hidden'>{renderSubComponent({ row })}</div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    )
  }

  const tableElement = (
    <div className='overflow-hidden rounded-2xl border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    ...getColumnPinningStyle({ column: header.column })
                  }}
                  className='bg-muted!'
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`} className='hover:bg-transparent'>
                {table.getVisibleLeafColumns().map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ ...getColumnPinningStyle({ column }), width: column.getSize() }}
                    className={rowIndex % 2 !== 0 ? 'bg-muted' : ''}
                  >
                    <Skeleton className='h-5 w-full' />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows?.length ? (
            rows.map((row, index) => renderDataRow(row, index))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                {t('dataTable.table.noResults')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className={cn('flex w-full flex-col gap-2.5 overflow-auto', className)} {...props}>
      {children}
      {rowDnd ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={draggableRowIds} strategy={verticalListSortingStrategy}>
            {tableElement}
          </SortableContext>
        </DndContext>
      ) : (
        tableElement
      )}
      <div className='flex flex-col gap-2.5'>
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
        {actionBar && table.getFilteredSelectedRowModel().rows.length > 0 && actionBar}
      </div>
    </div>
  )
}
