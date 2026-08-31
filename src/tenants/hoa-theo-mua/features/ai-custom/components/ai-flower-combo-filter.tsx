import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import type { Column } from '@tanstack/react-table'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon
} from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { useGetAiFlowerDesignComboOptions } from '../hooks/use-get-ai-flower-design-history'

const SEARCH_DEBOUNCE_MS = 500
const COMBO_PAGE_SIZE_OPTIONS = [5, 10, 20]
const QUERY_STATE_OPTIONS = { clearOnDefault: true, history: 'replace' as const }

const AiFlowerComboFilter = <TData,>({ column, label }: { column: Column<TData>; label: string }) => {
  const { t } = useTenantTranslation()
  const [comboSearch, setComboSearch] = useQueryState(
    'aiFlowerDesigns_comboSearch',
    parseAsString.withOptions(QUERY_STATE_OPTIONS).withDefault('')
  )
  const [comboPage, setComboPage] = useQueryState(
    'aiFlowerDesigns_comboPage',
    parseAsInteger.withOptions(QUERY_STATE_OPTIONS).withDefault(1)
  )
  const [comboPerPage, setComboPerPage] = useQueryState(
    'aiFlowerDesigns_comboPerPage',
    parseAsInteger.withOptions(QUERY_STATE_OPTIONS).withDefault(COMBO_PAGE_SIZE_OPTIONS[0])
  )
  const [searchValue, setSearchValue] = useState(comboSearch)
  const pageIndex = Math.max(1, comboPage)
  const pageSize = COMBO_PAGE_SIZE_OPTIONS.includes(comboPerPage) ? comboPerPage : COMBO_PAGE_SIZE_OPTIONS[0]
  const { comboOptionsPage, isGettingComboOptions } = useGetAiFlowerDesignComboOptions({
    pageIndex,
    pageSize,
    search: comboSearch.trim() || undefined
  })
  const comboOptions = comboOptionsPage.items
  const totalPages = Math.max(1, Math.ceil(comboOptionsPage.totalCount / comboOptionsPage.pageSize))
  const selectedValues = new Set(Array.isArray(column.getFilterValue()) ? (column.getFilterValue() as string[]) : [])
  const updateSearch = useDebouncedCallback((value: string) => {
    void setComboSearch(value.trim() || null)
    void setComboPage(1)
  }, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    setSearchValue(comboSearch)
  }, [comboSearch])

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    updateSearch(value)
  }

  const toggleCombo = (comboId: string) => {
    const nextValues = new Set(selectedValues)

    if (nextValues.has(comboId)) nextValues.delete(comboId)
    else nextValues.add(comboId)

    const values = Array.from(nextValues)
    column.setFilterValue(values.length > 0 ? values : undefined)
  }

  const clearSelection = () => column.setFilterValue(undefined)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 gap-2 px-3 font-normal'>
          <SlidersHorizontalIcon className='size-3.5 text-muted-foreground' />
          {label}
          {selectedValues.size > 0 && (
            <span className='flex min-w-5 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-semibold'>
              {selectedValues.size}
            </span>
          )}
          <ChevronDownIcon className='size-3.5 text-muted-foreground' />
        </Button>
      </PopoverTrigger>

      <PopoverContent align='start' className='w-[24rem] overflow-hidden p-0'>
        <div className='border-b px-4 py-3'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h3 className='text-sm font-semibold'>{t('aiCustom.flowerHistory.comboFilter.title')}</h3>
              <p className='text-xs text-muted-foreground'>{t('aiCustom.flowerHistory.comboFilter.description')}</p>
            </div>
            {selectedValues.size > 0 && (
              <Button variant='ghost' size='sm' className='h-7 shrink-0 px-2 text-xs' onClick={clearSelection}>
                <XIcon className='size-3.5' />
                {t('aiCustom.flowerHistory.comboFilter.clear')}
              </Button>
            )}
          </div>

          <div className='relative mt-3'>
            <SearchIcon className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={t('aiCustom.flowerHistory.comboFilter.searchPlaceholder')}
              className='h-9 pr-9 pl-9'
            />
            {isGettingComboOptions && (
              <LoaderCircleIcon className='absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground' />
            )}
          </div>
        </div>

        <div className='max-h-96 overflow-y-auto p-2'>
          {comboOptions.map((combo) => {
            const isSelected = selectedValues.has(combo.id)

            return (
              <div
                key={combo.id}
                role='option'
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => toggleCombo(combo.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    toggleCombo(combo.id)
                  }
                }}
                className='flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/60'
              >
                <Checkbox checked={isSelected} className='pointer-events-none shrink-0' />
                <img
                  src={combo.imageUrl || '/images/placeholder-cover.png'}
                  alt={combo.name}
                  className='size-11 shrink-0 rounded-lg border bg-muted/40 object-cover'
                  onError={(event) => {
                    event.currentTarget.src = '/images/placeholder-cover.png'
                  }}
                />
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-sm font-medium'>{combo.name}</span>
                  <span className='mt-0.5 block truncate font-mono text-xs text-muted-foreground'>
                    {combo.code || '-'}
                  </span>
                </span>
              </div>
            )
          })}

          {!isGettingComboOptions && comboOptions.length === 0 && (
            <div className='px-4 py-8 text-center text-sm text-muted-foreground'>
              {t('aiCustom.flowerHistory.comboFilter.empty')}
            </div>
          )}
        </div>

        <div className='flex items-center justify-between gap-3 border-t px-3 py-2.5'>
          <div className='flex min-w-0 items-center gap-2'>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                void setComboPerPage(Number(value))
                void setComboPage(1)
              }}
            >
              <SelectTrigger
                size='sm'
                className='h-7 w-16 px-2 text-xs'
                aria-label={t('aiCustom.flowerHistory.comboFilter.itemsPerPage')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align='start'>
                {COMBO_PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='truncate text-xs text-muted-foreground'>
              {t('aiCustom.flowerHistory.comboFilter.page', {
                page: comboOptionsPage.pageIndex,
                totalPages,
                totalItems: comboOptionsPage.totalCount
              })}
            </p>
          </div>
          <div className='flex items-center gap-1'>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='size-7'
              disabled={!comboOptionsPage.hasPreviousPage || isGettingComboOptions}
              onClick={() => void setComboPage(Math.max(1, pageIndex - 1))}
              aria-label={t('aiCustom.flowerHistory.comboFilter.previous')}
            >
              <ChevronLeftIcon className='size-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='size-7'
              disabled={!comboOptionsPage.hasNextPage || isGettingComboOptions}
              onClick={() => void setComboPage(pageIndex + 1)}
              aria-label={t('aiCustom.flowerHistory.comboFilter.next')}
            >
              <ChevronRightIcon className='size-4' />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default AiFlowerComboFilter
