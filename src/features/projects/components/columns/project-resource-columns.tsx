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
import FileIcon from '@/features/projects/components/file-icon'
import { PdfPreview } from '@/features/projects/components/project-storage-preview-doc'
import { formatDate, getAvatarFallback } from '@/shared/utils'
import type { ProjectResource } from '@/types/project.type'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react'
import { Link } from 'react-router'
import { formatBytes, formatMimeType } from '../../utils'

export const getColumns = ({
  onDeleteResource,
  onDeleteProjectResource
}: {
  onDeleteResource: (resourceId: string, taskId: string) => void
  onDeleteProjectResource: (resourceId: string) => void
}): ColumnDef<ProjectResource>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          aria-label={i18next.t('projectStorage.column.selectAll')}
          className='translate-y-0.5'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={i18next.t('projectStorage.column.selectRow')}
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
        label: 'projectStorage.column.fileName',
        placeholder: 'projectStorage.column.fileNamePlaceholder',
        variant: 'text',
        icon: SearchIcon
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='projectStorage.column.fileName' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <div className='flex size-8 shrink-0 items-center justify-center rounded-md bg-muted'>
            {row.original.thumbnailUrl ? (
              <img
                src={row.original.thumbnailUrl}
                alt={row.original.name}
                className='size-full rounded-md object-cover'
              />
            ) : (
              <FileIcon mimeType={row.original.mimeType} className='size-4 text-muted-foreground' />
            )}
          </div>

          <div>
            <PdfPreview url={row.original.url} name={row.original.name} mimeType={row.original.mimeType} />
            <p className='text-xs text-muted-foreground'>{formatMimeType(row.original.mimeType)}</p>
          </div>
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
      enableColumnFilter: true,
      size: 220
    },
    {
      id: 'bytes',
      accessorKey: 'bytes',
      meta: {
        label: 'projectStorage.column.fileSize'
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='projectStorage.column.fileSize' className='mx-auto' />
      ),
      cell: ({ row }) => {
        const bytes = row.original.bytes
        if (!bytes) return <p className='text-muted-foreground'>{i18next.t('projectStorage.column.noBytes')}</p>

        return <p className='text-center'>{formatBytes(bytes)}</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: false,
      maxSize: 150
    },
    {
      id: 'task',
      accessorFn: (row) => row.task?.name,
      meta: {
        label: 'projectStorage.column.task'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='projectStorage.column.task' />,
      cell: ({ row }) => {
        const task = row.original.task
        if (!task) return <p className='text-muted-foreground'>{i18next.t('projectStorage.column.noTask')}</p>

        return (
          <Link to={`${task.parentMilestoneId}/tasks/${task.id}`} className='text-sm hover:underline'>
            <p className='w-full truncate max-w-[500px] xl:max-w-none'>{task.name}</p>
          </Link>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false
    },
    {
      id: 'milestone',
      accessorFn: (row) => row.task?.milestoneName,
      meta: {
        label: 'projectStorage.column.milestone'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='projectStorage.column.milestone' />,
      cell: ({ row }) => {
        const task = row.original.task
        if (!task || !task.milestoneName)
          return <p className='text-muted-foreground'>{i18next.t('projectStorage.column.noMilestone')}</p>

        return <p className='text-sm truncate'>{task.milestoneName}</p>
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 80
    },
    {
      id: 'uploadBy',
      accessorFn: (row) => `${row.uploadBy.firstName} ${row.uploadBy.lastName}`,
      meta: {
        label: 'projectStorage.column.uploadedBy'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='projectStorage.column.uploadedBy' />,
      cell: ({ row }) => {
        const uploader = row.original.uploadBy

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='size-6 ring-2 ring-primary ring-offset-2'>
              <AvatarImage src={uploader.avatar || undefined} />
              <AvatarFallback className='text-[10px]'>
                {getAvatarFallback(`${uploader.firstName} ${uploader.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className='-space-y-0.5'>
              <p className='font-medium'>
                {uploader.firstName} {uploader.lastName}
              </p>
              <p className='text-xs text-muted-foreground'>{uploader.email}</p>
            </div>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
      enableColumnFilter: false,
      size: 140
    },
    {
      id: 'createdOnUtc',
      accessorKey: 'createdOnUtc',
      meta: {
        label: 'projectStorage.column.uploadedAt',
        variant: 'dateRange'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='projectStorage.column.uploadedAt' />,
      cell: ({ row }) => {
        const value = row.getValue('createdOnUtc')
        if (!value) return <p className='text-muted-foreground'>-</p>
        return <p className='text-sm'>{formatDate(value as string)}</p>
      },
      enableSorting: true,
      enableHiding: true,
      enableColumnFilter: true,
      size: 100
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const { id, url, name, task } = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='size-8 p-0'>
                <span className='sr-only'>{i18next.t('projectStorage.actions.openMenu')}</span>
                <MoreHorizontalIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>{i18next.t('projectStorage.actions.actions')}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <a href={url} download={name} target='_blank' rel='noreferrer'>
                  {i18next.t('projectStorage.actions.download')}
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='focus:text-destructive'
                onClick={() => (task ? onDeleteResource(id, task.id) : onDeleteProjectResource(id))}
              >
                {i18next.t('projectStorage.actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40
    },
    {
      id: 'mimeType',
      accessorKey: 'mimeType',
      meta: {
        label: 'projectStorage.column.fileType',
        variant: 'multiSelect'
      },
      header: () => null,
      cell: () => null,
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: true,
      size: 0
    },
    {
      id: 'memberId',
      accessorKey: 'uploadBy.userId',
      meta: {
        label: 'projectStorage.column.uploadedBy',
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
