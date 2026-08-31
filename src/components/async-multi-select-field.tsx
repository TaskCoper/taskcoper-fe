import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CheckIcon, ChevronsUpDown, SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { type Control, Controller, type FieldValues, type Path, useFormContext } from 'react-hook-form'
import { useInView } from 'react-intersection-observer'

// TForm: whole form values
// TValue: form item that use useFieldArray
// TData: API data type
interface MultiSelectComboboxFieldProps<TForm extends FieldValues, TValue, TData> {
  name: Path<TForm>
  label?: string
  control?: Control<TForm>
  items: TData[]
  isLoading?: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  isRequired?: boolean
  placeholder?: string
  displayError?: boolean
  // Get the unique ID from data (API)
  getId: (item: TData) => string
  // Get the unique ID from form value (to check if selected)
  getValueId: (item: TValue) => string
  // Get the text label (for button text / aria-labels)
  getLabel: (item: TData) => string
  // Transform data (API) into form value
  createValue: (item: TData) => TValue
  // Render the specific look of the item in the list
  renderOption: (item: TData) => React.ReactNode
  onChange?: (value: TValue[]) => void
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  fetchNextPage?: () => void
  // Keep the dropdown open after selecting so multiple items can be picked in one go. Defaults to true (close).
  closeOnSelect?: boolean
  // When provided, render a removable badge per selected value below the trigger.
  renderSelectedLabel?: (item: TValue) => React.ReactNode
}

export default function AsyncMultiSelectField<TForm extends FieldValues, TValue, TData>({
  name,
  label,
  control: propsControl,
  items,
  isLoading,
  searchValue,
  onSearchChange,
  getId,
  getValueId,
  getLabel,
  createValue,
  renderOption,
  isRequired = false,
  placeholder = 'common.ui.selectPlaceholder',
  displayError = true,
  onChange: customOnChange,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  closeOnSelect = true,
  renderSelectedLabel
}: MultiSelectComboboxFieldProps<TForm, TValue, TData>) {
  const { t } = useTenantTranslation()
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const context = useFormContext<TForm>()
  const control = propsControl || context?.control

  if (!control) {
    throw new Error('MultiSelectComboboxField must be used within a FormProvider or passed a control prop')
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const currentValues = (Array.isArray(field.value) ? field.value : []) as TValue[]
        const selectedIds = currentValues.map((v) => getValueId(v))

        const handleSelect = (item: TData) => {
          const itemId = getId(item)
          const isSelected = selectedIds.includes(itemId)
          let newValues: TValue[]

          if (isSelected) {
            newValues = currentValues.filter((v) => getValueId(v) !== itemId)
          } else {
            const newItem = createValue(item)
            newValues = [...currentValues, newItem]
          }

          if (customOnChange) {
            customOnChange(newValues)
          } else {
            field.onChange(newValues)
          }

          if (closeOnSelect) {
            setOpen(false)
            onSearchChange('')
          }
        }

        const handleRemove = (valueId: string) => {
          const newValues = currentValues.filter((v) => getValueId(v) !== valueId)
          if (customOnChange) {
            customOnChange(newValues)
          } else {
            field.onChange(newValues)
          }
        }

        const getButtonText = () => {
          if (selectedIds.length === 0) return t(placeholder)
          return `${selectedIds.length} ${t('common.ui.selected')}`
        }

        const listProps = {
          items,
          selectedIds,
          isLoading,
          onSelect: handleSelect,
          onSearchChange,
          searchValue,
          getId,
          getLabel,
          renderOption,
          isFetchingNextPage,
          hasNextPage,
          fetchNextPage
        }

        return (
          <Field data-invalid={fieldState.invalid} className='flex flex-col gap-1'>
            {label && (
              <FieldLabel htmlFor={name} className='gap-0.5'>
                {t(label)}
                {isRequired ? (
                  <span className='text-destructive font-semibold'>*</span>
                ) : (
                  <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
                )}
              </FieldLabel>
            )}

            {isDesktop ? (
              <Popover open={open} onOpenChange={setOpen} modal>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      'w-full justify-between px-3 font-normal',
                      selectedIds.length === 0 ? 'text-muted-foreground' : '',
                      fieldState.invalid && 'border-destructive focus-visible:ring-destructive'
                    )}
                  >
                    <span className='flex items-center gap-2 truncate'>
                      <SearchIcon className='h-4 w-4 shrink-0 opacity-50' />
                      {getButtonText()}
                    </span>
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  sideOffset={8}
                  className='p-0 overflow-y-auto'
                  style={{ width: 'var(--radix-popover-trigger-width)' }}
                  align='start'
                >
                  <ComboboxList {...listProps} />
                </PopoverContent>
              </Popover>
            ) : (
              <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      'w-full justify-between px-3 font-normal',
                      selectedIds.length === 0 ? 'text-muted-foreground' : '',
                      fieldState.invalid && 'border-destructive focus-visible:ring-destructive'
                    )}
                  >
                    <span className='flex items-center gap-2 truncate'>
                      <SearchIcon className='h-4 w-4 shrink-0 opacity-50' />
                      {getButtonText()}
                    </span>
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className='min-h-72'>
                  <div className='mt-4 border-t'>
                    <DrawerHeader className='sr-only'>
                      <DrawerTitle>{t(label ?? 'common.ui.search')}</DrawerTitle>
                      <DrawerDescription>{t('common.ui.search')}</DrawerDescription>
                    </DrawerHeader>
                    <ComboboxList {...listProps} />
                  </div>
                </DrawerContent>
              </Drawer>
            )}

            {renderSelectedLabel && currentValues.length > 0 && (
              <div className='flex flex-wrap gap-1.5 pt-1'>
                {currentValues.map((item) => {
                  const valueId = getValueId(item)
                  return (
                    <Badge key={valueId} variant='secondary' className='max-w-full gap-1 py-1 pr-1 pl-2 font-normal'>
                      <span className='truncate'>{renderSelectedLabel(item)}</span>
                      <button
                        type='button'
                        onClick={() => handleRemove(valueId)}
                        aria-label={t('common.ui.remove')}
                        className='shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground'
                      >
                        <XIcon className='size-3' />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}

            {displayError && (
              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            )}
          </Field>
        )
      }}
    />
  )
}

interface ComboboxListProps<TData> {
  items: TData[]
  selectedIds: string[]
  isLoading?: boolean
  onSelect: (item: TData) => void
  onSearchChange: (value: string) => void
  searchValue: string
  getId: (item: TData) => string
  renderOption: (item: TData) => React.ReactNode
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  fetchNextPage?: () => void
}

function ComboboxList<TData>({
  items,
  selectedIds,
  isLoading,
  onSelect,
  onSearchChange,
  searchValue,
  getId,
  renderOption,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage
}: ComboboxListProps<TData>) {
  const { t } = useTenantTranslation()
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage?.()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <Command shouldFilter={false} className='w-full'>
      <CommandInput
        placeholder={t('common.ui.search')}
        value={searchValue}
        onValueChange={onSearchChange}
        className='h-9'
      />
      <CommandList className='border-t'>
        {isLoading && (
          <div className='flex items-center justify-center gap-1.5 py-6 text-sm text-muted-foreground'>
            <Spinner className='size-4' />
            {t('common.ui.loading')}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <p className='py-6 text-center text-sm text-muted-foreground'>{t('common.ui.infiniteSelect.noResults')}</p>
        )}

        {!isLoading && items.length > 0 && (
          <CommandGroup>
            {items.map((item) => {
              const id = getId(item)
              const isSelected = selectedIds.includes(id)
              return (
                <CommandItem key={id} value={id} onSelect={() => onSelect(item)} className='cursor-pointer gap-3'>
                  <div className='flex-1 overflow-hidden flex items-center gap-2'>{renderOption(item)}</div>

                  <CheckIcon
                    className={cn(
                      'ml-auto size-4 text-primary transition-opacity',
                      isSelected ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {hasNextPage && (
          <div className='py-1 px-2'>
            <div ref={sentinelRef} className='h-px w-full' />
            {isFetchingNextPage && (
              <div className='flex items-center justify-center py-2 gap-1.5 text-xs text-muted-foreground'>
                <Spinner className='size-3.5' />
                {t('common.ui.loading')}
              </div>
            )}
          </div>
        )}
      </CommandList>
    </Command>
  )
}
