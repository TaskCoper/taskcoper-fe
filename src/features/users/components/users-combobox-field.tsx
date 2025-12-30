import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

export interface ComboboxUserItem {
  id: string
  email: string
  fullName: string
  avatar: string | null
}

interface UsersComboboxFieldProps<TForm extends FieldValues, TArrayItem> {
  name: Path<TForm>
  label?: string
  control?: Control<TForm>
  items: ComboboxUserItem[]
  isLoading?: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  isRequired?: boolean
  placeholder?: string
  displayError?: boolean
  /**
   * extract unique id
   * eg: (item) => item.userId
   */
  getValueId: (item: TArrayItem) => string
  /**
   * create a new form value from a selected user.
   * eg: (user) => ({ userId: user.id, isEditor: false })
   */
  createValue: (user: ComboboxUserItem) => TArrayItem
  /**
   * optional override for useFieldArray compatibility
   */
  onChange?: (value: TArrayItem[]) => void
}

export default function UsersComboboxField<TForm extends FieldValues, TArrayItem>({
  name,
  label,
  control: propsControl,
  items,
  isLoading,
  searchValue,
  onSearchChange,
  getValueId,
  createValue,
  isRequired = false,
  placeholder = 'project.inviteMembers.comboboxPlaceholder',
  displayError = true,
  onChange: customOnChange
}: UsersComboboxFieldProps<TForm, TArrayItem>) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const context = useFormContext<TForm>()
  const control = propsControl || context?.control

  if (!control) {
    throw new Error('UsersComboboxField must be used within a FormProvider or passed a control prop')
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const currentValues = (Array.isArray(field.value) ? field.value : []) as TArrayItem[]

        const selectedUserIds = currentValues.map((v) => getValueId(v))

        const handleSelect = (user: ComboboxUserItem) => {
          const isSelected = selectedUserIds.includes(user.id)
          let newValues: TArrayItem[]

          if (isSelected) {
            newValues = currentValues.filter((v) => getValueId(v) !== user.id)
          } else {
            const newItem = createValue(user)
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
          if (selectedUserIds.length === 0) return t(placeholder)
          if (selectedUserIds.length === 1) return `${selectedUserIds.length} ${t('common.selected')}`
          return `${selectedUserIds.length} ${t('common.selected')}`
        }

        const listProps = {
          items,
          selectedUserIds,
          isLoading,
          onSelect: handleSelect,
          onSearchChange,
          searchValue,
          setOpen
        }

        return (
          <Field data-invalid={fieldState.invalid} className='flex flex-col gap-1'>
            {label && (
              <FieldLabel htmlFor={name} className='gap-0.5'>
                {t(label)}
                {isRequired && <span className='text-destructive font-semibold'>*</span>}
              </FieldLabel>
            )}

            {isDesktop ? (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      'w-full justify-between px-3 font-normal',
                      selectedUserIds.length === 0 ? 'text-muted-foreground' : '',
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
                <PopoverContent className='p-0' style={{ width: 'var(--radix-popover-trigger-width)' }} align='start'>
                  <UserList {...listProps} />
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
                      selectedUserIds.length === 0 ? 'text-muted-foreground' : '',
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
                      <DrawerTitle>{t('project.inviteMembers.search')}</DrawerTitle>
                      <DrawerDescription>Search user</DrawerDescription>
                    </DrawerHeader>
                    <UserList {...listProps} />
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

interface UserListProps {
  items: ComboboxUserItem[]
  selectedUserIds: string[]
  isLoading?: boolean
  onSelect: (user: ComboboxUserItem) => void
  onSearchChange: (value: string) => void
  searchValue: string
  setOpen: (open: boolean) => void
}

function UserList({
  items,
  selectedUserIds,
  isLoading,
  onSelect,
  onSearchChange,
  searchValue,
  setOpen
}: UserListProps) {
  const { t } = useTranslation()

  const handleSelect = (user: ComboboxUserItem) => {
    onSelect(user)
    setOpen(false)
    onSearchChange('')
  }

  return (
    <Command shouldFilter={false} className='w-full'>
      <CommandInput
        placeholder={t('project.inviteMembers.search')}
        value={searchValue}
        onValueChange={onSearchChange}
        className='h-9'
      />

      <CommandList className={items.length > 0 ? 'border-t' : ''}>
        {/* {isLoading && (
          <CommandItem className='flex items-center justify-center pb-6' disabled>
            <Spinner />
          </CommandItem>
        )}

        {!isLoading && items.length === 0 && searchValue.length > 0 && (
          <CommandItem className='flex items-center justify-center pb-6' disabled>
            <p className='text-sm text-muted-foreground'>{t('common.noResults')}</p>
          </CommandItem>
        )} */}

        {!isLoading && items.length > 0 && (
          <CommandGroup>
            {items.map((user) => {
              const isSelected = selectedUserIds.includes(user.id)
              return (
                <CommandItem
                  key={user.id}
                  value={user.email}
                  onSelect={() => handleSelect(user)}
                  className='cursor-pointer gap-3'
                >
                  <Avatar className='size-8'>
                    <AvatarImage src={user.avatar ?? ''} />
                    <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1 overflow-hidden'>
                    <p className='text-sm font-medium truncate'>{user.fullName}</p>
                    <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
                  </div>
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
