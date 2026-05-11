import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/utils'
import { MentorTitle, MentorTitleLabel } from '@/types/mentor-application.type'
import type { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { AwardIcon, ChevronDownIcon, ChevronRightIcon, GemIcon, ShieldIcon } from 'lucide-react'
import { type CommissionRow } from '../types'

export const getColumns = (): ColumnDef<CommissionRow>[] => {
  return [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => {
        return (
          <Button variant='ghost' size='icon-sm' className='transition-transform' onClick={() => row.toggleExpanded()}>
            {row.getIsExpanded() ? <ChevronDownIcon /> : <ChevronRightIcon className='text-muted-foreground' />}
          </Button>
        )
      },
      size: 40
    },
    {
      id: 'titleLevel',
      accessorKey: 'titleLevel',
      meta: {
        label: 'Title Level'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='commission.field.titleLevel' />,
      cell: ({ row }) => {
        const title = row.original.titleLevel
        const label = i18next.t(MentorTitleLabel[title])

        const getTitleConfig = (title: MentorTitle) => {
          switch (title) {
            case MentorTitle.BRONZE:
              return {
                icon: <ShieldIcon className='size-3' />,
                className: 'bg-amber-100 text-amber-700 border-amber-200'
              }
            case MentorTitle.SILVER:
              return {
                icon: <ShieldIcon className='size-3' />,
                className: 'bg-slate-100 text-slate-700 border-slate-200'
              }
            case MentorTitle.GOLD:
              return {
                icon: <AwardIcon className='size-3' />,
                className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
              }
            case MentorTitle.PLATINUM:
              return {
                icon: <GemIcon className='size-3' />,
                className: 'bg-teal-100 text-teal-700 border-teal-200'
              }
            // case MentorTitle.DIAMOND:
            //   return {
            //     icon: <GemIcon className='size-3' />,
            //     className: 'bg-sky-100 text-sky-700 border-sky-200'
            //   }
            // case MentorTitle.MASTER:
            //   return {
            //     icon: <ZapIcon className='size-3' />,
            //     className: 'bg-purple-100 text-purple-700 border-purple-200'
            //   }
            // case MentorTitle.GRANDMASTER:
            //   return {
            //     icon: <CrownIcon className='size-3' />,
            //     className: 'bg-pink-100 text-pink-700 border-pink-200'
            //   }
            // case MentorTitle.LEGENDARY:
            //   return {
            //     icon: <FlameIcon className='size-3' />,
            //     className: 'bg-red-100 text-red-700 border-red-200'
            //   }
            // case MentorTitle.MYTHIC:
            //   return {
            //     icon: <SparklesIcon className='size-3' />,
            //     className: 'bg-indigo-100 text-indigo-700 border-indigo-200'
            //   }
            default:
              return { icon: null, className: '' }
          }
        }

        const config = getTitleConfig(title)

        return (
          <Badge variant='secondary' className={cn('gap-1.5 px-2 py-0.5 font-semibold rounded-md', config.className)}>
            {config.icon}
            {label}
          </Badge>
        )
      },
      size: 150,
      enableSorting: false,
      enableHiding: false
    },
    {
      id: 'count',
      meta: {
        label: 'common.ui.count'
      },
      header: ({ column }) => <DataTableColumnHeader column={column} label='common.ui.count' className='mx-auto' />,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Badge variant='outline' className='font-mono rounded-md'>
            {row.original.commissions.length}
          </Badge>
        </div>
      ),
      size: 80
    }
  ]
}
