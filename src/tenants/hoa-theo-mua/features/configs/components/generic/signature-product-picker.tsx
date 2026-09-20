import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { DEFAULT_PAGE_INDEX } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { CheckIcon, ImageIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useGetProducts } from '../../../products/hooks/use-get-products'
import { type SignatureProductRef } from '../../types'

const PAGE_SIZE = 20

interface SignatureProductPickerProps {
  selectedIds: string[]
  assignedElsewhere: Set<string>
  onToggle: (product: SignatureProductRef) => void
}

export default function SignatureProductPicker({
  selectedIds,
  assignedElsewhere,
  onToggle
}: SignatureProductPickerProps) {
  const { t } = useTenantTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button type='button' variant='outline' size='sm' className='h-7.5 border-dashed text-xs'>
          <PlusIcon className='size-3.5' data-icon='inline-start' />
          {t('configsPage.signatureLanding.addProduct')}
        </Button>
      </PopoverTrigger>

      {/* Body chỉ mount khi mở, để picker của từng nhóm không tự gọi một lượt tải catalog riêng. */}
      <PopoverContent align='start' className='w-80 p-0'>
        {open && <PickerBody selectedIds={selectedIds} assignedElsewhere={assignedElsewhere} onToggle={onToggle} />}
      </PopoverContent>
    </Popover>
  )
}

function PickerBody({ selectedIds, assignedElsewhere, onToggle }: SignatureProductPickerProps) {
  const { t } = useTenantTranslation()
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search.trim(), 300)

  const { products, isGettingProducts } = useGetProducts({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined
  })

  const items = products?.value.items ?? []
  const totalCount = products?.value.totalCount ?? 0
  const hiddenCount = Math.max(0, totalCount - items.length)

  return (
    <Command shouldFilter={false}>
      <CommandInput
        value={search}
        onValueChange={setSearch}
        placeholder={t('configsPage.signatureLanding.searchPlaceholder')}
      />

      <CommandList className='max-h-64'>
        {isGettingProducts ? (
          <div className='flex items-center justify-center py-6'>
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <CommandEmpty>{t('configsPage.signatureLanding.noResults')}</CommandEmpty>
        ) : (
          <CommandGroup>
            {items.map((product) => {
              const isSelected = selectedIds.includes(product.id)
              const isTaken = !isSelected && assignedElsewhere.has(product.id)

              return (
                <CommandItem key={product.id} value={product.id} onSelect={() => onToggle(product)} className='gap-2'>
                  <CheckIcon className={cn('size-4 shrink-0', isSelected ? 'text-primary' : 'opacity-0')} />
                  <div className='size-8 shrink-0 overflow-hidden rounded-md border bg-muted'>
                    {product.coverImage ? (
                      <img src={product.coverImage} alt='' className='size-full object-cover' />
                    ) : (
                      <div className='flex size-full items-center justify-center text-muted-foreground'>
                        <ImageIcon className='size-3.5' />
                      </div>
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-xs font-medium'>{product.productName ?? product.id}</p>
                    <p className='truncate text-[0.625rem] text-muted-foreground'>
                      {isTaken
                        ? t('configsPage.signatureLanding.assignedElsewhere')
                        : (product.productCode ?? product.id)}
                    </p>
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {hiddenCount > 0 && (
          <p className='px-3 py-2 text-[0.625rem] text-muted-foreground'>
            {t('configsPage.signatureLanding.moreResults', { count: hiddenCount })}
          </p>
        )}
      </CommandList>
    </Command>
  )
}
