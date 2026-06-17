import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'
import { useInView } from 'react-intersection-observer'
import { useDebouncedCallback } from 'use-debounce'
import { Spinner } from './ui/spinner'

interface InfiniteSelectProps extends Omit<React.ComponentProps<typeof Button>, 'value' | 'onChange' | 'onSearch'> {
  options?: Array<{ value: string; label: string }>
  value: string
  onChangeValue?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  onSearch?: (term: string) => void
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
}

export default function InfiniteSelect({
  options = [],
  value,
  onChangeValue,
  placeholder,
  searchPlaceholder,
  onSearch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  className,
  ...props
}: InfiniteSelectProps) {
  const { t } = useTenantTranslation()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const { ref, inView } = useInView()

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const debouncedSearch = useDebouncedCallback((val: string) => {
    onSearch?.(val)
  }, 300)

  const handleSearch = (val: string) => {
    setSearch(val)
    debouncedSearch(val)
  }

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-[200px] justify-between', className)}
          {...props}
        >
          <span className={cn('font-normal text-left truncate', !selectedOption && 'text-muted-foreground')}>
            {selectedOption ? selectedOption.label : (placeholder ?? t('common.ui.selectPlaceholder'))}
          </span>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='p-0 w-(--radix-popover-trigger-width)'>
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={handleSearch}
            placeholder={searchPlaceholder ?? t('common.ui.search')}
          />

          <CommandList className='max-h-[200px] overflow-y-auto overflow-x-hidden'>
            {isLoading && options.length === 0 && (
              <div className='py-6 text-center text-sm text-muted-foreground'>{t('common.ui.loading')}</div>
            )}

            {!isLoading && options.length === 0 && <CommandEmpty>{t('common.ui.noResults')}</CommandEmpty>}

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChangeValue?.(option.value)
                    setOpen(false)
                  }}
                >
                  <Check className={cn('size-4', value === option.value ? 'opacity-100 text-primary' : 'opacity-0')} />
                  {option.label}
                </CommandItem>
              ))}
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
