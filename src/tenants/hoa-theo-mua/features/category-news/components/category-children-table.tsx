import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import type { Row } from '@tanstack/react-table'
import { MoreHorizontalIcon } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import type { NewsCategoryRow } from '../types'

interface CategoryChildrenTableProps {
  row: Row<NewsCategoryRow>
  isUpdatingCategory?: boolean
  isDeletingCategory?: boolean
  onUpdateCategory: (category: NewsCategoryRow) => void
  onDeleteCategory: (id: string) => void
}

export function CategoryChildrenTable({
  row,
  isUpdatingCategory,
  isDeletingCategory,
  onUpdateCategory,
  onDeleteCategory
}: CategoryChildrenTableProps) {
  const { t } = useTenantTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [columnWidths, setColumnWidths] = useState<number[]>([])
  const children = row.original.children ?? []
  const visibleCells = row.getVisibleCells()
  const columnCount = visibleCells.length

  useLayoutEffect(() => {
    const subComponentRow = containerRef.current?.closest('tr')
    const parentRow = subComponentRow?.previousElementSibling

    if (!(parentRow instanceof HTMLTableRowElement)) return

    const syncColumnWidths = () => {
      const widths = Array.from(parentRow.cells)
        .slice(0, columnCount)
        .map((cell) => cell.getBoundingClientRect().width)

      if (widths.length !== columnCount) return

      setColumnWidths((currentWidths) => {
        const hasChanged =
          currentWidths.length !== widths.length ||
          widths.some((width, index) => Math.round(width) !== Math.round(currentWidths[index] ?? 0))

        return hasChanged ? widths : currentWidths
      })
    }

    syncColumnWidths()

    const resizeObserver = new ResizeObserver(syncColumnWidths)
    resizeObserver.observe(parentRow)
    Array.from(parentRow.cells).forEach((cell) => resizeObserver.observe(cell))
    window.addEventListener('resize', syncColumnWidths)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncColumnWidths)
    }
  }, [columnCount])

  return (
    <div ref={containerRef} className='bg-background px-3 py-3'>
      <div className='overflow-hidden rounded-2xl border border-border/60 bg-muted/25 shadow-sm shadow-black/5'>
        <div className='bg-gradient-to-r from-accent/10 via-accent/5 to-transparent px-4 py-2.5'>
          <div className='flex items-center gap-2 text-xs font-medium tracking-[0.02em] text-muted-foreground'>
            <span className='inline-flex h-2 w-2 rounded-full bg-accent' />
            <span>{row.original.title}</span>
            <span className='text-muted-foreground/70'>/</span>
            <span>{children.length}</span>
            <span>{children.length === 1 ? 'child' : 'children'}</span>
          </div>
        </div>

        <div className='relative overflow-hidden pl-4 before:absolute before:bottom-3 before:left-4 before:top-3 before:w-px before:rounded-full before:bg-accent/45'>
          <Table className='table-fixed'>
            <colgroup>
              {visibleCells.map((cell, index) => (
                <col key={cell.id} style={{ width: columnWidths[index] ?? cell.column.getSize() }} />
              ))}
            </colgroup>
            <TableBody>
              {children.length ? (
                children.map((child, childIndex) => {
                  const title = child.title?.trim()

                  return (
                    <TableRow
                      key={child.categoryId}
                      className='border-border/50 bg-transparent hover:bg-accent/6 data-[state=selected]:bg-accent/10'
                    >
                      {visibleCells.map((cell) => {
                        const columnId = cell.column.id

                        if (columnId === 'title') {
                          return (
                            <TableCell key={`${child.categoryId}-${columnId}`} className='py-3'>
                              <div className='flex items-center gap-3 pl-3'>
                                <div className='flex items-center gap-2 text-muted-foreground/75'>
                                  <span className='h-px w-4 rounded-full bg-border' />
                                  <span
                                    className={cn(
                                      'inline-flex size-2.5 rounded-full border border-accent/40 bg-background shadow-sm',
                                      childIndex % 2 === 0 && 'bg-accent/15'
                                    )}
                                  />
                                </div>
                                <div className='min-w-0'>
                                  <p
                                    className='truncate text-sm font-semibold text-foreground/90'
                                    title={title || t('articleCategories.column.noTitle')}
                                  >
                                    {title || t('articleCategories.column.noTitle')}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>{row.original.title}</p>
                                </div>
                              </div>
                            </TableCell>
                          )
                        }

                        if (columnId === 'parent') {
                          return (
                            <TableCell key={`${child.categoryId}-${columnId}`} className='py-3'>
                              <p className='truncate text-xs font-medium tracking-[0.02em] text-muted-foreground'>
                                {row.original.title}
                              </p>
                            </TableCell>
                          )
                        }

                        if (columnId === 'count') {
                          return (
                            <TableCell
                              key={`${child.categoryId}-${columnId}`}
                              className='py-3 text-center text-sm font-medium tabular-nums text-foreground/75'
                            >
                              {child.count ?? 0}
                            </TableCell>
                          )
                        }

                        if (columnId === 'actions') {
                          return (
                            <TableCell key={`${child.categoryId}-${columnId}`} className='py-3'>
                              <div className='flex justify-end pr-2'>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant='ghost' className='size-8 rounded-xl p-0 hover:bg-accent/10'>
                                      <span className='sr-only'>{t('articleCategories.action.openMenu')}</span>
                                      <MoreHorizontalIcon className='size-4' />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align='end'>
                                    <DropdownMenuLabel>{t('articleCategories.action.actions')}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      disabled={isUpdatingCategory}
                                      onClick={() => onUpdateCategory(child)}
                                    >
                                      {t('articleCategories.action.update')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className='focus:text-destructive'
                                      disabled={isDeletingCategory}
                                      onClick={() => onDeleteCategory(child.categoryId)}
                                    >
                                      {t('articleCategories.action.delete')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          )
                        }

                        return <TableCell key={`${child.categoryId}-${columnId}`} className='py-3' />
                      })}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow className='border-border/50 bg-transparent hover:bg-transparent'>
                  <TableCell
                    colSpan={visibleCells.length}
                    className='h-18 py-4 text-center text-sm text-muted-foreground'
                  >
                    {t('articleCategories.column.noChildren')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
