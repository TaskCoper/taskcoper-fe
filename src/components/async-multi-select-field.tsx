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
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/shared/utils'
import { CheckIcon, ChevronsUpDown, SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { type Control, Controller, type FieldValues, type Path, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

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
  onChange: customOnChange
}: MultiSelectComboboxFieldProps<TForm, TValue, TData>) {
  const { t } = useTranslation()
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

          setOpen(false)
          onSearchChange('')
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
          setOpen,
          getId,
          getLabel,
          renderOption
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
                  className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
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
                      <DrawerDescription>Search...</DrawerDescription>
                    </DrawerHeader>
                    <ComboboxList {...listProps} />
                  </div>
                </DrawerContent>
              </Drawer>
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
  setOpen: (open: boolean) => void
  getId: (item: TData) => string
  getLabel: (item: TData) => string
  renderOption: (item: TData) => React.ReactNode
}

function ComboboxList<TData>({
  items,
  selectedIds,
  isLoading,
  onSelect,
  onSearchChange,
  searchValue,
  setOpen,
  getId,
  getLabel,
  renderOption
}: ComboboxListProps<TData>) {
  const { t } = useTranslation()

  const handleSelect = (item: TData) => {
    onSelect(item)
    setOpen(false)
    onSearchChange('')
  }

  return (
    <Command shouldFilter={false} className='w-full'>
      <CommandInput
        placeholder={t('common.ui.search')}
        value={searchValue}
        onValueChange={onSearchChange}
        className='h-9'
      />
      <CommandList className={items.length > 0 ? 'border-t' : ''}>
        {!isLoading && items.length > 0 && (
          <CommandGroup>
            {items.map((item) => {
              const id = getId(item)
              const isSelected = selectedIds.includes(id)
              return (
                <CommandItem
                  key={id}
                  value={getLabel(item)}
                  onSelect={() => handleSelect(item)}
                  className='cursor-pointer gap-3'
                >
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
      </CommandList>
    </Command>
  )
}
