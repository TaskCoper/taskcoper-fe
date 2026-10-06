import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { Clock3 } from 'lucide-react'
import { useMemo, useState } from 'react'
import EditorCallout from '../settings/editor-callout'
import InlineEditorShell from '../settings/inline-editor-shell'
import EditorSection from '../shared/editor-section'

interface OrderTagOption {
  label: string
  value: string | number
}

interface SlotSetting {
  limit: number
  isActive: boolean
}

interface OrderSlotsEditorProps {
  orderTagOptions: readonly OrderTagOption[]
}

const ORDER_TAG_TIME_PATTERN = /^\s*\d{1,2}h\s*-\s*\d{1,2}h\s*$/i

export default function OrderSlotsEditor({ orderTagOptions }: OrderSlotsEditorProps) {
  const { t } = useTenantTranslation()
  const syncedSlots = useMemo(
    () => orderTagOptions.filter((option) => ORDER_TAG_TIME_PATTERN.test(option.label)),
    [orderTagOptions]
  )
  const [settings, setSettings] = useState<Record<string, SlotSetting>>({})

  const updateSetting = (value: string | number, patch: Partial<SlotSetting>) => {
    const key = String(value)
    setSettings((current) => ({
      ...current,
      [key]: { ...(current[key] ?? { limit: 10, isActive: true }), ...patch }
    }))
  }

  return (
    <InlineEditorShell
      editorId='order-slots-draft'
      icon={<Clock3 className='size-4' />}
      title={t('configsPage.orderSlots.title')}
      description={t('configsPage.orderSlots.description')}
      isDirty={false}
      isSaving={false}
      onRevert={() => undefined}
      onSave={() => undefined}
      saveDisabledReason={t('configsPage.pendingApi')}
    >
      <EditorCallout>{t('configsPage.orderSlots.syncNotice')}</EditorCallout>

      <EditorSection
        title={t('configsPage.orderSlots.slotSection')}
        description={t('configsPage.orderSlots.slotDescription')}
      >
        {syncedSlots.length === 0 ? (
          <div className='rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground'>
            {t('configsPage.orderSlots.empty')}
          </div>
        ) : (
          <div className='overflow-hidden rounded-lg border'>
            <div className='grid grid-cols-[minmax(0,1fr)_180px_120px] gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground'>
              <span>{t('configsPage.orderSlots.slot')}</span>
              <span>{t('configsPage.orderSlots.limit')}</span>
              <span>{t('configsPage.orderSlots.status')}</span>
            </div>

            {syncedSlots.map((slot) => {
              const setting = settings[String(slot.value)] ?? { limit: 10, isActive: true }

              return (
                <div
                  key={String(slot.value)}
                  className='grid grid-cols-[minmax(0,1fr)_180px_120px] items-center gap-3 border-b px-3 py-3 last:border-b-0'
                >
                  <div>
                    <p className='font-medium'>{slot.label.trim()}</p>
                    <p className='text-xs text-muted-foreground'>{t('configsPage.orderSlots.dailyRepeat')}</p>
                  </div>
                  <Input
                    type='number'
                    min={0}
                    value={setting.limit}
                    onChange={(event) => updateSetting(slot.value, { limit: Number(event.target.value) })}
                  />
                  <div className='flex items-center gap-2'>
                    <Switch
                      checked={setting.isActive}
                      onCheckedChange={(isActive) => updateSetting(slot.value, { isActive })}
                    />
                    <span className='text-xs text-muted-foreground'>
                      {setting.isActive ? t('configsPage.orderSlots.active') : t('configsPage.orderSlots.inactive')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </EditorSection>
    </InlineEditorShell>
  )
}
