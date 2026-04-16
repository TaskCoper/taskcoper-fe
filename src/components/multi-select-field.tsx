import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/shared/utils'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'
import { type Control, Controller, type FieldError, type FieldValues, type Path, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface Option {
  label: string
  value: string
  meta?: Record<string, unknown>
}

interface ComboboxMultiFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  options: Option[]
  control?: Control<T>
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  modal?: boolean
  isRequired?: boolean
  value?: string[]
  onValueChange?: (value: string[]) => void
  displayError?: boolean
  triggerClassName?: string
  badgeClassName?: string
  customBadgeRender?: (option: Option) => React.ReactNode
}

export default function MultiSelectField<T extends FieldValues>({
  name,
  label,
  options,
  control: propsControl,
  placeholder = 'comboboxMultiField.placeholder',
  searchPlaceholder = 'comboboxMultiField.searchPlaceholder',
  emptyMessage = 'comboboxMultiField.emptyMessage',
  disabled = false,
  className,
  modal = false,
  isRequired = false,
  displayError = true,
  value: propsValue,
  onValueChange,
  triggerClassName,
  badgeClassName,
  customBadgeRender
}: ComboboxMultiFieldProps<T>) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const context = useFormContext<T>()
  const control = propsControl || context?.control
  const isStandalone = propsValue !== undefined && onValueChange !== undefined

  if (!control && !isStandalone) {
    throw new Error(
      'ComboboxMultiField must be used within a FormProvider, passed a control prop, or used in standalone mode with value and onValueChange'
    )
  }

  const renderContent = (
    fieldValues: string[],
    fieldOnChange: (value: string[]) => void,
    fieldInvalid?: boolean,
    fieldError?: FieldError,
    fieldName?: string
  ) => {
    const selectedOptions = options.filter((option) => fieldValues.includes(option.value))

    const TriggerButton = (
      <Button
        variant='outline'
        role='combobox'
        aria-expanded={open}
        aria-invalid={fieldInvalid}
        disabled={disabled}
        className={cn(
          'justify-between font-normal py-2 h-8 px-1! w-fit max-w-full overflow-hidden gap-1',
          fieldValues.length === 0 && 'text-muted-foreground',
          fieldInvalid && 'border-destructive focus-visible:ring-destructive',
          triggerClassName
        )}
      >
        <div className='flex flex-nowrap items-center gap-1 flex-1 min-w-0 max-w-full overflow-hidden whitespace-nowrap'>
          {fieldValues.length > 0 ? (
            fieldValues.length > 100 ? (
              <p className='truncate px-1'>
                {fieldValues.length} {t('common.ui.selected')}
              </p>
            ) : (
              selectedOptions.map((option) =>
                customBadgeRender ? (
                  <div key={option.value} className='max-w-full shrink-0'>
                    {customBadgeRender(option)}
                  </div>
                ) : (
                  <Badge
                    variant='secondary'
                    className={cn('rounded-sm max-w-24 shrink-0', badgeClassName)}
                    key={option.value}
                  >
                    <span className='truncate max-w-24 block'>{option.label}</span>
                  </Badge>
                )
              )
            )
          ) : (
            <span className='truncate px-2'>{t(placeholder)}</span>
          )}
        </div>
        <ChevronsUpDown className='shrink-0 opacity-50' />
      </Button>
    )

    const handleSelect = (newValues: string[]) => {
      fieldOnChange(newValues)
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
              <MultiOptionList
                options={options}
                selectedValues={fieldValues}
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
                  <DrawerTitle>{t(label)}</DrawerTitle>
                  <DrawerDescription>{t(placeholder)}</DrawerDescription>
                </DrawerHeader>
                <MultiOptionList
                  options={options}
                  selectedValues={fieldValues}
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
          (Array.isArray(field.value) ? field.value : []) as string[],
          field.onChange,
          fieldState.invalid,
          fieldState.error,
          field.name
        )
      }}
    />
  )
}

function MultiOptionList({
  options,
  selectedValues,
  onSelect,
  searchPlaceholder,
  emptyMessage
}: {
  options: Option[]
  selectedValues: string[]
  onSelect: (values: string[]) => void
  searchPlaceholder: string
  emptyMessage: string
}) {
  return (
    <Command className='w-full'>
      <CommandInput placeholder={searchPlaceholder} className='h-9' />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        <CommandGroup>
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value)
            return (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  const newValues = isSelected
                    ? selectedValues.filter((v) => v !== option.value)
                    : [...selectedValues, option.value]
                  onSelect(newValues)
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
      </CommandList>
    </Command>
  )
}
