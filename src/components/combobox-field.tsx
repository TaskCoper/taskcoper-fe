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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/shared/utils'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'
import { type Control, Controller, type FieldValues, type Path, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface Option {
  label: string
  value: string
}

interface ComboboxFieldProps<T extends FieldValues> {
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
  onChange?: (value: string) => void
}

export function ComboboxField<T extends FieldValues>({
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
  onChange
}: ComboboxFieldProps<T>) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const context = useFormContext<T>()
  const control = propsControl || context?.control

  if (!control) {
    throw new Error('ComboboxField must be used within a FormProvider or passed a control prop')
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // Convert field.value to string for comparison (handles number fields)
        const fieldValueStr = field.value != null ? String(field.value) : ''
        const selectedOption = options.find((option) => option.value === fieldValueStr)

        const TriggerButton = (
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-invalid={fieldState.invalid}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal',
              !selectedOption && 'text-muted-foreground',
              fieldState.invalid && 'border-destructive focus-visible:ring-destructive'
            )}
          >
            {selectedOption?.label ?? t(placeholder)}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        )

        return (
          <Field data-invalid={fieldState.invalid} className={cn('gap-1', className)}>
            <FieldLabel
              htmlFor={field.name}
              className={cn(isRequired ? 'items-center gap-0.5' : 'items-baseline gap-1')}
            >
              {t(label)}
              {isRequired ? (
                <span className='text-destructive font-semibold'>*</span>
              ) : (
                <span className='text-muted-foreground text-xs'>({t('common.ui.optional')})</span>
              )}
            </FieldLabel>

            {isDesktop ? (
              <Popover open={open} onOpenChange={setOpen} modal={modal}>
                <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
                <PopoverContent
                  sideOffset={8}
                  className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'
                  align='start'
                  style={{ width: 'var(--radix-popover-trigger-width)' }}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <OptionList
                    options={options}
                    value={fieldValueStr}
                    onSelect={(val) => {
                      if (onChange) {
                        onChange(val)
                      } else {
                        field.onChange(val)
                      }
                      setOpen(false)
                    }}
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
                    <OptionList
                      options={options}
                      value={fieldValueStr}
                      onSelect={(val) => {
                        if (onChange) {
                          onChange(val)
                        } else {
                          field.onChange(val)
                        }
                        setOpen(false)
                      }}
                      searchPlaceholder={t(searchPlaceholder)}
                      emptyMessage={t(emptyMessage)}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            )}

            <div className='min-h-4'>
              {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
            </div>
          </Field>
        )
      }}
    />
  )
}

function OptionList({
  options,
  value,
  onSelect,
  searchPlaceholder,
  emptyMessage
}: {
  options: Option[]
  value: string
  onSelect: (value: string) => void
  searchPlaceholder: string
  emptyMessage: string
}) {
  return (
    <Command className='w-full'>
      <CommandInput placeholder={searchPlaceholder} className='h-9' />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.label}
              onSelect={() => {
                onSelect(option.value === value ? '' : option.value)
              }}
            >
              {option.label}
              <CheckIcon
                className={cn('ml-auto h-4 w-4 text-primary', value === option.value ? 'opacity-100' : 'opacity-0')}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
