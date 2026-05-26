import { DatePickerField } from '@/components/date-picker-field'
import InfiniteMultiSelect from '@/components/infinite-multi-select'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea
} from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGetMyMentorPackagesInfinite } from '@/features/mentor-packages/hooks/use-get-my-mentor-packages-infinite'
import { cn } from '@/shared/utils'
import { WandSparklesIcon } from 'lucide-react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { DiscountType, DiscountTypeLabel, Scope, ScopeLabel, TargetType } from '../types'
import { type CreateVoucherFormValues } from '../validations'

export default function CreateVoucherForm() {
  const { t } = useTranslation()
  const { control, setValue } = useFormContext<CreateVoucherFormValues>()

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue('code', result, { shouldValidate: true })
  }

  const scope = useWatch({ control, name: 'scope' })

  const { mentorPackages, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetMyMentorPackagesInfinite({
    enabled: scope === Scope.SpecificTargets
  })

  return (
    <div className='space-y-1'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <Controller
          name='name'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('voucher.field.name')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={t('voucher.field.namePlaceholder')}
                autoComplete='off'
                spellCheck={false}
                autoFocus={true}
              />

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='code'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('voucher.field.code')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder={t('voucher.field.codePlaceholder')}
                  autoComplete='off'
                  className='uppercase'
                  spellCheck={false}
                />

                <InputGroupAddon align='inline-end'>
                  <InputGroupButton
                    aria-label='Generate code'
                    title='Generate code'
                    size='icon-xs'
                    onClick={generateCode}
                  >
                    <WandSparklesIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <DatePickerField
          control={control}
          name='startsAtUtc'
          label='voucher.field.startsAt'
          placeholder='voucher.field.startsAtPlaceholder'
          isRequired
        />

        <DatePickerField
          control={control}
          name='endsAtUtc'
          label='voucher.field.endsAt'
          placeholder='voucher.field.endsAtPlaceholder'
          isRequired
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <Controller
          name='discountType'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('voucher.field.discountType')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder={t('common.ui.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent className='min-w-(--radix-select-trigger-width)'>
                  {Object.values(DiscountType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(DiscountTypeLabel[type])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name='discountValue'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('voucher.field.discountValue')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                value={field.value ?? ''}
                type='number'
                min={0}
                aria-invalid={fieldState.invalid}
                placeholder={t('voucher.field.discountValuePlaceholder')}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <Controller
          name='totalUsageLimit'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('voucher.field.totalUsageLimit')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                value={field.value ?? ''}
                type='number'
                min={1}
                aria-invalid={fieldState.invalid}
                placeholder={t('voucher.field.totalUsageLimitPlaceholder')}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />

        <Controller
          name='usageLimitPerUser'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='gap-1'>
              <FieldLabel htmlFor={field.name} className='gap-0.5'>
                {t('voucher.field.usageLimitPerUser')}
                <span className='text-destructive font-semibold'>*</span>
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                value={field.value ?? ''}
                type='number'
                min={1}
                aria-invalid={fieldState.invalid}
                placeholder={t('voucher.field.usageLimitPerUserPlaceholder')}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />

              <div className='min-h-4'>
                {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
              </div>
            </Field>
          )}
        />
      </div>

      <Controller
        name='scope'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className='gap-1'>
            <FieldLabel htmlFor={field.name} className='gap-0.5'>
              {t('voucher.field.scope')}
              <span className='text-destructive font-semibold'>*</span>
            </FieldLabel>

            <Select name={field.name} value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder={t('common.ui.selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent className='min-w-(--radix-select-trigger-width)'>
                {Object.values(Scope).map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {t(ScopeLabel[scope])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      {scope === Scope.SpecificTargets && (
        <Controller
          name='targets'
          control={control}
          render={({ field, fieldState }) => {
            const selectedIds = field.value?.map((t) => t.targetId) ?? []
            const options = mentorPackages.map((p) => ({ value: p.id, label: p.name }))

            return (
              <Field data-invalid={fieldState.invalid} className='gap-1 mt-4'>
                <FieldLabel htmlFor={field.name}>{t('voucher.field.targets')}</FieldLabel>
                <InfiniteMultiSelect
                  id={field.name}
                  options={options}
                  values={selectedIds}
                  onChangeValues={(ids) =>
                    field.onChange(ids.map((id) => ({ targetType: TargetType.MentorPackage, targetId: id })))
                  }
                  isLoading={isLoading}
                  isFetchingNextPage={isFetchingNextPage}
                  hasNextPage={hasNextPage}
                  fetchNextPage={fetchNextPage}
                />
                <div className='min-h-4'>
                  {fieldState.invalid && <FieldError className='text-xs' errors={[fieldState.error]} />}
                </div>
              </Field>
            )
          }}
        />
      )}

      <Controller
        name='description'
        control={control}
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className={cn('gap-1', scope !== Scope.SpecificTargets ? 'mt-6' : '')}
          >
            <FieldLabel htmlFor={field.name}>{t('voucher.field.description')}</FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                value={field.value ?? ''}
                placeholder={t('voucher.field.descriptionPlaceholder')}
                rows={4}
                className='min-h-20 resize-none wrap-break-word'
                aria-invalid={fieldState.invalid}
              />
              <InputGroupAddon align='block-end'>
                <InputGroupText className='tabular-nums text-xs'>
                  {field.value?.length ?? 0}/255 {t('common.ui.characters')}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}
      />

      {/* <Controller
        name='isStackable'
        control={control}
        render={({ field, fieldState }) => (
          <Field
            orientation='horizontal'
            data-invalid={fieldState.invalid}
            className='p-3 bg-muted/50 rounded-md border border-dashed flex justify-between mt-2'
          >
            <FieldContent className='gap-0'>
              <FieldLabel htmlFor={field.name}>{t('voucher.field.isStackable')}</FieldLabel>
              <FieldDescription className='text-xs'>{t('voucher.field.isStackableDescription')}</FieldDescription>
            </FieldContent>
            <Switch
              id={field.name}
              name={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-invalid={fieldState.invalid}
            />
          </Field>
        )}
      /> */}
    </div>
  )
}
