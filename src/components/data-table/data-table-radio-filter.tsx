import { cn } from '@/shared/utils'
import type { Option } from '@/types/data-table.type'
import type { Column } from '@tanstack/react-table'
import { CircleIcon, PlusCircleIcon, XCircleIcon } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'

interface DataTableRadioFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: Option[]
}

export default function DataTableRadioFilter<TData, TValue>({
  column,
  title,
  options
}: DataTableRadioFilterProps<TData, TValue>) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)

  const selectedValue = column?.getFilterValue() as string | undefined
  const selectedOption = options.find((option) => option.value === selectedValue)

  const onItemSelect = React.useCallback(
    (option: Option) => {
      if (!column) return

      // If clicking the already selected option, clear the filter
      if (selectedValue === option.value) {
        column.setFilterValue(undefined)
      } else {
        column.setFilterValue(option.value)
      }
      setOpen(false)
    },
    [column, selectedValue]
  )

  const onReset = React.useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation()
      column?.setFilterValue(undefined)
    },
    [column]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='border-dashed font-normal'>
          {selectedValue ? (
            <div
              role='button'
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              className='rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              onClick={onReset}
            >
              <XCircleIcon />
            </div>
          ) : (
            <PlusCircleIcon />
          )}
          {title}
          {selectedValue && selectedOption && (
            <>
              <Separator orientation='vertical' className='mx-0.5 data-[orientation=vertical]:h-4' />
              <Badge className='rounded-sm px-1.5 font-normal'>{selectedOption.label}</Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-50 p-0' align='start'>
        <Command>
          <CommandInput placeholder={title} />
          <CommandList className='max-h-full'>
            <CommandEmpty>{t('dataTable.filter.noResultsFound')}</CommandEmpty>
            <CommandGroup className='max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden'>
              {options.map((option) => {
                const isSelected = selectedValue === option.value

                return (
                  <CommandItem key={option.value} onSelect={() => onItemSelect(option)}>
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-full border border-primary',
                        isSelected ? 'bg-primary' : 'opacity-50'
                      )}
                    >
                      {isSelected && <CircleIcon className='size-2 fill-primary-foreground text-primary-foreground' />}
                    </div>
                    {option.icon && <option.icon />}
                    <span className='truncate'>{option.label}</span>
                    {option.count !== undefined && <span className='ml-auto font-mono text-xs'>{option.count}</span>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValue && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onReset()} className='justify-center text-center'>
                    {t('dataTable.filter.clearFilter')}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
