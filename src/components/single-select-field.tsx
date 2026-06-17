import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { Field, FieldError as FieldErrorComponent, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'
import { type Control, Controller, type FieldError, type FieldValues, type Path, useFormContext } from 'react-hook-form'

interface Option {
  label: string
  value: string
  meta?: Record<string, unknown>
}

interface SingleSelectFieldProps<T extends FieldValues> {
  name: Path<T>
  label?: I18nKey
  options: Option[]
  control?: Control<T>
  placeholder?: I18nKey
  searchPlaceholder?: I18nKey
  emptyMessage?: I18nKey
  disabled?: boolean
  className?: string
  modal?: boolean
  isRequired?: boolean
  value?: string
  onValueChange?: (value: string) => void
  displayError?: boolean
  triggerClassName?: string
  onChange?: (value: string) => void
}

export default function SingleSelectField<T extends FieldValues>({
  name,
  label,
  options,
  control: propsControl,
  placeholder = 'comboboxField.placeholder',
  searchPlaceholder = 'comboboxField.searchPlaceholder',
  emptyMessage = 'comboboxField.emptyMessage',
  disabled = false,
  className,
  modal = false,
  isRequired = false,
  value: propsValue,
  onValueChange,
  displayError = true,
  triggerClassName,
  onChange
}: SingleSelectFieldProps<T>) {
  const { t } = useTenantTranslation()
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const context = useFormContext<T>()
  const control = propsControl || context?.control
  const isStandalone = propsValue !== undefined && onValueChange !== undefined
  const optionMap = React.useMemo(() => new Map(options.map((option) => [option.value, option])), [options])

  if (!control && !isStandalone) {
    throw new Error(
      'SingleSelectField must be used within a FormProvider, passed a control prop, or used in standalone mode with value and onValueChange'
    )
  }

  const renderContent = (
    fieldValue: string,
    fieldOnChange: (value: string) => void,
    fieldInvalid?: boolean,
    fieldError?: FieldError,
    fieldName?: string
  ) => {
    const selectedOption = optionMap.get(fieldValue)

    const TriggerButton = (
      <Button
        variant='outline'
        role='combobox'
        aria-expanded={open}
        aria-invalid={fieldInvalid}
        disabled={disabled}
        className={cn(
          'justify-between font-normal py-2 h-8 px-2 w-full max-w-full overflow-hidden',
          !selectedOption && 'text-muted-foreground',
          fieldInvalid && 'border-destructive focus-visible:ring-destructive',
          triggerClassName
        )}
      >
        <span className='truncate'>{selectedOption?.label ?? t(placeholder)}</span>
        <ChevronsUpDown className='shrink-0 opacity-50' />
      </Button>
    )

    const handleSelect = (newValue: string) => {
      if (onChange) {
        onChange(newValue)
      } else {
        fieldOnChange(newValue)
      }
      setOpen(false)
    }

    return (
      <Field data-invalid={fieldInvalid} className={cn('gap-1', className)}>
        {label ? (
          <FieldLabel htmlFor={fieldName} className='gap-0.5'>
            {t(label)}
            {isRequired ? (
              <span className='text-destructive font-semibold'>*</span>
            ) : (
              <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
            )}
          </FieldLabel>
        ) : null}

        {isDesktop ? (
          <Popover open={open} onOpenChange={setOpen} modal={modal}>
            <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
            <PopoverContent
              sideOffset={8}
              className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
              align='start'
              style={{ width: 'var(--radix-popover-trigger-width)' }}
            >
              <SingleOptionList
                options={options}
                selectedValue={fieldValue}
                onSelect={handleSelect}
                searchPlaceholder={t(searchPlaceholder)}
                emptyMessage={t(emptyMessage)}
              />
            </PopoverContent>
          </Popover>
        ) : (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
            <DrawerContent>
              <div className='mt-4 border-t'>
                <DrawerHeader className='sr-only'>
                  <DrawerTitle>{label ? t(label) : ''}</DrawerTitle>
                  <DrawerDescription>{t(placeholder)}</DrawerDescription>
                </DrawerHeader>
                <SingleOptionList
                  options={options}
                  selectedValue={fieldValue}
                  onSelect={handleSelect}
                  searchPlaceholder={t(searchPlaceholder)}
                  emptyMessage={t(emptyMessage)}
                />
              </div>
            </DrawerContent>
          </Drawer>
        )}

        {displayError ? (
          <div className='min-h-4'>
            {fieldInvalid && fieldError && <FieldErrorComponent className='text-xs' errors={[fieldError]} />}
          </div>
        ) : null}
      </Field>
    )
  }

  if (isStandalone) {
    return renderContent(propsValue, onValueChange)
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        return renderContent(
          (field.value == null ? '' : String(field.value)) as string,
          field.onChange,
          fieldState.invalid,
          fieldState.error,
          field.name
        )
      }}
    />
  )
}

function SingleOptionList({
  options,
  selectedValue,
  onSelect,
  searchPlaceholder,
  emptyMessage
}: {
  options: Option[]
  selectedValue: string
  onSelect: (value: string) => void
  searchPlaceholder: string
  emptyMessage: string
}) {
  const ITEM_HEIGHT = 34
  const MAX_LIST_HEIGHT = 288
  const OVERSCAN = 8

  const [query, setQuery] = React.useState('')
  const deferredQuery = React.useDeferredValue(query)
  const [scrollTop, setScrollTop] = React.useState(0)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()
    if (!normalizedQuery) return options

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalizedQuery) || option.value.toLowerCase().includes(normalizedQuery)
    )
  }, [options, deferredQuery])

  const totalHeight = filteredOptions.length * ITEM_HEIGHT
  const viewportHeight = Math.min(totalHeight || ITEM_HEIGHT, MAX_LIST_HEIGHT)
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN)
  const endIndex = Math.min(filteredOptions.length, Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + OVERSCAN)
  const visibleOptions = filteredOptions.slice(startIndex, endIndex)

  React.useEffect(() => {
    setScrollTop(0)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [deferredQuery])

  return (
    <Command className='w-full' shouldFilter={false}>
      <CommandInput value={query} onValueChange={setQuery} placeholder={searchPlaceholder} className='h-9' />
      <CommandList className='max-h-none overflow-visible'>
        {filteredOptions.length === 0 ? (
          <CommandEmpty>{emptyMessage}</CommandEmpty>
        ) : (
          <div
            ref={scrollContainerRef}
            className='overflow-y-auto'
            style={{ maxHeight: MAX_LIST_HEIGHT, height: viewportHeight }}
            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          >
            <CommandGroup className='relative p-0' style={{ height: totalHeight }}>
              {visibleOptions.map((option, index) => {
                const virtualIndex = startIndex + index
                const isSelected = selectedValue === option.value

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onSelect(isSelected ? '' : option.value)
                    }}
                    style={{
                      position: 'absolute',
                      top: virtualIndex * ITEM_HEIGHT,
                      left: 0,
                      right: 0,
                      height: ITEM_HEIGHT
                    }}
                  >
                    {option.label}
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4 transition-opacity text-primary',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        )}
      </CommandList>
    </Command>
  )
}
