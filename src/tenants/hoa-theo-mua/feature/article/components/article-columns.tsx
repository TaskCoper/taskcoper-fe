import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { formatDate } from '@/lib/date'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn, getAvatarFallback } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import { Link } from 'react-router'
import { ArticleStatus, ArticleStatusLabel, type ArticleRow } from '../types'

const ARTICLE_I18N_PREFIX = 'tenant.hoaTheoMua.articles' as const

interface GetColumnsParams {
  t: TenantT
  onDeleteArticle: (id: string) => void
  isDeletingArticle?: boolean
}

export const getColumns = ({ t, onDeleteArticle, isDeletingArticle }: GetColumnsParams): ColumnDef<ArticleRow>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label={`${ARTICLE_I18N_PREFIX}.column.selectAll`}
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`${ARTICLE_I18N_PREFIX}.column.selectRow`}
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
        label: 'tenant.hoaTheoMua.articles.column.title',
        placeholder: 'tenant.hoaTheoMua.articles.column.titlePlaceholder',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={'tenant.hoaTheoMua.articles.column.title'} />
      ),
      cell: ({ row }) => (
        <Link to={`/htm/news/${row.original.id}`} className='flex min-w-0 items-center gap-3 hover:underline'>
          <Avatar className='size-9 rounded-lg'>
            <AvatarImage src={row.original.pictureUrl ?? undefined} />
            <AvatarFallback className='rounded-lg text-xs font-medium'>
              {getAvatarFallback(row.original.title)}
            </AvatarFallback>
          </Avatar>

          <p className='w-full max-w-125 truncate font-medium xl:max-w-none'>{row.original.title}</p>
        </Link>
      ),

      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'viewCount',
      accessorKey: 'viewCount',
      meta: {
        label: 'tenant.hoaTheoMua.articles.column.viewCount'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={'tenant.hoaTheoMua.articles.column.viewCount'} />
      ),
      cell: ({ row }) => (
        <Link to={`/htm/news/detail?id=${row.original.id}`} className='hover:underline'>
          <p className='w-full max-w-125 truncate tabular-nums xl:max-w-none'>{row.original.viewCount}</p>
        </Link>
      ),

      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 30
    },
    {
      id: 'Status',
      accessorKey: 'status',
      meta: {
        label: `${ARTICLE_I18N_PREFIX}.column.status`,
        variant: 'radio',
        options: [
          {
            label: t(ArticleStatusLabel[ArticleStatus.Published]),
            value: '1'
          },
          {
            label: t(ArticleStatusLabel[ArticleStatus.Draft]),
            value: '0'
          }
        ]
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label={'tenant.hoaTheoMua.articles.column.status'} className='mx-auto' />
      ),
      cell: ({ row }) => {
        const status = row.original.status

        const statusColor = {
          [ArticleStatus.Published]: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          [ArticleStatus.Draft]: 'bg-gray-100 text-gray-800 border-gray-300'
        }[status]

        return (
          <div className='flex justify-center px-1'>
            <p className={cn('w-fit rounded-lg border px-2.5 py-1 text-xs font-medium leading-none', statusColor)}>
              {t(ArticleStatusLabel[status])}
            </p>
          </div>
        )
      },

      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 30
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',

      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={'tenant.hoaTheoMua.articles.column.createdAt'}
          className='mx-auto'
        />
      ),

      cell: ({ row }) => {
        if (row.original.createdAt) {
          return <p className='text-center text-sm tabular-nums'>{formatDate(row.original.createdAt, 'dateLong')}</p>
        }

        return <p className='text-center text-muted-foreground'>{`${ARTICLE_I18N_PREFIX}.column.noCreatedAt`}</p>
      },

      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 30
    },

    {
      id: 'actions',
      cell: ({ row }) => {
        const { id } = row.original

        return (
          <div className='flex justify-end pr-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='size-8 rounded-lg p-0'>
                  <span className='sr-only'>{t(`${ARTICLE_I18N_PREFIX}.action.openMenu`)}</span>
                  <MoreHorizontalIcon className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>{t(`${ARTICLE_I18N_PREFIX}.action.actions`)}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/htm/news/${row.original.id}`}>{t(`${ARTICLE_I18N_PREFIX}.action.viewDetails`)}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/htm/news/${row.original.id}/update`}>
                    {t(`${ARTICLE_I18N_PREFIX}.action.updateDetails`)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='focus:text-destructive'
                  disabled={isDeletingArticle}
                  onClick={() => {
                    onDeleteArticle(id)
                  }}
                >
                  {t(`${ARTICLE_I18N_PREFIX}.action.delete`)}
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
