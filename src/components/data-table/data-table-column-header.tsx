import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import type { Column } from '@tanstack/react-table'
import { ChevronDown, ChevronsUpDown, ChevronUp, CircleHelp, EyeOff, X } from 'lucide-react'

interface DataTableColumnHeaderProps<TData, TValue> extends React.ComponentProps<typeof DropdownMenuTrigger> {
  column: Column<TData, TValue>
  label: string
  /** Optional i18n key for a help tooltip rendered as a `?` icon next to the label. */
  tooltip?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  label,
  tooltip,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { t } = useTenantTranslation()

  const tooltipIcon = tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role='button'
          tabIndex={0}
          aria-label={t(tooltip)}
          // Sits inside the trigger button — stop clicks/keys from also toggling the sort/hide menu.
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className='inline-flex cursor-help text-muted-foreground/60 hover:text-muted-foreground'
        >
          <CircleHelp className='size-3.5' />
        </span>
      </TooltipTrigger>
      <TooltipContent className='max-w-60 text-center font-normal'>{t(tooltip)}</TooltipContent>
    </Tooltip>
  ) : null

  if (!column.getCanSort() && !column.getCanHide()) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {t(label)}
        {tooltipIcon}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          '-ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring data-[state=open]:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
          className
        )}
        {...props}
      >
        {t(label)}
        {column.getCanSort() &&
          (column.getIsSorted() === 'desc' ? (
            <ChevronDown />
          ) : column.getIsSorted() === 'asc' ? (
            <ChevronUp />
          ) : (
            <ChevronsUpDown />
          ))}
        {tooltipIcon}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='min-w-28'>
        {column.getCanSort() && (
          <>
            <DropdownMenuCheckboxItem
              className='relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground'
              checked={column.getIsSorted() === 'asc'}
              onClick={() => column.toggleSorting(false)}
            >
              <ChevronUp />
              {t('dataTable.column.asc')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              className='relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground'
              checked={column.getIsSorted() === 'desc'}
              onClick={() => column.toggleSorting(true)}
            >
              <ChevronDown />
              {t('dataTable.column.desc')}
            </DropdownMenuCheckboxItem>
            {column.getIsSorted() && (
              <DropdownMenuItem className='pl-2 [&_svg]:text-muted-foreground' onClick={() => column.clearSorting()}>
                <X />
                {t('dataTable.column.reset')}
              </DropdownMenuItem>
            )}
          </>
        )}
        {column.getCanHide() && (
          <DropdownMenuCheckboxItem
            className='relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground'
            checked={!column.getIsVisible()}
            onClick={() => column.toggleVisibility(false)}
          >
            <EyeOff />
            {t('dataTable.column.hide')}
          </DropdownMenuCheckboxItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
