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
import { formatDateTime } from '@/lib/date'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon
} from 'lucide-react'
import { Link } from 'react-router'
import { PublicationStatus } from '../publications/types'
import { marketingPostPlatforms, type MarketingPostListItem } from '../types'

interface GetMarketingPostColumnsParams {
  t: TenantT
  onDeleteMarketingPost: (id: string) => void
  isDeletingMarketingPost?: boolean
}

export const getMarketingPostColumns = ({
  t,
  onDeleteMarketingPost,
  isDeletingMarketingPost
}: GetMarketingPostColumnsParams): ColumnDef<MarketingPostListItem>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label={t('marketingPosts.column.selectAll')}
        className='translate-y-0.5'
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={t('marketingPosts.column.selectRow')}
        className='translate-y-0.5'
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 40
  },
  {
    id: 'expand',
    header: () => null,
    cell: ({ row }) => {
      if (!row.original.children.length) return null

      return (
        <Button
          variant='ghost'
          size='icon'
          className='size-6'
          onClick={() => row.toggleExpanded()}
          aria-label={t(
            row.getIsExpanded()
              ? 'marketingPosts.action.collapsePublications'
              : 'marketingPosts.action.showPublications'
          )}
        >
          {row.getIsExpanded() ? <ChevronDownIcon className='size-4' /> : <ChevronRightIcon className='size-4' />}
        </Button>
      )
    },
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 40
  },
  {
    id: 'title',
    accessorKey: 'title',
    meta: {
      label: 'marketingPosts.column.title',
      placeholder: 'marketingPosts.searchPlaceholder',
      variant: 'text',
      icon: SearchIcon
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='marketingPosts.column.title' />,
    // Bảng chạy table-layout auto nên `width` của cột chỉ là gợi ý: phải chặn trần ngay ở đây,
    // không thì nội dung dài kéo cả cột nở ra và mấy cột khác bị bóp lại.
    cell: ({ row }) => (
      <div className='max-w-104 min-w-64'>
        <Link to={row.original.basePostId} className='truncate text-sm font-medium hover:underline'>
          {row.original.title}
        </Link>
        <p className='mt-0.5 truncate text-xs text-muted-foreground'>{row.original.content}</p>
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 420
  },
  {
    // Mọi nền tảng của bài, đã đăng hay chưa - trạng thái từng cái xem ở bảng con. Cột này cũng là chỗ dựng ô lọc.
    id: 'platform',
    accessorFn: () => '',
    meta: {
      label: 'marketingPosts.column.platform',
      variant: 'radio',
      options: marketingPostPlatforms.map((platform) => ({
        label: t(`marketingPosts.platform.${platform}`),
        value: platform
      }))
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='marketingPosts.column.platform' />,
    cell: ({ row }) => {
      const platforms = [...new Set(row.original.children.map((child) => child.platform))]

      if (!platforms.length) return <span className='text-sm text-muted-foreground'>-</span>

      return (
        <div className='flex flex-wrap gap-1'>
          {platforms.map((platform) => (
            <Badge key={platform} variant='outline' className='font-normal'>
              {t(`marketingPosts.platform.${platform}`)}
            </Badge>
          ))}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: true,
    size: 140
  },
  {
    // Lọc theo trạng thái lần đăng. Không có ô hiển thị: một bài có thể có nhiều lần đăng
    // khác trạng thái, xem từng cái trong bảng con.
    id: 'status',
    accessorFn: () => '',
    meta: {
      label: 'marketingPosts.column.status',
      variant: 'radio',
      options: Object.values(PublicationStatus).map((status) => ({
        label: t(`marketingPosts.publication.status.${status}`),
        value: status
      }))
    },
    header: ({ column }) => <DataTableColumnHeader column={column} label='marketingPosts.column.status' />,
    cell: () => null,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: true,
    size: 140
  },
  {
    id: 'hashtag',
    accessorKey: 'hashtag',
    meta: { label: 'marketingPosts.column.hashtag' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='marketingPosts.column.hashtag' />,
    cell: ({ row }) =>
      row.original.hashtag ? (
        <p className='max-w-56 truncate text-sm text-sky-700 dark:text-sky-400'>{row.original.hashtag}</p>
      ) : (
        <span className='text-sm text-muted-foreground'>-</span>
      ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 220
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    meta: { label: 'marketingPosts.detail.field.createdAt' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='marketingPosts.detail.field.createdAt' />,
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm tabular-nums'>
        {formatDateTime(row.original.createdAt, 'dateTimeShort')}
      </span>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 150
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    meta: { label: 'marketingPosts.detail.field.updatedAt' },
    header: ({ column }) => <DataTableColumnHeader column={column} label='marketingPosts.detail.field.updatedAt' />,
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-sm tabular-nums'>
        {row.original.updatedAt ? formatDateTime(row.original.updatedAt, 'dateTimeShort') : '-'}
      </span>
    ),
    enableSorting: false,
    enableHiding: true,
    enableColumnFilter: false,
    size: 150
  },
  {
    id: 'actions',
    meta: { label: 'marketingPosts.column.actions' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label='marketingPosts.column.actions' className='justify-end' />
    ),
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='size-8 p-0'>
              <span className='sr-only'>{t('marketingPosts.action.openMenu')}</span>
              <MoreHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{t('marketingPosts.action.actions')}</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={row.original.basePostId}>
                <EyeIcon />
                {t('marketingPosts.action.viewDetail')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`${row.original.basePostId}/update`}>
                <PencilIcon />
                {t('marketingPosts.action.update')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant='destructive'
              disabled={isDeletingMarketingPost}
              onClick={() => onDeleteMarketingPost(row.original.basePostId)}
            >
              <Trash2Icon />
              {t('marketingPosts.action.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    size: 88
  }
]
