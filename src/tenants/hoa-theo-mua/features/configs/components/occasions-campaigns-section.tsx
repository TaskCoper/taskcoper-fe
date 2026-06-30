import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { defaultOccasionCampaign, type OccasionCampaign } from '../occasions-palette'
import { ChipInput, LocalizedTabs } from './collection-shared'

function isCampaignActive(campaign: OccasionCampaign, today: string): boolean {
  return (
    !!campaign.enabled &&
    !!campaign.startDate &&
    !!campaign.endDate &&
    campaign.startDate <= today &&
    today <= campaign.endDate
  )
}

export default function OccasionsCampaignsSection({
  campaigns,
  onChange
}: {
  campaigns: OccasionCampaign[]
  onChange: (next: OccasionCampaign[]) => void
}) {
  const { t } = useTenantTranslation()
  const today = useMemo(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }, [])

  const updateCampaign = (index: number, patch: Partial<OccasionCampaign>) => {
    const next = [...campaigns]
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }

  const addCampaign = () => onChange([...campaigns, defaultOccasionCampaign()])

  const removeCampaign = (index: number) => onChange(campaigns.filter((_, i) => i !== index))

  const moveCampaign = (from: number, to: number) => {
    if (to < 0 || to >= campaigns.length) return
    const next = [...campaigns]
    const [picked] = next.splice(from, 1)
    next.splice(to, 0, picked)
    onChange(next)
  }

  return (
    <div className='mt-4 border-t pt-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <div className='text-sm font-semibold'>{t('configsPage.occasionsDialog.campaigns.title')}</div>
          <div className='text-xs text-muted-foreground'>{t('configsPage.occasionsDialog.campaigns.subtitle')}</div>
        </div>
        <Button type='button' variant='outline' size='sm' onClick={addCampaign}>
          <Plus className='size-3.5' data-icon='inline-start' />
          {t('configsPage.occasionsDialog.campaigns.add')}
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className='mt-3 rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground'>
          {t('configsPage.occasionsDialog.campaigns.empty')}
        </div>
      ) : (
        <div className='mt-3 space-y-3'>
          {campaigns.map((campaign, index) => (
            <CampaignRow
              key={index}
              index={index}
              total={campaigns.length}
              campaign={campaign}
              active={isCampaignActive(campaign, today)}
              onChange={(patch) => updateCampaign(index, patch)}
              onRemove={() => removeCampaign(index)}
              onMove={(dir) => moveCampaign(index, index + dir)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CampaignRow({
  index,
  total,
  campaign,
  active,
  onChange,
  onRemove,
  onMove
}: {
  index: number
  total: number
  campaign: OccasionCampaign
  active: boolean
  onChange: (patch: Partial<OccasionCampaign>) => void
  onRemove: () => void
  onMove: (direction: 1 | -1) => void
}) {
  const { t } = useTenantTranslation()
  const displayName =
    campaign.campaignName.vi || t('configsPage.occasionsDialog.campaigns.untitled', { index: index + 1 })
  const dateLabel =
    campaign.startDate && campaign.endDate
      ? `${campaign.startDate} - ${campaign.endDate}`
      : t('configsPage.occasionsDialog.campaigns.noDates')

  return (
    <div className='rounded-xl border bg-background p-3'>
      <div className='flex items-center gap-2'>
        <div className='flex min-w-0 flex-1 flex-col'>
          <div className='flex items-center gap-2'>
            <span className='truncate text-sm font-medium'>{displayName}</span>
            {active && (
              <Badge variant='outline' className='border-emerald-300 bg-emerald-50 text-[0.625rem] text-emerald-700'>
                {t('configsPage.occasionsDialog.campaigns.activeNow')}
              </Badge>
            )}
            {!campaign.enabled && (
              <Badge variant='outline' className='text-[0.625rem] text-muted-foreground'>
                {t('configsPage.occasionsDialog.card.disabled')}
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
        <Switch checked={campaign.enabled} onCheckedChange={(checked) => onChange({ enabled: checked })} />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 text-muted-foreground hover:text-destructive'
          onClick={onRemove}
          aria-label={t('configsPage.occasionsDialog.campaigns.remove')}
        >
          <Trash2 className='size-3.5' />
        </Button>
      </div>

      <div className='mt-3 grid grid-cols-1 gap-3 md:grid-cols-2'>
        <Field className='gap-1'>
          <FieldLabel>{t('configsPage.occasionsDialog.campaigns.idField')}</FieldLabel>
          <Input value={campaign.id} onChange={(e) => onChange({ id: e.target.value })} className='font-mono text-sm' />
        </Field>

        <Field className='gap-1'>
          <FieldLabel>{t('configsPage.occasionsDialog.campaigns.skuPrefixField')}</FieldLabel>
          <Input
            value={campaign.skuPrefix}
            onChange={(e) => onChange({ skuPrefix: e.target.value })}
            placeholder={t('configsPage.occasionsDialog.campaigns.skuPrefixPlaceholder')}
            className='font-mono text-sm'
          />
        </Field>

        <Field className='gap-1'>
          <FieldLabel>{t('configsPage.occasionsDialog.campaigns.startDateField')}</FieldLabel>
          <Input type='date' value={campaign.startDate} onChange={(e) => onChange({ startDate: e.target.value })} />
        </Field>

        <Field className='gap-1'>
          <FieldLabel>{t('configsPage.occasionsDialog.campaigns.endDateField')}</FieldLabel>
          <Input type='date' value={campaign.endDate} onChange={(e) => onChange({ endDate: e.target.value })} />
        </Field>
      </div>

      <div className='mt-3'>
        <LocalizedTabs
          viLabel={t('configsPage.occasionsDialog.locale.vi')}
          enLabel={t('configsPage.occasionsDialog.locale.en')}
          renderField={(lang) => (
            <div className='space-y-2'>
              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.occasionsDialog.campaigns.campaignNameField')}</FieldLabel>
                <Input
                  value={campaign.campaignName[lang]}
                  onChange={(e) => onChange({ campaignName: { ...campaign.campaignName, [lang]: e.target.value } })}
                  placeholder={t('configsPage.occasionsDialog.campaigns.campaignNamePlaceholder')}
                />
              </Field>

              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.occasionsDialog.campaigns.badgeOverrideField')}</FieldLabel>
                <Input
                  value={campaign.badge[lang]}
                  onChange={(e) => onChange({ badge: { ...campaign.badge, [lang]: e.target.value } })}
                  placeholder={t('configsPage.occasionsDialog.campaigns.badgeOverridePlaceholder')}
                />
              </Field>
            </div>
          )}
        />
      </div>

      <Field className='mt-3 gap-1'>
        <FieldLabel>{t('configsPage.occasionsDialog.campaigns.categoryIdsField')}</FieldLabel>
        <ChipInput
          values={campaign.categoryIds}
          onChange={(next) => onChange({ categoryIds: next })}
          placeholder={t('configsPage.occasionsDialog.card.categoryIdsPlaceholder')}
        />
        <FieldDescription className='text-xs'>
          {t('configsPage.occasionsDialog.campaigns.categoryIdsHelp')}
        </FieldDescription>
      </Field>
    </div>
  )
}
