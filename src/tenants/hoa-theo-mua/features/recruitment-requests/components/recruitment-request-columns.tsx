import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { getAvatarFallback } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { BriefcaseIcon, MailIcon, MoreHorizontalIcon, PhoneIcon } from 'lucide-react'
import { Link } from 'react-router'
import type { RecruitmentRequest } from '../types'

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

export const getColumns = ({ t }: { t: TenantT }): ColumnDef<RecruitmentRequest>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label={t('systemUsers.column.selectAll')}
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={t('systemUsers.column.selectRow')}
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
      id: 'applicant',
      accessorFn: (row) => row.user.fullName,
      meta: {
        label: 'recruitment.applicants.column.applicant'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='recruitment.applicants.column.applicant' />,
      cell: ({ row }) => {
        const { fullName, email, avatar } = row.original.user
        const isRead = row.original.isRead

        return (
          <div className='flex items-center gap-3'>
            <div className='relative shrink-0'>
              <Avatar className='rounded-lg size-8 ring-1 ring-border'>
                <AvatarImage src={avatar ?? undefined} />
                <AvatarFallback className='rounded-lg size-8 bg-primary/10 text-primary font-semibold text-xs'>
                  {getAvatarFallback(fullName)}
                </AvatarFallback>
              </Avatar>
              {!isRead && (
                <span className='absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-400 ring-2 ring-background' />
              )}
            </div>

            <div className='flex flex-col min-w-0 -space-y-0.5'>
              <p className={`truncate max-w-48 xl:max-w-none ${isRead ? 'font-medium' : 'font-semibold'}`}>
                {fullName}
              </p>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <MailIcon className='size-3 shrink-0' />
                <p className='truncate'>{email}</p>
              </div>
            </div>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 220
    },
    {
      id: 'jobDescription',
      accessorFn: (row) => row.jobDescription.title,
      meta: {
        label: 'recruitment.applicants.column.jobPosting'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='recruitment.applicants.column.jobPosting' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-1.5 text-sm'>
          <BriefcaseIcon className='size-3.5 text-muted-foreground shrink-0' />
          <p className='truncate max-w-40'>{row.original.jobDescription.title}</p>
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 180
    },
    {
      id: 'phone',
      accessorFn: (row) => row.user.phoneNumber ?? '',
      meta: {
        label: 'recruitment.applicants.column.phone'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='recruitment.applicants.column.phone' />,
      cell: ({ row }) => {
        const phone = row.original.user.phoneNumber

        if (!phone) {
          return <p className='text-muted-foreground text-sm'>{t('recruitment.applicants.column.noPhone')}</p>
        }

        return (
          <div className='flex items-center gap-1.5 text-sm'>
            <PhoneIcon className='size-3.5 text-muted-foreground shrink-0' />
            <p>{phone}</p>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    {
      id: 'isRead',
      accessorKey: 'isRead',
      meta: {
        label: 'recruitment.applicants.column.status',
        variant: 'radio',
        options: [
          { label: t('recruitment.applicants.status.unread'), value: 'false' },
          { label: t('recruitment.applicants.status.read'), value: 'true' }
        ]
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='recruitment.applicants.column.status' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const isRead = row.original.isRead

        return (
          <div className='flex justify-center'>
            <Badge
              variant='outline'
              className={
                isRead
                  ? 'text-slate-600 bg-slate-50 border-slate-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200 font-semibold'
              }
            >
              {isRead ? t('recruitment.applicants.status.read') : t('recruitment.applicants.status.unread')}
            </Badge>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'appliedAt',
      accessorKey: 'createdAt',
      meta: {
        label: 'recruitment.applicants.column.appliedAt'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='recruitment.applicants.column.appliedAt' />,
      cell: ({ row }) => (
        <p className='text-sm text-muted-foreground'>{dateFormatter.format(new Date(row.original.createdAt))}</p>
      ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 110
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { id } = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <span className='sr-only'>{t('recruitment.applicants.actions.openMenu')}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{t('recruitment.applicants.actions.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={id}>{t('recruitment.applicants.actions.viewApplication')}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40
    }
  ]
}
