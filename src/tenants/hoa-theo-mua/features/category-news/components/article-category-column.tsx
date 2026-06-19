import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
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
import type { I18nKey } from '@/lib/i18n/types'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontalIcon } from 'lucide-react'
import type { NewsCategoryRow } from '../type'

const ARTICLE_CATEGORY_I18N_PREFIX = 'articleCategories' as const
const tenantI18nKey = (key: string) => key as I18nKey

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

      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={tenantI18nKey(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.title`)} />
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
          <p className='w-full max-w-125 truncate font-medium xl:max-w-none' title={title}>
            {title}
          </p>
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
        label: tenantI18nKey(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.parent`)
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={tenantI18nKey(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.parent`)} />
      ),
      cell: ({ row }) => {
        const parentTitle = row.original.parent?.title?.trim()

        if (!parentTitle) {
          return <p className='text-sm text-muted-foreground'>{t(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.noParent`)}</p>
        }

        return (
          <p className='w-full max-w-80 truncate text-sm font-medium' title={parentTitle}>
            {parentTitle}
          </p>
        )
      },
      enableSorting: false,
      enableHiding: true,
      size: 30
    },
    {
      id: 'children',
      accessorKey: 'children',
      meta: {
        label: tenantI18nKey(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.children`)
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={tenantI18nKey(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.children`)}
        />
      ),
      cell: ({ row }) => {
        const children = row.original.children ?? []

        if (!children.length) {
          return (
            <p className='text-sm text-muted-foreground'>{t(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.noChildren`)}</p>
          )
        }

        return (
          <div className='flex max-w-100 flex-wrap gap-1.5'>
            {children.slice(0, 3).map((child) => (
              <Badge key={child.categoryId} variant='outline' className='max-w-full rounded-md font-normal'>
                <span className='truncate'>{child.title}</span>
              </Badge>
            ))}

            {children.length > 3 ? (
              <Badge variant='secondary' className='rounded-md'>
                +{children.length - 3}
              </Badge>
            ) : null}
          </div>
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
        label: tenantI18nKey(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.count`)
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={tenantI18nKey(`${ARTICLE_CATEGORY_I18N_PREFIX}.column.count`)}
          className='mx-auto'
        />
      ),
      cell: ({ row }) => (
        <p className='text-center text-sm tabular-nums text-muted-foreground'>{row.original.count ?? 0}</p>
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
                <Button variant='ghost' className='size-8 rounded-lg p-0'>
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
