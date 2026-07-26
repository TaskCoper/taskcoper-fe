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
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronDownIcon, ChevronRightIcon, MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import type { CategoryProduct } from '../types'
import { CategoryDragHandle } from './category-drag-handle'
import { CategoryStatusBadge, CategoryTypeBadge, CategoryWindow } from './category-product-badges'

const CATEGORY_I18N_PREFIX = 'productCategories' as const

interface GetColumnsParams {
  t: TenantT
  onUpdateCategory: (category: CategoryProduct) => void
  onDeleteCategory: (category: CategoryProduct) => void
  onManageProducts: (category: CategoryProduct) => void
  isUpdatingCategory?: boolean
  isDeletingCategory?: boolean
}

export const getCategoryColumns = ({
  t,
  onUpdateCategory,
  onDeleteCategory,
  onManageProducts,
  isUpdatingCategory,
  isDeletingCategory
}: GetColumnsParams): ColumnDef<CategoryProduct>[] => {
  return [
    {
      id: 'drag',
      header: () => null,
      // Only nested categories (depth > 0) are draggable; top-level rows render an empty cell.
      cell: ({ row }) => (row.depth > 0 ? <CategoryDragHandle t={t} /> : null),
      enableSorting: false,
      enableHiding: false,
      size: 5,
      minSize: 5,
      maxSize: 5
    },
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => {
        const canExpand = row.getCanExpand()

        return (
          <Button
            variant='ghost'
            size='icon-sm'
            className='transition-transform'
            disabled={!canExpand}
            onClick={() => row.toggleExpanded()}
          >
            {row.getIsExpanded() ? (
              <ChevronDownIcon />
            ) : (
              <ChevronRightIcon className={canExpand ? 'text-muted-foreground' : 'text-muted-foreground/30'} />
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
          aria-label={t(`${CATEGORY_I18N_PREFIX}.column.selectAll`)}
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={t(`${CATEGORY_I18N_PREFIX}.column.selectRow`)}
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
      id: 'name',
      accessorKey: 'name',
      meta: {
        label: `${CATEGORY_I18N_PREFIX}.column.name`,
        placeholder: `${CATEGORY_I18N_PREFIX}.column.namePlaceholder`,
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label={`${CATEGORY_I18N_PREFIX}.column.name`} />,
      cell: ({ row }) => {
        const name = row.original.name?.trim()
        // Indent nested categories so the tree depth reads at a glance (§4.1 recurses to any depth).
        const indentStyle = { paddingLeft: `${row.depth * 20}px` }

        if (!name) {
          return (
            <p className='w-full max-w-125 truncate text-muted-foreground xl:max-w-none' style={indentStyle}>
              {t(`${CATEGORY_I18N_PREFIX}.column.noName`)}
            </p>
          )
        }

        return (
          <p className='w-full max-w-125 truncate font-medium xl:max-w-none' style={indentStyle} title={name}>
            {name}
          </p>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'type',
      accessorKey: 'type',
      meta: { label: `${CATEGORY_I18N_PREFIX}.column.type` },
      header: ({ column }) => <DataTableColumnHeader column={column} label={`${CATEGORY_I18N_PREFIX}.column.type`} />,
      cell: ({ row }) => <CategoryTypeBadge type={row.original.type} t={t} />,
      enableSorting: false,
      enableHiding: true,
      size: 40
    },
    {
      id: 'window',
      accessorFn: (row) => row.startTime,
      meta: { label: `${CATEGORY_I18N_PREFIX}.column.window` },
      header: ({ column }) => <DataTableColumnHeader column={column} label={`${CATEGORY_I18N_PREFIX}.column.window`} />,
      cell: ({ row }) => <CategoryWindow category={row.original} t={t} />,
      enableSorting: false,
      enableHiding: true,
      size: 60
    },
    {
      id: 'status',
      accessorKey: 'isActive',
      meta: { label: `${CATEGORY_I18N_PREFIX}.column.status` },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={`${CATEGORY_I18N_PREFIX}.column.status`} className='mx-auto' />
      ),
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <CategoryStatusBadge isActive={row.original.isActive} t={t} />
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
      size: 40
    },
    {
      id: 'productCount',
      accessorKey: 'productCount',
      meta: { label: `${CATEGORY_I18N_PREFIX}.column.productCount` },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={`${CATEGORY_I18N_PREFIX}.column.productCount`}
          className='mx-auto'
        />
      ),
      cell: ({ row }) => {
        // productCount is only populated by the detail endpoint, not the list (§4.1) — hide when unknown.
        const count = row.original.productCount
        return <p className='text-center text-sm tabular-nums text-muted-foreground'>{count == null ? '—' : count}</p>
      },
      enableSorting: false,
      enableHiding: true,
      size: 40
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className='flex justify-end pr-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 rounded-lg p-0'>
                <span className='sr-only'>{t(`${CATEGORY_I18N_PREFIX}.action.openMenu`)}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{t(`${CATEGORY_I18N_PREFIX}.action.actions`)}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onManageProducts(row.original)}>
                {t(`${CATEGORY_I18N_PREFIX}.action.manageProducts`)}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isUpdatingCategory} onClick={() => onUpdateCategory(row.original)}>
                {t(`${CATEGORY_I18N_PREFIX}.action.update`)}
              </DropdownMenuItem>
              <DropdownMenuItem
                className='focus:text-destructive'
                disabled={isDeletingCategory}
                onClick={() => onDeleteCategory(row.original)}
              >
                {t(`${CATEGORY_I18N_PREFIX}.action.delete`)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      size: 30
    }
  ]
}
