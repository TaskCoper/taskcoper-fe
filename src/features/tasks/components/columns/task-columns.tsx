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
import { type TaskMember, type TaskRow } from '@/types/task.type'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import i18next from 'i18next'
import {
  CircleCheckBigIcon,
  EyeIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  SearchIcon,
  StarIcon
} from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { getTaskPriorityIcon } from '../../constants'
import StatusCell from './status-cell'

export const getColumns = ({
  projectIdentifier,
  parentMilestoneIdentifier,
  onDeleteTask,
  userId,
  searchParams,
  taskDetailBasePath,
  enableMemberFilter = true,
  canToggleStatus = true,
  canDelete = true
}: {
  projectIdentifier: string
  parentMilestoneIdentifier?: string
  onDeleteTask: (taskId: string, taskName: string) => void
  userId?: string
  searchParams?: string
  taskDetailBasePath?: string
  enableMemberFilter?: boolean
  canToggleStatus?: boolean
  canDelete?: boolean
}): ColumnDef<TaskRow>[] => {
  const buildTaskPath = (taskId: string) => {
    if (taskDetailBasePath) {
      const basePath = taskDetailBasePath.endsWith('/') ? taskDetailBasePath.slice(0, -1) : taskDetailBasePath
      return `${basePath}/${taskId}${searchParams ?? '?mode=table'}`
    }

    return `tasks/${taskId}${searchParams ?? '?mode=table'}`
  }

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
        label: 'task.column.card',
        placeholder: 'task.column.enterCardName',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='task.column.card' />,
      cell: ({ row }) => (
        <Link
          to={buildTaskPath(row.original.id)}
          className={cn(
            'hover:underline',
            row.original.isCompleted ? 'line-through decoration-foreground/40 text-muted-foreground' : ''
          )}
        >
          <p className='w-full truncate max-w-125 xl:max-w-none'>{row.original.name}</p>
        </Link>
      ),
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 150
    },
    {
      id: 'isCompleted',
      accessorKey: 'isCompleted',
      meta: {
        label: 'task.column.status',
        variant: 'radio'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='task.column.status' className='mx-auto' />,
      cell: ({ row }) => (
        <StatusCell
          row={row.original}
          projectIdentifier={projectIdentifier}
          parentMilestoneIdentifier={parentMilestoneIdentifier}
          canToggleStatus={canToggleStatus}
        />
      ),
      enableColumnFilter: true,
      enableSorting: false,
      enableHiding: true,
      size: 30
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      meta: {
        label: 'task.column.priority',
        variant: 'multiSelect'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='task.column.priority' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <div className='flex justify-center'>
          {row.original.priority ? (
            getTaskPriorityIcon('size-5')[row.original.priority]
          ) : (
            <p className='text-muted-foreground'>{i18next.t('task.column.none')}</p>
          )}
        </div>
      ),
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 40
    },
    {
      id: 'isWatchingTask',
      accessorFn: (row) => row.members.some((m) => !m.isMemberInTask && m.userId === userId),
      meta: { label: 'task.column.watching', variant: 'radio' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='task.column.watching' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const isWatching = row.original.members.some((m) => !m.isMemberInTask && m.userId === userId)
        if (!isWatching) return null

        return (
          <div className='flex justify-center'>
            <EyeIcon className='size-4' />
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 30
    },
    {
      id: 'milestone',
      accessorKey: 'milestone.id',
      meta: {
        label: 'task.column.list',
        variant: 'multiSelect'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='task.column.list' />,
      cell: ({ row }) => <p>{row.original.milestone.name}</p>,
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'labels',
      accessorKey: 'taskLabels',
      meta: {
        label: 'task.column.labels',
        variant: 'multiSelect'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='task.column.labels' />,
      cell: ({ row }) => {
        if (row.original.taskLabels.length === 0)
          return <p className='text-muted-foreground'>{i18next.t('task.column.noLabels')}</p>

        return (
          <div className='flex items-center gap-1'>
            {row.original.taskLabels.map((label) => (
              <div key={label.id} className={cn('rounded-sm px-2 py-0.5', label.color)}>
                <p className={cn('text-xs font-medium', getColorTextClass(label.color))}>{label.name}</p>
              </div>
            ))}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: true,
      size: 220
    },
    {
      id: 'estimatedPoints',
      accessorKey: 'estimatedPoints',
      meta: {
        label: 'task.column.taskPoints'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='task.column.taskPoints' className='mx-auto' />
      ),
      cell: ({ row }) => {
        if (row.original.estimatedPoints) {
          return (
            <div className='flex justify-center'>
              <div className='flex justify-center items-center gap-1.5 rounded-md bg-primary/15 px-2 py-0.5'>
                <StarIcon className='size-3 text-primary' />
                <p className='font-semibold text-primary'>{row.original.estimatedPoints}</p>
              </div>
            </div>
          )
        }

        return <p className='text-muted-foreground text-center'>{i18next.t('task.column.none')}</p>
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
        const members = (row.getValue('members') as TaskMember[]).filter((m) => m.isMemberInTask)
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
      meta: { label: 'task.column.stats' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='task.column.stats' className='mx-auto' />,
      cell: ({ row }) => (
        <div className='flex justify-center items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex justify-center items-center gap-1 cursor-help w-10'>
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
              <div className='flex justify-center items-center gap-1 cursor-help w-10'>
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
              <div className='flex justify-center items-center gap-1 cursor-help w-10'>
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
      meta: { label: 'task.column.startDate', variant: 'dateRange' },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='task.column.startDate' className='mx-auto' />
      ),
      cell: ({ row }) => {
        if (row.original.startDate) {
          return (
            <p className='text-center'>
              {format(new Date(row.original.startDate), i18next.t('task.detail.dateFormat'), { locale: vi })}
            </p>
          )
        }

        return <p className='text-center text-muted-foreground'>{i18next.t('task.column.notStarted')}</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'endDate',
      accessorKey: 'endDate',
      meta: { label: 'task.column.dueDate', variant: 'dateRange' },
      header: ({ column }) => <DataTableColumnHeader column={column} label='task.column.dueDate' className='mx-auto' />,
      cell: ({ row }) => {
        if (row.original.endDate) {
          return (
            <p className='text-center'>
              {format(new Date(row.original.endDate), i18next.t('task.detail.dateFormat'), { locale: vi })}
            </p>
          )
        }

        return <p className='text-center text-muted-foreground'>{i18next.t('task.column.noDueDate')}</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 80
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { id, name } = row.original

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
                  const taskUrl = new URL(buildTaskPath(id), window.location.href).toString()

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
                <Link to={buildTaskPath(id)}>{i18next.t('task.column.viewDetails')}</Link>
              </DropdownMenuItem>
              {canDelete ? (
                <DropdownMenuItem className='focus:text-destructive' onClick={() => onDeleteTask(id, name)}>
                  {i18next.t('task.column.delete')}
                </DropdownMenuItem>
              ) : null}
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
        label: 'task.column.members',
        variant: 'multiSelect'
      },
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: enableMemberFilter,
      size: 0
    }
  ]
}
