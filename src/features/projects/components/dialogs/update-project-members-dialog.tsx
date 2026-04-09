import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuthStore, type UserPayload } from '@/lib/zustand/auth.store'
import { useConfirmStore } from '@/lib/zustand/confirm.store'
import type { ProjectMember } from '@/types/project.type'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { EditIcon, EyeIcon, Trash2Icon, UserCircleIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteMember } from '../../hooks/use-delete-member'
import { useGetProjectMembers } from '../../hooks/use-get-project-members'
import { useToggleEditor } from '../../hooks/use-toggle-editor'

interface UpdateProjectMembersDialogProps {
  identifier: string
  isCurrentUserMain: boolean
  children: React.ReactNode
}

const getColumns = ({
  user,
  isCurrentUserMain,
  t,
  identifier,
  onToggleEditor,
  isTogglingEditor,
  onDeleteMember,
  isDeletingMember
}: {
  user: UserPayload | null
  isCurrentUserMain: boolean
  t: TFunction
  identifier: string
  onToggleEditor: ({ userId, isEditor, identifier }: { userId: string; isEditor: boolean; identifier: string }) => void
  isTogglingEditor: boolean
  onDeleteMember: ({ userId, identifier }: { userId: string; identifier: string }) => void
  isDeletingMember: boolean
}): ColumnDef<ProjectMember>[] => {
  const columns: ColumnDef<ProjectMember>[] = [
    {
      id: 'index',
      cell: ({ row }) => <p className='text-center text-sm text-muted-foreground'>{row.index + 1}</p>,
      size: 20
    },
    {
      id: 'member',
      header: t('project.updateProjectMembers.column.member'),
      accessorFn: (row) => `${row.fullName} - ${row.email}`,
      cell: ({ row }) => {
        return (
          <div>
            <p className='font-medium'>
              {row.original.fullName}{' '}
              {user?.UserId === row.original.userId ? (
                <span className='text-xs text-muted-foreground'>({t('common.ui.me')})</span>
              ) : null}
            </p>
            <p className='text-xs text-muted-foreground'>{row.original.email}</p>
          </div>
        )
      }
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: () => <p className='text-center'>{t('project.updateProjectMembers.column.role')}</p>,
      cell: ({ row }) => {
        switch (row.original.role) {
          case 1:
            return (
              <div className='flex justify-center'>
                <Badge className='rounded-sm'>
                  <UserCircleIcon className='mr-0.5' />
                  {t('project.updateProjectMembers.role.mentor')}
                </Badge>
              </div>
            )
          default:
            return (
              <div className='flex justify-center'>
                <Badge variant='outline' className='rounded-sm'>
                  <UserCircleIcon className='mr-0.5' />
                  {t('project.updateProjectMembers.role.student')}
                </Badge>
              </div>
            )
        }
      },
      size: 20
    },
    {
      id: 'permission',
      header: () => {
        if (isCurrentUserMain) {
          return <p className='text-center'>{t('project.updateProjectMembers.column.canEdit')}</p>
        }

        return <p className='text-center'>{t('project.updateProjectMembers.column.permission')}</p>
      },
      cell: ({ row }) => {
        if (isCurrentUserMain) {
          return (
            <div className='flex justify-center'>
              <Switch
                checked={row.original.isEditor}
                onCheckedChange={(checked) =>
                  onToggleEditor({ userId: row.original.userId, isEditor: checked, identifier })
                }
                disabled={isTogglingEditor}
              />
            </div>
          )
        }

        return (
          <div className='flex justify-center'>
            <span className='text-sm text-muted-foreground'>
              {row.original.isEditor ? <EditIcon className='size-4' /> : <EyeIcon className='size-4' />}
            </span>
          </div>
        )
      }
    }
  ]

  if (isCurrentUserMain) {
    columns.push({
      id: 'actions',
      cell: ({ row }) => {
        if (row.original.userId !== user?.UserId) {
          return (
            <div className='flex justify-center'>
              <Button
                variant='link'
                size='icon-sm'
                onClick={async () => {
                  const ok = await useConfirmStore.getState().confirm({
                    title: t('project.updateProjectMembers.confirm.title'),
                    description: t('project.updateProjectMembers.confirm.description', {
                      fullName: row.original.fullName
                    }),
                    confirmText: t('project.updateProjectMembers.confirm.confirmText'),
                    cancelText: t('project.updateProjectMembers.confirm.cancelText'),
                    variant: 'destructive'
                  })

                  if (ok) {
                    onDeleteMember({ userId: row.original.userId, identifier })
                  }
                }}
                disabled={isDeletingMember}
              >
                <Trash2Icon className='text-destructive' />
              </Button>
            </div>
          )
        }
        return null
      },
      size: 20
    })
  }

  return columns
}

export default function UpdateProjectMembersDialog({
  identifier,
  isCurrentUserMain,
  children
}: UpdateProjectMembersDialogProps) {
  const [open, setOpen] = useState(false)
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const { members } = useGetProjectMembers({ identifier })
  const { toggleEditor, isTogglingEditor } = useToggleEditor({ identifier })
  const { deleteMember, isDeletingMember } = useDeleteMember({ identifier })

  const columns = useMemo(
    () =>
      getColumns({
        user,
        t,
        isCurrentUserMain,
        identifier,
        onToggleEditor: toggleEditor,
        isTogglingEditor,
        onDeleteMember: deleteMember,
        isDeletingMember
      }),
    [user, t, isCurrentUserMain, identifier, toggleEditor, isTogglingEditor, deleteMember, isDeletingMember]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: members?.value.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='min-w-3xl' position='top-center'>
        <DialogHeader>
          <DialogTitle>{t('project.updateProjectMembers.title')}</DialogTitle>
          <DialogDescription>{t('project.updateProjectMembers.description')}</DialogDescription>
        </DialogHeader>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className='bg-muted'>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={index % 2 !== 0 ? 'bg-muted/50' : ''}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    {t('common.ui.noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
