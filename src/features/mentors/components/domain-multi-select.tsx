import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { useGetDomainsInfinite } from '@/hooks/use-get-domains-infinite'
import { cn } from '@/shared/utils'
import type { Domain } from '@/types/domain.type'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { useDebouncedCallback } from 'use-debounce'

export interface DomainMultiSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  /** Max domains shown as badges before overflow collapse */
  maxBadges?: number
}

export default function DomainMultiSelect({
  value,
  onChange,
  placeholder,
  className,
  maxBadges = 5
}: DomainMultiSelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const debouncedSearch = useDebouncedCallback((term: string) => {
    setSearch(term)
  }, 300)

  const { domains, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetDomainsInfinite({
    searchTerm: search || undefined
  })

  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 })
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const selectedDomains = React.useMemo<Domain[]>(() => {
    const loaded = new Map(domains.map((d) => [d.id, d]))
    return value.map((id) => loaded.get(id)).filter((d): d is Domain => !!d)
  }, [value, domains])

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  const remove = (id: string) => {
    onChange(value.filter((v) => v !== id))
  }

  const resolvedPlaceholder = placeholder ?? t('network.filter.domainPlaceholder')

  const triggerLabel =
    value.length === 0
      ? resolvedPlaceholder
      : value.length === 1
        ? (domains.find((d) => d.id === value[0])?.name ?? resolvedPlaceholder)
        : t('network.domainSelect.domainsSelected', { count: value.length })

  const visibleBadges = selectedDomains.slice(0, maxBadges)
  const overflowCount = selectedDomains.length - visibleBadges.length

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button variant='outline' role='combobox' aria-expanded={open} className='w-full justify-between font-normal'>
            <span className={cn('truncate', value.length === 0 && 'text-muted-foreground')}>{triggerLabel}</span>
            <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>

        <PopoverContent className='p-0 w-(--radix-popover-trigger-width)' align='start'>
          <Command shouldFilter={false}>
            <CommandInput placeholder={resolvedPlaceholder} onValueChange={(v) => debouncedSearch(v)} className='h-9' />

            <CommandList className='max-h-55 overflow-y-auto overflow-x-hidden'>
              {isLoading && domains.length === 0 && (
                <div className='flex items-center justify-center py-6 text-sm text-muted-foreground gap-2'>
                  <Spinner className='size-4' />
                  {t('network.domainSelect.loading')}
                </div>
              )}

              {!isLoading && domains.length === 0 && (
                <CommandEmpty>{t('network.domainSelect.noDomainsFound')}</CommandEmpty>
              )}

              <CommandGroup>
                {domains.map((domain) => {
                  const selected = value.includes(domain.id)
                  return (
                    <CommandItem
                      key={domain.id}
                      value={domain.name}
                      onSelect={() => toggle(domain.id)}
                      className='gap-2 cursor-pointer'
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center size-4 rounded border border-border transition-colors',
                          selected && 'bg-primary border-primary'
                        )}
                      >
                        <Check className={cn('size-3 text-primary-foreground', !selected && 'opacity-0')} />
                      </div>
                      <span className='truncate'>{domain.name}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>

              {hasNextPage && (
                <div className='py-1 px-2'>
                  <div ref={sentinelRef} className='h-px w-full' />
                  {isFetchingNextPage && (
                    <div className='flex items-center justify-center py-2 gap-1.5 text-xs text-muted-foreground'>
                      <Spinner className='size-3.5' />
                      {t('network.domainSelect.loadingMore')}
                    </div>
                  )}
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedDomains.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {visibleBadges.map((domain) => (
            <Badge
              key={domain.id}
              variant='secondary'
              className='rounded-md gap-1 pr-1 pl-2.5 py-1 text-xs font-medium max-w-45'
            >
              <span className='truncate'>{domain.name}</span>
              <button
                type='button'
                onClick={() => remove(domain.id)}
                className='ml-0.5 cursor-pointer rounded-full p-0.5 hover:bg-foreground/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                aria-label={t('network.domainSelect.removeAriaLabel', { name: domain.name })}
              >
                <X className='size-2.5' />
              </button>
            </Badge>
          ))}

          {overflowCount > 0 && (
            <Badge variant='outline' className='text-xs font-medium px-2.5 py-1 border-dashed'>
              {t('network.domainSelect.overflowMore', { count: overflowCount })}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
