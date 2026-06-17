import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { Option } from '@/types/data-table.type'
import type { Column } from '@tanstack/react-table'
import { PlusCircleIcon } from 'lucide-react'
import React from 'react'
import { Badge } from '../ui/badge'
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Separator } from '../ui/separator'
import { DataTableFilterTrigger } from './data-table-filter-trigger'

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
  const { t } = useTenantTranslation()
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
        <DataTableFilterTrigger
          hasValue={Boolean(selectedValue)}
          clearLabel={`Clear ${title} filter`}
          emptyIcon={<PlusCircleIcon />}
          onClear={onReset}
        >
          {title}
          {selectedValue && selectedOption && (
            <>
              <Separator orientation='vertical' className='mx-0.5 data-[orientation=vertical]:h-4' />
              <Badge variant='outline' className='rounded-sm px-1.5 font-normal'>
                {selectedOption.label}
              </Badge>
            </>
          )}
        </DataTableFilterTrigger>
      </PopoverTrigger>
      <PopoverContent className='w-50 p-0' align='start'>
        <Command>
          <CommandInput placeholder={title} />
          <CommandList className='max-h-full'>
            <CommandEmpty>{t('dataTable.filter.noResultsFound')}</CommandEmpty>
            <RadioGroup value={selectedValue}>
              <CommandGroup className='max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden'>
                {options.map((option) => (
                  <CommandItem key={option.value} onSelect={() => onItemSelect(option)}>
                    <RadioGroupItem value={option.value} className='pointer-events-none shrink-0' />
                    {option.icon && <option.icon />}
                    <span className='truncate'>{option.label}</span>
                    {option.count !== undefined && <span className='ml-auto font-mono text-xs'>{option.count}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </RadioGroup>
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
