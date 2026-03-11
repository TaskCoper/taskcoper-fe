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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/shared/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'
import { type Control, Controller, type FieldValues, type Path, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface Option {
  label: string
  value: string
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
  isRequired = false
}: ComboboxMultiFieldProps<T>) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const context = useFormContext<T>()
  const control = propsControl || context?.control

  if (!control) {
    throw new Error('ComboboxMultiField must be used within a FormProvider or passed a control prop')
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedValues = (Array.isArray(field.value) ? field.value : []) as string[]
        const selectedOptions = options.filter((option) => selectedValues.includes(option.value))

        const TriggerButton = (
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-invalid={fieldState.invalid}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal h-auto min-h-10 py-2',
              selectedValues.length === 0 && 'text-muted-foreground',
              fieldState.invalid && 'border-destructive focus-visible:ring-destructive'
            )}
          >
            <div className='flex flex-wrap gap-1 items-center text-left'>
              {selectedValues.length > 0 ? (
                selectedValues.length > 3 ? (
                  <p>
                    {selectedValues.length} {t('common.ui.selected')}
                  </p>
                ) : (
                  selectedOptions.map((option) => (
                    <Badge variant='secondary' className='rounded-sm' key={option.value}>
                      {option.label}
                    </Badge>
                  ))
                )
              ) : (
                <span className='truncate'>{t(placeholder)}</span>
              )}
            </div>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        )

        const handleSelect = (newValues: string[]) => {
          field.onChange(newValues)
        }

        return (
          <Field data-invalid={fieldState.invalid} className={cn('gap-1', className)}>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
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
                >
                  <MultiOptionList
                    options={options}
                    selectedValues={selectedValues}
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
                      selectedValues={selectedValues}
                      onSelect={handleSelect}
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
                <Check className={cn('ml-auto h-4 w-4 transition-opacity', isSelected ? 'opacity-100' : 'opacity-0')} />
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
