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
import { cn, getAvatarFallback } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import {
  BanIcon,
  BriefcaseIcon,
  CircleCheckBigIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  SearchIcon,
  UsersIcon
} from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import {
  EmploymentType,
  EmploymentTypeLabel,
  JobDescriptionStatus,
  JobDescriptionStatusLabel,
  type JobDescription
} from '../types'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
})

const formatMoney = (value: number) => moneyFormatter.format(value)

const formatSalary = (
  t: TenantT,
  salaryMin: number | null | undefined,
  salaryMax: number | null | undefined,
  salaryNegotiable: boolean | undefined
): string => {
  if (salaryNegotiable) return t('recruitment.jobs.salary.negotiable')

  const min = salaryMin ?? 0
  const max = salaryMax ?? 0

  if (min > 0 && max > 0) return `${formatMoney(min)} - ${formatMoney(max)}`
  if (min > 0) return t('recruitment.jobs.salary.from', { amount: formatMoney(min) })
  if (max > 0) return t('recruitment.jobs.salary.upTo', { amount: formatMoney(max) })

  return t('recruitment.jobs.salary.undisclosed')
}

export const getColumns = ({
  t,
  onDeleteJob
}: {
  t: TenantT
  onDeleteJob?: (id: string, title: string) => void
}): ColumnDef<JobDescription>[] => {
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
      id: 'title',
      accessorKey: 'title',
      meta: {
        label: 'recruitment.jobs.column.title',
        placeholder: 'recruitment.jobs.column.enterTitle',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='recruitment.jobs.column.title' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Avatar className='rounded-lg size-8 ring-1 ring-border'>
            <AvatarImage src={row.original.avatarUrl ?? undefined} />
            <AvatarFallback className='rounded-lg size-8 bg-primary/10 text-primary font-semibold text-xs'>
              {getAvatarFallback(row.original.title)}
            </AvatarFallback>
          </Avatar>

          <div className='flex flex-col min-w-0 -space-y-0.5'>
            <Link to={row.original.id} className='hover:underline font-medium'>
              <p className='truncate max-w-100 xl:max-w-none'>{row.original.title}</p>
            </Link>
            <p className='text-xs text-muted-foreground truncate'>{row.original.slug}</p>
          </div>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 220
    },
    {
      id: 'location',
      accessorKey: 'location',
      meta: {
        label: 'recruitment.jobs.column.location'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='recruitment.jobs.column.location' />,
      cell: ({ row }) => {
        if (!row.original.location) {
          return <p className='text-muted-foreground'>{t('recruitment.jobs.column.noLocation')}</p>
        }

        return (
          <div className='flex items-center gap-1.5 text-sm'>
            <MapPinIcon className='size-3.5 text-muted-foreground shrink-0' />
            <p className='truncate'>{row.original.location}</p>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    {
      id: 'employmentType',
      accessorKey: 'employmentType',
      meta: {
        label: 'recruitment.jobs.column.employmentType',
        variant: 'radio',
        options: [
          {
            label: t('recruitment.jobs.employmentType.fullTime'),
            value: '0'
          },
          {
            label: t('recruitment.jobs.employmentType.partTime'),
            value: '1'
          }
        ]
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='recruitment.jobs.column.employmentType' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const type = row.original.employmentType
        const isFullTime = type === EmploymentType.fullTime

        return (
          <div className='flex justify-center'>
            <Badge
              variant='outline'
              className={cn(
                'gap-1',
                isFullTime ? 'text-purple-700 bg-purple-50 border-purple-200' : 'text-sky-700 bg-sky-50 border-sky-200'
              )}
            >
              <BriefcaseIcon className='size-3' />
              {t(EmploymentTypeLabel[type])}
            </Badge>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 110
    },
    {
      id: 'salary',
      accessorFn: (row) => `${row.salaryMin}-${row.salaryMax}`,
      meta: {
        label: 'recruitment.jobs.column.salary'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='recruitment.jobs.column.salary' />,
      cell: ({ row }) => {
        const { salaryMin, salaryMax, salaryNegotiable } = row.original
        return <p className='font-medium'>{formatSalary(t, salaryMin, salaryMax, salaryNegotiable)}</p>
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 180
    },
    {
      id: 'openings',
      accessorKey: 'openings',
      meta: {
        label: 'recruitment.jobs.column.openings'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='recruitment.jobs.column.openings' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <div className='flex items-center gap-1.5 rounded-md bg-primary/15 px-2 py-0.5'>
            <UsersIcon className='size-3 text-primary' />
            <p className='font-semibold text-primary'>{row.original.openings}</p>
          </div>
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 90
    },
    {
      id: 'status',
      accessorKey: 'status',
      meta: {
        label: 'recruitment.jobs.column.status',
        variant: 'radio',
        options: [
          {
            label: t('recruitment.jobs.status.open'),
            value: '0'
          },
          {
            label: t('recruitment.jobs.status.closed'),
            value: '1'
          }
        ]
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='recruitment.jobs.column.status' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        const isOpen = status === JobDescriptionStatus.open

        return (
          <div className='flex justify-center'>
            <Badge
              variant='outline'
              className={cn(
                'gap-1',
                isOpen
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              )}
            >
              {isOpen ? (
                <CircleCheckBigIcon className='size-3 text-emerald-500' />
              ) : (
                <BanIcon className='size-3 text-rose-500' />
              )}
              {t(JobDescriptionStatusLabel[status])}
            </Badge>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 110
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { id, title } = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <span className='sr-only'>{t('recruitment.jobs.actions.openMenu')}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{t('recruitment.jobs.actions.actions')}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={async () => {
                  const jobUrl = new URL(id, window.location.href).toString()

                  try {
                    await navigator.clipboard.writeText(jobUrl)
                    toast.success(t('recruitment.jobs.copyLink.success'), {
                      description: t('recruitment.jobs.copyLink.successDescription')
                    })
                  } catch {
                    toast.error(t('recruitment.jobs.copyLink.error'), {
                      description: t('recruitment.jobs.copyLink.errorDescription')
                    })
                  }
                }}
              >
                {t('recruitment.jobs.actions.copyLink')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={id}>{t('recruitment.jobs.actions.viewDetails')}</Link>
              </DropdownMenuItem>
              {onDeleteJob ? (
                <DropdownMenuItem className='focus:text-destructive' onClick={() => onDeleteJob(id, title)}>
                  {t('recruitment.jobs.actions.delete')}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40
    }
  ]
}
