import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { Command as CommandPrimitive } from 'cmdk'
import { SearchIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useAddressAutocomplete } from '../../../hooks/use-address-autocomplete'
import { useResolveGeocodePlace } from '../../../hooks/use-resolve-geocode-place'
import type { VietmapSearchResult } from '../../../services/vietmap.service'

interface AddressAutocompleteProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  onResolve: (result: { latitude: number; longitude: number; mapId: string; ward: string; city: string }) => void
  onClear: () => void
  ward: string
  city: string
  placeholder: string
  searchingLabel: string
  emptyLabel: string
  disabled?: boolean
  invalid?: boolean
}

export default function AddressAutocomplete({
  id,
  value,
  onValueChange,
  onResolve,
  onClear,
  ward,
  city,
  placeholder,
  searchingLabel,
  emptyLabel,
  disabled,
  invalid
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const lastSelectedRef = useRef<string | null>(null)

  const [debouncedText] = useDebounce(value, 300)

  const { suggestions, isSearchingAddress } = useAddressAutocomplete({
    text: debouncedText,
    ward,
    city,
    enabled: !disabled && open
  })

  const { resolveGeocodePlace } = useResolveGeocodePlace()

  const handleValueChange = (nextValue: string) => {
    onValueChange(nextValue)
    setOpen(nextValue.trim().length >= 2)
    if (nextValue !== lastSelectedRef.current) {
      onClear()
    }
  }

  const handleSelect = async (suggestion: VietmapSearchResult) => {
    // Keep only the street/POI portion in the address line - the ward and city
    // are lifted into their own selectors via onResolve below.
    const addressLine = suggestion.name || suggestion.display
    lastSelectedRef.current = addressLine
    onValueChange(addressLine)
    setOpen(false)

    const place = await resolveGeocodePlace({ refId: suggestion.ref_id })
    onResolve({
      latitude: place.lat,
      longitude: place.lng,
      mapId: suggestion.ref_id,
      ward: place.ward,
      city: place.city
    })
  }

  return (
    <Command shouldFilter={false} className='overflow-visible bg-transparent p-0'>
      <Popover open={open && !disabled} onOpenChange={setOpen} modal>
        <PopoverAnchor asChild>
          <InputGroup className='h-9 bg-input/50'>
            <CommandPrimitive.Input
              data-slot='command-input'
              id={id}
              value={value}
              onValueChange={handleValueChange}
              onFocus={() => setOpen(!disabled && value.trim().length >= 2)}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={invalid}
              autoComplete='off'
              spellCheck={false}
              className='w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50'
            />
            <InputGroupAddon>
              <SearchIcon className='size-4 shrink-0 opacity-50' />
            </InputGroupAddon>
          </InputGroup>
        </PopoverAnchor>
        <PopoverContent
          align='start'
          sideOffset={8}
          className='w-(--radix-popover-trigger-width) overflow-hidden p-0'
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <CommandList>
            {isSearchingAddress ? (
              <div className='flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground'>
                <Spinner className='size-4' />
                {searchingLabel}
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyLabel}</CommandEmpty>
                <CommandGroup>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.ref_id}
                      value={suggestion.ref_id}
                      onSelect={() => handleSelect(suggestion)}
                    >
                      <div className='flex min-w-0 flex-col'>
                        <span className='truncate font-medium'>{suggestion.name || suggestion.display}</span>
                        {suggestion.address ? (
                          <span className='truncate text-xs text-muted-foreground'>{suggestion.address}</span>
                        ) : null}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  )
}
