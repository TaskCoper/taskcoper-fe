import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronDownIcon, ChevronRightIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import type { NewsCategoryRow } from '../types'

const ARTICLE_CATEGORY_I18N_PREFIX = 'articleCategories' as const

interface GetColumnsParams {
  t: TenantT
  onUpdateCategory: (category: NewsCategoryRow) => void
  onDeleteCategory: (id: string) => void
  isUpdatingCategory?: boolean
  isDeletingCategory?: boolean
}

export const getColumns = ({
  t,
  onUpdateCategory,
  onDeleteCategory,
  isUpdatingCategory,
  isDeletingCategory
}: GetColumnsParams): ColumnDef<NewsCategoryRow>[] => {
  return [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => {
        const hasChildren = !!row.original.children?.length

        return (
          <Button
            variant='ghost'
            size='icon-sm'
            className={cn(
              'rounded-xl border border-transparent transition-all duration-200',
              hasChildren && 'bg-accent/5 text-foreground hover:border-border/60 hover:bg-accent/10',
              !hasChildren && 'text-muted-foreground/40 hover:bg-transparent'
            )}
            disabled={!hasChildren}
            onClick={() => row.toggleExpanded()}
          >
            {row.getIsExpanded() ? (
              <ChevronDownIcon className='size-4' />
            ) : (
              <ChevronRightIcon
                className={cn('size-4', hasChildren ? 'text-muted-foreground' : 'text-muted-foreground/30')}
              />
            )}
          </Button>
        )
      },
      enableSorting: false,
      enableHiding: false,
      size: 5,
      minSize: 5,
      maxSize: 5
    },
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label={t(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.selectAll`)}
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={t(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.selectRow`)}
          className='translate-y-0.5'
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 30
    },
    {
      id: 'title',
      accessorKey: 'title',
      meta: {
        label: 'articles.column.title',
        placeholder: 'articles.column.titlePlaceholder',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.title`)} />
      ),
      cell: ({ row }) => {
        const title = row.original.title?.trim()

        if (!title) {
          return (
            <p className='w-full max-w-125 truncate text-muted-foreground xl:max-w-none'>
              {t(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.noTitle`)}
            </p>
          )
        }

        return (
          <div className='flex min-w-0 items-center gap-3'>
            <span
              className={cn(
                'inline-flex h-8 w-1 shrink-0 rounded-full bg-transparent transition-colors',
                row.original.children?.length ? 'bg-accent/65' : 'bg-border/70'
              )}
            />
            <div className='min-w-0'>
              <p className='w-full max-w-125 truncate font-semibold tracking-[-0.01em] xl:max-w-none' title={title}>
                {title}
              </p>
              <p className='text-xs text-muted-foreground'>
                {row.original.children?.length
                  ? `${row.original.children.length} subcategories`
                  : 'Standalone category'}
              </p>
            </div>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'parent',
      accessorKey: 'parent',
      meta: {
        label: t(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.parent`)
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={t(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.parent`)} />
      ),
      cell: ({ row }) => {
        const parentTitle = row.original.parent?.title?.trim()

        if (!parentTitle) {
          return (
            <span className='inline-flex rounded-full border border-dashed border-border/80 px-2.5 py-1 text-xs text-muted-foreground'>
              {t(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.noParent`)}
            </span>
          )
        }

        return (
          <p className='w-full max-w-80 truncate text-sm font-medium text-foreground/80' title={parentTitle}>
            {parentTitle}
          </p>
        )
      },
      enableSorting: false,
      enableHiding: true,
      size: 30
    },
    {
      id: 'count',
      accessorKey: 'count',
      meta: {
        label: t(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.count`)
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={t(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.count`)}
          className='mx-auto'
        />
      ),
      cell: ({ row }) => (
        <p className='text-center text-sm font-medium tabular-nums tracking-[-0.01em] text-foreground/75'>
          {row.original.count ?? 0}
        </p>
      ),
      enableSorting: false,
      enableHiding: true,
      size: 30
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { categoryId } = row.original

        return (
          <div className='flex justify-end pr-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='size-8 rounded-xl p-0 hover:bg-accent/10'>
                  <span className='sr-only'>{t(`${ARTICLE_CATEGORY_I18N_PREFIX}.action.openMenu`)}</span>
                  <MoreHorizontalIcon className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>{t(`${ARTICLE_CATEGORY_I18N_PREFIX}.action.actions`)}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isUpdatingCategory}
                  onClick={() => {
                    onUpdateCategory(row.original)
                  }}
                >
                  {t(`${ARTICLE_CATEGORY_I18N_PREFIX}.action.update`)}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='focus:text-destructive'
                  disabled={isDeletingCategory}
                  onClick={() => {
                    onDeleteCategory(categoryId)
                  }}
                >
                  {t(`${ARTICLE_CATEGORY_I18N_PREFIX}.action.delete`)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 30
    }
  ]
}
