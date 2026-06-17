import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/shared/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useInView } from 'react-intersection-observer'
import { useDebouncedCallback } from 'use-debounce'
import { Spinner } from './ui/spinner'

export default function InfiniteMultiSelect({
  options = [],
  values = [],
  onChangeValues,
  placeholder,
  searchPlaceholder,
  onSearch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  className,
  ...props
}: {
  options: Array<{ value: string; label: string }>
  values: string[]
  onChangeValues?: (values: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  onSearch?: (term: string) => void
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
} & Omit<React.ComponentProps<typeof Button>, 'value' | 'onChange' | 'onSearch'>) {
  const { t } = useTenantTranslation()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const { ref, inView } = useInView()

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const debouncedSearch = useDebouncedCallback((val) => {
    onSearch?.(val)
  }, 300)

  const handleSearch = (val: string) => {
    setSearch(val)
    debouncedSearch(val)
  }

  const handleSelect = (val: string) => {
    if (values.includes(val)) {
      onChangeValues?.(values.filter((v) => v !== val))
    } else {
      onChangeValues?.([...values, val])
    }
  }

  const selectPlaceholder = placeholder || t('common.ui.infiniteSelect.placeholder')

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'w-full grid grid-cols-[1fr_auto] items-center gap-2 whitespace-normal overflow-hidden',
            className
          )}
          {...props}
        >
          <span
            className={cn('font-normal text-left truncate min-w-0', values.length === 0 && 'text-muted-foreground')}
          >
            {values.length > 0
              ? t('common.ui.infiniteSelect.selectedCount', { count: values.length })
              : selectPlaceholder}
          </span>
          <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50 justify-self-end' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='p-0 w-(--radix-popover-trigger-width)'>
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={handleSearch}
            placeholder={searchPlaceholder ?? selectPlaceholder}
          />

          <CommandList className='max-h-50 overflow-y-auto overflow-x-hidden'>
            {isLoading && options.length === 0 && (
              <div className='py-6 text-center text-sm text-muted-foreground'>
                {t('common.ui.infiniteSelect.loading')}
              </div>
            )}

            {!isLoading && options.length === 0 && (
              <CommandEmpty>{t('common.ui.infiniteSelect.noResults')}</CommandEmpty>
            )}

            <CommandGroup>
              {options.map((option) => {
                const isSelected = values.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className='flex items-center gap-2'
                  >
                    <Check className={cn('size-4 shrink-0', isSelected ? 'opacity-100 text-primary' : 'opacity-0')} />
                    <span className='truncate min-w-0 flex-1'>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {hasNextPage && (
              <div ref={ref} className='py-2 flex justify-center w-full'>
                {isFetchingNextPage && <Spinner />}
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
