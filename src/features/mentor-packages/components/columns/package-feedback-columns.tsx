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
import { packageFeedbackQuestions } from '@/features/feedbacks/constants'
import type { Feedback } from '@/features/feedbacks/types'
import type { FeedbackMetadata } from '@/features/feedbacks/validations'
import { getAvatarFallback, safeParseJson } from '@/shared/utils'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import i18next from 'i18next'
import { MoreHorizontalIcon, Search, StarIcon } from 'lucide-react'
import { Link } from 'react-router'

export const getColumns = (_t: TFunction, onViewDetails: (feedback: Feedback) => void): ColumnDef<Feedback>[] => {
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
      id: 'author',
      meta: {
        label: 'packageFeedback.list.columns.author',
        variant: 'text',
        icon: Search,
        placeholder: 'packageFeedback.list.columns.authorPlaceholder'
      },
      accessorFn: (row) => `${row.author.firstName} ${row.author.lastName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} label='packageFeedback.list.columns.author' />,
      cell: ({ row }) => {
        const { avatarUrl, firstName, lastName, slug } = row.original.author
        const fullName = `${firstName} ${lastName}`

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='ring-2 ring-primary ring-offset-2'>
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback>{getAvatarFallback(fullName)}</AvatarFallback>
            </Avatar>

            <div>
              <Link to={`/users/${slug}`} className='font-medium hover:underline hover:text-primary'>
                {fullName}
              </Link>
              <p className='text-xs text-muted-foreground'>{row.original.author.email}</p>
            </div>
          </div>
        )
      },
      size: 200,
      enableSorting: false,
      enableColumnFilter: true
    },
    {
      accessorKey: 'rating',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label='packageFeedback.list.columns.rating' className='mx-auto' />
      ),
      cell: ({ row }) => (
        <div className='flex justify-center items-center gap-1.5'>
          <StarIcon className='size-4 fill-orange-400 text-orange-400' />
          <span className='font-medium'>{row.original.rating}</span>
        </div>
      ),
      size: 80
    },
    ...packageFeedbackQuestions.map(
      (question): ColumnDef<Feedback> => ({
        id: question.id,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label={question.labelKey || question.titleKey} className='mx-auto' />
        ),
        cell: ({ row }) => {
          const meta = safeParseJson<FeedbackMetadata>(row.original.metaData)
          const value = meta[question.id]
          if (value === undefined) return <span className='text-muted-foreground'>-</span>

          return (
            <div className='flex justify-center items-center gap-1.5'>
              <StarIcon className='size-3.5 fill-orange-300 text-orange-300' />
              <span className='text-sm'>{value}</span>
            </div>
          )
        },
        size: 120
      })
    ),
    {
      id: 'actions',
      cell: ({ row }) => {
        const feedback = row.original

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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(feedback)}>
                {i18next.t('transactions.column.viewDetails')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 50
    }
  ]
}
