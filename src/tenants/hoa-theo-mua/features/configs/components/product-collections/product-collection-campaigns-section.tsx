import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { defaultProductCollectionCampaign } from '../../product-collection-palette'
import type { ProductCollectionFormValues } from '../../validations'
import { ChipInput, LocalizedTabs } from '../shared/collection-shared'

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

interface Props {
  cardIndex: number
}

export default function ProductCollectionCampaignsSection({ cardIndex }: Props) {
  const { t } = useTenantTranslation()
  const { control } = useFormContext<ProductCollectionFormValues>()
  const {
    fields: campaignFields,
    append,
    remove,
    swap
  } = useFieldArray({
    control,
    name: `cards.${cardIndex}.campaigns`
  })

  return (
    <div className='mt-4 border-t pt-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <div className='text-sm font-semibold'>{t('configsPage.productCollectionDialog.campaigns.title')}</div>
          <div className='text-xs text-muted-foreground'>
            {t('configsPage.productCollectionDialog.campaigns.subtitle')}
          </div>
        </div>
        <Button type='button' variant='outline' size='sm' onClick={() => append(defaultProductCollectionCampaign())}>
          <Plus className='size-3.5' data-icon='inline-start' />
          {t('configsPage.productCollectionDialog.campaigns.add')}
        </Button>
      </div>

      {campaignFields.length === 0 ? (
        <div className='mt-3 rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground'>
          {t('configsPage.productCollectionDialog.campaigns.empty')}
        </div>
      ) : (
        <div className='mt-3 space-y-3'>
          {campaignFields.map((field, index) => (
            <CampaignRow
              key={field.id}
              cardIndex={cardIndex}
              index={index}
              total={campaignFields.length}
              onRemove={() => remove(index)}
              onMove={(dir) => {
                const to = index + dir
                if (to >= 0 && to < campaignFields.length) swap(index, to)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CampaignRow({
  cardIndex,
  index,
  total,
  onRemove,
  onMove
}: {
  cardIndex: number
  index: number
  total: number
  onRemove: () => void
  onMove: (direction: 1 | -1) => void
}) {
  const { t } = useTenantTranslation()
  const { control, register } = useFormContext<ProductCollectionFormValues>()
  const today = useMemo(() => todayISO(), [])

  const campaign = useWatch({ control, name: `cards.${cardIndex}.campaigns.${index}` })

  const active =
    !!campaign?.enabled &&
    !!campaign?.startDate &&
    !!campaign?.endDate &&
    campaign.startDate <= today &&
    today <= campaign.endDate

  const displayName =
    campaign?.campaignName.vi || t('configsPage.productCollectionDialog.campaigns.untitled', { index: index + 1 })
  const dateLabel =
    campaign?.startDate && campaign?.endDate
      ? `${campaign.startDate} - ${campaign.endDate}`
      : t('configsPage.productCollectionDialog.campaigns.noDates')

  return (
    <div className='rounded-xl border bg-background p-3'>
      <div className='flex items-center gap-2'>
        <div className='flex min-w-0 flex-1 flex-col'>
          <div className='flex items-center gap-2'>
            <span className='truncate text-sm font-medium'>{displayName}</span>
            {active && (
              <Badge
                variant='outline'
                className='border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/50 text-[0.625rem] text-emerald-700 dark:text-emerald-300'
              >
                {t('configsPage.productCollectionDialog.campaigns.activeNow')}
              </Badge>
            )}
            {!campaign?.enabled && (
              <Badge variant='outline' className='text-[0.625rem] text-muted-foreground'>
                {t('configsPage.productCollectionDialog.card.disabled')}
              </Badge>
            )}
          </div>
          <span className='truncate text-xs text-muted-foreground mt-1'>{dateLabel}</span>
        </div>

        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 text-muted-foreground'
          disabled={index === 0}
          onClick={() => onMove(-1)}
        >
          <ArrowUp className='size-3.5' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 text-muted-foreground'
          disabled={index === total - 1}
          onClick={() => onMove(1)}
        >
          <ArrowDown className='size-3.5' />
        </Button>
        <Controller
          control={control}
          name={`cards.${cardIndex}.campaigns.${index}.enabled`}
          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
        />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 text-muted-foreground hover:text-destructive'
          onClick={onRemove}
          aria-label={t('configsPage.productCollectionDialog.campaigns.remove')}
        >
          <Trash2 className='size-3.5' />
        </Button>
      </div>

      <div className='mt-3 grid grid-cols-1 gap-3 md:grid-cols-2'>
        <Field className='gap-1'>
          <FieldLabel>{t('configsPage.productCollectionDialog.campaigns.idField')}</FieldLabel>
          <Input {...register(`cards.${cardIndex}.campaigns.${index}.id` as const)} className='font-mono text-sm' />
        </Field>

        <Field className='gap-1'>
          <FieldLabel>{t('configsPage.productCollectionDialog.campaigns.skuPrefixField')}</FieldLabel>
          <Input
            {...register(`cards.${cardIndex}.campaigns.${index}.skuPrefix` as const)}
            placeholder={t('configsPage.productCollectionDialog.campaigns.skuPrefixPlaceholder')}
            className='font-mono text-sm'
          />
        </Field>

        <Field className='gap-1'>
          <FieldLabel>{t('configsPage.productCollectionDialog.campaigns.startDateField')}</FieldLabel>
          <Input type='date' {...register(`cards.${cardIndex}.campaigns.${index}.startDate` as const)} />
        </Field>

        <Field className='gap-1'>
          <FieldLabel>{t('configsPage.productCollectionDialog.campaigns.endDateField')}</FieldLabel>
          <Input type='date' {...register(`cards.${cardIndex}.campaigns.${index}.endDate` as const)} />
        </Field>
      </div>

      <div className='mt-3'>
        <LocalizedTabs
          viLabel={t('configsPage.productCollectionDialog.locale.vi')}
          enLabel={t('configsPage.productCollectionDialog.locale.en')}
          renderField={(lang) => (
            <div className='space-y-2'>
              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.productCollectionDialog.campaigns.campaignNameField')}</FieldLabel>
                <Input
                  {...register(`cards.${cardIndex}.campaigns.${index}.campaignName.${lang}` as const)}
                  placeholder={t('configsPage.productCollectionDialog.campaigns.campaignNamePlaceholder')}
                />
              </Field>

              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.productCollectionDialog.campaigns.badgeOverrideField')}</FieldLabel>
                <Input
                  {...register(`cards.${cardIndex}.campaigns.${index}.badge.${lang}` as const)}
                  placeholder={t('configsPage.productCollectionDialog.campaigns.badgeOverridePlaceholder')}
                />
              </Field>
            </div>
          )}
        />
      </div>

      <Controller
        control={control}
        name={`cards.${cardIndex}.campaigns.${index}.categoryIds`}
        render={({ field }) => (
          <Field className='mt-3 gap-1'>
            <FieldLabel>{t('configsPage.productCollectionDialog.campaigns.categoryIdsField')}</FieldLabel>
            <ChipInput
              values={field.value}
              onChange={field.onChange}
              placeholder={t('configsPage.productCollectionDialog.card.categoryIdsPlaceholder')}
            />
            <FieldDescription className='text-xs'>
              {t('configsPage.productCollectionDialog.campaigns.categoryIdsHelp')}
            </FieldDescription>
          </Field>
        )}
      />
    </div>
  )
}
