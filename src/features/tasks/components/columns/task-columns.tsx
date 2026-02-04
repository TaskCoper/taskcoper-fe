import AvatarWithTooltip from '@/components/avatar-with-tooltip'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, getColorTextClass } from '@/shared/utils'
import type { TaskMember, TaskRow } from '@/types/task.type'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import i18next from 'i18next'
import {
  CircleCheckBigIcon,
  LayersIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  SearchIcon
} from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'

export const getColumns = ({
  projectId,
  parentMilestoneId
}: {
  projectId: string
  parentMilestoneId: string
}): ColumnDef<TaskRow>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label='systemUsers.column.selectAll'
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label='systemUsers.column.selectRow'
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
      accessorKey: 'projectName',
      meta: {
        label: 'Thẻ',
        placeholder: 'Nhập tên thẻ...',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='Thẻ' />,
      cell: ({ row }) => (
        <Link
          to={`tasks/${row.original.id}?view=table`}
          className={cn(
            'hover:underline',
            row.original.isCompleted ? 'line-through decoration-foreground/40 text-muted-foreground' : ''
          )}
        >
          {row.original.name}
        </Link>
      ),
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 150
    },
    {
      id: 'milestone',
      accessorKey: 'milestone.id',
      meta: {
        label: 'Danh sách',
        variant: 'multiSelect'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='Danh sách' />,
      cell: ({ row }) => <p>{row.original.milestone.name}</p>,
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'isCompleted',
      accessorKey: 'isCompleted',
      meta: {
        label: 'Trạng thái',
        variant: 'radio'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='Trạng thái' className='mx-auto' />,
      cell: ({ row }) => (
        <div className='flex justify-center items-center'>
          <Checkbox
            className='rounded-full border-foreground/40'
            checked={row.original.isCompleted}
            onCheckedChange={(value) => console.log(value)}
          />
        </div>
      ),
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: true,
      size: 30
    },
    {
      id: 'labels',
      accessorKey: 'taskLabels',
      meta: {
        label: 'Nhãn',
        variant: 'multiSelect'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='Nhãn' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-1'>
          {row.original.taskLabels.map((label) => (
            <div key={label.id} className={cn('rounded-sm px-2 py-0.5', label.color)}>
              <p className={cn('text-xs font-medium', getColorTextClass(label.color))}>{label.name}</p>
            </div>
          ))}
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 220
    },
    {
      id: 'estimatedPoints',
      accessorKey: 'estimatedPoints',
      meta: {
        label: 'Điểm công việc'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='Điểm công việc' className='mx-auto' />,
      cell: ({ row }) => {
        if (row.original.estimatedPoints) {
          return (
            <div className='flex justify-center'>
              <div className='flex justify-center items-center gap-1.5 rounded-md bg-primary/15 px-2 py-0.5'>
                <LayersIcon className='size-3 text-primary' />
                <p className='font-semibold text-primary'>{row.original.estimatedPoints}</p>
              </div>
            </div>
          )
        }

        return <p className='text-muted-foreground text-center'>Không có</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 30
    },
    {
      id: 'members',
      accessorKey: 'members',
      meta: { label: 'systemProjects.column.members' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='systemProjects.column.members' />,
      cell: ({ row }) => {
        const members = row.getValue('members') as TaskMember[]
        if (members.length === 0)
          return <p className='text-muted-foreground'>{i18next.t('systemProjects.column.noMembers')}</p>

        return (
          <div className='flex justify-start items-center -space-x-1'>
            {members.slice(0, 4).map((member) => (
              <AvatarWithTooltip
                key={member.userId}
                avatar={member.avatar}
                fullName={`${member.firstName} ${member.lastName}`}
                email={member.email}
                className='ring-2 ring-primary ring-offset-2 cursor-pointer'
              />
            ))}

            {members.length > 4 && (
              <Avatar className='size-6 ring-2 ring-primary ring-offset-2'>
                <AvatarFallback className='text-xs'>+{members.length - 4}</AvatarFallback>
              </Avatar>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 100
    },
    {
      id: 'stats',
      accessorFn: (row) =>
        `${row.totalComments} - ${row.completedSubtasks}/${row.totalSubtasks} - ${row.totalComments} - ${row.totalResources}`,
      meta: { label: 'Thông số' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='Thông số' className='mx-auto' />,
      cell: ({ row }) => (
        <div className='flex justify-center items-center gap-4'>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-1 cursor-help'>
                <MessageSquareIcon className='size-3' />
                <p className='text-xs font-semibold text-muted-foreground'>{row.original.totalComments}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{i18next.t('task.stats.comments')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-1 cursor-help'>
                <CircleCheckBigIcon className='size-3' />
                <p className='text-xs font-semibold text-muted-foreground'>
                  {row.original.completedSubtasks}/{row.original.totalSubtasks}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{i18next.t('task.stats.subtasks')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-1 cursor-help'>
                <PaperclipIcon className='size-3' />
                <p className='text-xs font-semibold text-muted-foreground'>{row.original.totalResources}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{i18next.t('task.stats.attachments')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 80
    },
    {
      id: 'startDate',
      accessorKey: 'startDate',
      meta: { label: 'Ngày bắt đầu', variant: 'dateRange' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='Ngày bắt đầu' className='mx-auto' />,
      cell: ({ row }) => {
        if (row.original.startDate) {
          return (
            <p className='text-center'>
              {format(new Date(row.original.startDate), i18next.t('task.detail.dateFormat'), { locale: vi })}
            </p>
          )
        }

        return <p className='text-center text-muted-foreground'>Chưa bắt đầu</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'endDate',
      accessorKey: 'endDate',
      meta: { label: 'Hạn hoàn thành', variant: 'dateRange' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='Hạn hoàn thành' className='mx-auto' />,
      cell: ({ row }) => {
        if (row.original.endDate) {
          return (
            <p className='text-center'>
              {format(new Date(row.original.endDate), i18next.t('task.detail.dateFormat'), { locale: vi })}
            </p>
          )
        }

        return <p className='text-center text-muted-foreground'>Chưa có hạn</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { id } = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <span className='sr-only'>{i18next.t('systemProjects.actions.openMenu')}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{i18next.t('systemProjects.actions.actions')}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={async () => {
                  const baseUrl = window.location.origin
                  const taskUrl = `${baseUrl}/projects/${projectId}/milestones/${parentMilestoneId}/tasks/${id}?view=table`

                  try {
                    await navigator.clipboard.writeText(taskUrl)
                    toast.success(i18next.t('task.copyLink.success'), {
                      description: i18next.t('task.copyLink.successDescription')
                    })
                  } catch {
                    toast.error(i18next.t('task.copyLink.error'), {
                      description: i18next.t('task.copyLink.errorDescription')
                    })
                  }
                }}
              >
                {i18next.t('task.copyLink.title')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`tasks/${id}`}>Xem thông tin</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className='focus:text-destructive'>Xóa</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 30
    },
    {
      id: 'memberId',
      accessorFn: (row) => row.members.map((d) => d.userId),
      meta: {
        label: 'Thành viên',
        variant: 'multiSelect'
      },
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 0
    }
  ]
}
