import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Bike, Check, ChevronsUpDown, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  CHECKOUT_CONFIG_GROUP,
  checkoutMethodsKey,
  defaultCheckoutMethods,
  parseCheckoutMethods
} from '../../checkout-methods-palette'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import { ConfigKind, InputType, type CheckoutMethodItem, type CheckoutMethodKind, type Config } from '../../types'
import type { CreateConfigFormValues } from '../../validations'
import EditorCallout from '../settings/editor-callout'
import InlineEditorShell from '../settings/inline-editor-shell'
import EditorSection from '../shared/editor-section'

interface Props {
  kind: CheckoutMethodKind
  /** `null` là tạo mới singleton của loại này; ngược lại sửa tại chỗ bản ghi đang có. */
  existingConfig: Config | null
  /** Bỏ trống khi editor chính là panel của category - lúc đó không có chỗ nào để quay lại. */
  onBack?: () => void
  onSaved?: () => void
}

const snapshot = (label: string, items: CheckoutMethodItem[]) => JSON.stringify({ label, items })

export default function CheckoutMethodsEditor({ kind, existingConfig, onBack, onSaved }: Props) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const [configLabel, setConfigLabel] = useState('')
  const [items, setItems] = useState<CheckoutMethodItem[]>(() => defaultCheckoutMethods(kind).items)
  const [openItemIds, setOpenItemIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [baseline, setBaseline] = useState('')

  const fallbackConfigLabel = t(`configsPage.checkoutMethodsDialog.${kind}.configLabel`)

  useEffect(() => {
    const label = existingConfig?.value.label || fallbackConfigLabel
    const nextItems = existingConfig
      ? parseCheckoutMethods(existingConfig.value.value, kind).items
      : defaultCheckoutMethods(kind).items

    setConfigLabel(label)
    setItems(nextItems)
    setOpenItemIds([])
    setBaseline(snapshot(label, nextItems))
  }, [kind, existingConfig, fallbackConfigLabel])

  const isDirty = snapshot(configLabel, items) !== baseline

  const revert = () => {
    const label = existingConfig?.value.label || fallbackConfigLabel
    const nextItems = existingConfig
      ? parseCheckoutMethods(existingConfig.value.value, kind).items
      : defaultCheckoutMethods(kind).items
    setConfigLabel(label)
    setItems(nextItems)
    setBaseline(snapshot(label, nextItems))
  }

  const updateItem = (id: string, update: (item: CheckoutMethodItem) => CheckoutMethodItem) => {
    setItems((current) => current.map((item) => (item.id === id ? update(item) : item)))
  }

  const setEnabled = (id: string, enabled: boolean) => {
    setItems((current) => {
      const next = current.map((item) => (item.id === id ? { ...item, enabled } : item))
      const active = next.filter((item) => item.enabled)
      const defaultId = active.find((item) => item.isDefault)?.id ?? active[0]?.id

      return next.map((item) => ({ ...item, isDefault: item.id === defaultId }))
    })
  }

  const setDefault = (id: string) => {
    setItems((current) => current.map((item) => ({ ...item, isDefault: item.id === id })))
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) {
      return
    }

    setItems((current) => {
      const next = [...current]
      const moved = next[index]
      next[index] = next[target]
      next[target] = moved

      return next
    })
  }

  const save = async () => {
    if (!configLabel.trim()) {
      toast.error(t('configsPage.checkoutMethodsDialog.errors.labelRequired'))
      return
    }

    setIsSaving(true)
    try {
      const key = checkoutMethodsKey(kind)
      const body: CreateConfigFormValues = {
        key,
        isPublic: true,
        group: CHECKOUT_CONFIG_GROUP,
        kind: ConfigKind.content,
        value: {
          group: CHECKOUT_CONFIG_GROUP,
          label: configLabel.trim(),
          inputType: InputType.json,
          required: false,
          options: [],
          validations: [],
          value: JSON.stringify({ items })
        }
      }

      if (existingConfig) {
        await configService.updateConfig({ id: existingConfig.id, body })
        toast.success(t('configKeys.toast.updated'))
      } else {
        await configService.createConfig({ body })
        toast.success(t('configKeys.toast.created'))
      }

      await queryClient.invalidateQueries({ queryKey: configKeys.all })
      // Đóng bằng `onSaved`, không dùng `onBack` - xem `inline-editor-shell`.
      setBaseline(snapshot(configLabel, items))
      onSaved?.()
    } catch {
      toast.error(t('configKeys.toast.error'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <InlineEditorShell
      editorId={checkoutMethodsKey(kind)}
      title={t(`configsPage.checkoutMethodsDialog.${kind}.title`)}
      description={t('configsPage.checkoutMethodsDialog.description')}
      isDirty={isDirty}
      isSaving={isSaving}
      onRevert={revert}
      onSave={save}
      onBack={onBack}
    >
      <EditorCallout>{t('configsPage.checkoutMethodsDialog.registryHint')}</EditorCallout>

      <EditorSection
        title={t('configsPage.checkoutMethodsDialog.configLabel')}
        description={t('configsPage.checkoutMethodsDialog.configLabelHelp')}
      >
        <Input
          id={`${kind}-config-label`}
          aria-label={t('configsPage.checkoutMethodsDialog.configLabel')}
          value={configLabel}
          onChange={(event) => setConfigLabel(event.target.value)}
          placeholder={fallbackConfigLabel}
        />
      </EditorSection>

      <EditorSection
        title={t('configsPage.checkoutMethodsDialog.methodsTitle')}
        description={t('configsPage.checkoutMethodsDialog.methodsSubtitle')}
      >
        <Accordion type='multiple' value={openItemIds} onValueChange={setOpenItemIds} className='space-y-2'>
          {items.map((item, index) => (
            <MethodRow
              key={item.id}
              kind={kind}
              item={item}
              index={index}
              total={items.length}
              onUpdate={(update) => updateItem(item.id, update)}
              onEnabledChange={(enabled) => setEnabled(item.id, enabled)}
              onSetDefault={() => setDefault(item.id)}
              onMove={(direction) => move(index, direction)}
            />
          ))}
        </Accordion>
      </EditorSection>
    </InlineEditorShell>
  )
}

function MethodRow({
  kind,
  item,
  index,
  total,
  onUpdate,
  onEnabledChange,
  onSetDefault,
  onMove
}: {
  kind: CheckoutMethodKind
  item: CheckoutMethodItem
  index: number
  total: number
  onUpdate: (update: (item: CheckoutMethodItem) => CheckoutMethodItem) => void
  onEnabledChange: (enabled: boolean) => void
  onSetDefault: () => void
  onMove: (direction: -1 | 1) => void
}) {
  const { t } = useTenantTranslation()
  const MethodIcon = kind === 'payment' ? CreditCard : Bike

  return (
    <AccordionItem value={item.id} className='border-b-transparent'>
      <div className={cn('flex items-center gap-2 rounded-xl border', item.enabled ? 'bg-muted' : 'bg-muted/30')}>
        <AccordionTrigger
          className='min-w-0 flex-1 p-2 hover:no-underline'
          headerClassName='min-w-0 flex-1'
          displayIcon={false}
        >
          <div className='flex min-w-0 flex-1 items-center gap-3'>
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background',
                item.enabled ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <MethodIcon className='size-4' />
            </span>
            <div className='min-w-0 flex-1 text-left'>
              <p className='truncate text-sm font-medium'>{item.label.vi || item.label.en || item.id}</p>
              <p className='truncate font-mono text-[11px] text-muted-foreground'>
                {item.id}
                <span className='mx-1.5 text-muted-foreground/50'>•</span>
                {t(`configsPage.checkoutMethodsDialog.${kind}.gatewayField`)}={item.gateway}
              </p>
            </div>
            <Badge
              variant='outline'
              className={cn(
                'ml-auto shrink-0 text-[0.625rem]',
                item.enabled
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'border-muted bg-muted text-muted-foreground'
              )}
            >
              {t(`configsPage.checkoutMethodsDialog.status.${item.enabled ? 'enabled' : 'disabled'}`)}
            </Badge>
            {item.isDefault ? (
              <Badge
                variant='outline'
                className='shrink-0 border-violet-200 bg-violet-50 text-[0.625rem] text-violet-700 dark:text-violet-300'
              >
                <Check className='size-3' />
                {t('configsPage.checkoutMethodsDialog.default')}
              </Badge>
            ) : null}
            <ChevronsUpDown className='size-3.5 text-muted-foreground' />
          </div>
        </AccordionTrigger>

        <div className='ml-auto mr-2 flex shrink-0 items-center gap-0.5'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground'
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={t('configsPage.checkoutMethodsDialog.moveUp')}
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
            aria-label={t('configsPage.checkoutMethodsDialog.moveDown')}
          >
            <ArrowDown className='size-3.5' />
          </Button>
          <Switch checked={item.enabled} onCheckedChange={onEnabledChange} className='ml-1' />
        </div>
      </div>

      <AccordionContent className='rounded-b-xl pt-2!'>
        <div className='mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-muted/20 px-3 py-2'>
          <div>
            <p className='text-xs font-medium'>{t('configsPage.checkoutMethodsDialog.gateway')}</p>
            <p className='text-xs text-muted-foreground'>
              {t(`configsPage.checkoutMethodsDialog.${kind}.gatewayHelp`)}
            </p>
          </div>
          <Badge variant='outline' className='ml-auto shrink-0 font-mono text-[0.625rem]'>
            {t(`configsPage.checkoutMethodsDialog.${kind}.gatewayField`)}: {item.gateway}
          </Badge>
          <Badge variant='outline' className='shrink-0 font-mono text-[0.625rem]'>
            {item.gatewayName}
          </Badge>
        </div>

        <div className='mb-4 flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2'>
          <div>
            <p className='text-xs font-medium'>{t('configsPage.checkoutMethodsDialog.default')}</p>
            <p className='text-xs text-muted-foreground'>{t('configsPage.checkoutMethodsDialog.defaultHelp')}</p>
          </div>
          <Button
            type='button'
            size='sm'
            variant={item.isDefault ? 'default' : 'outline'}
            disabled={!item.enabled || item.isDefault}
            onClick={onSetDefault}
          >
            {item.isDefault ? <Check className='size-3.5' /> : null}
            {item.isDefault
              ? t('configsPage.checkoutMethodsDialog.defaultSelected')
              : t('configsPage.checkoutMethodsDialog.makeDefault')}
          </Button>
        </div>

        <div className='grid gap-4 sm:grid-cols-2'>
          {(['vi', 'en'] as const).map((locale) => (
            <div key={locale} className='space-y-3 rounded-xl border bg-background p-3'>
              <p className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>{locale}</p>
              <div className='space-y-1.5'>
                <Label htmlFor={`${kind}-${item.id}-${locale}-label`}>
                  {t('configsPage.checkoutMethodsDialog.label')}
                </Label>
                <Input
                  id={`${kind}-${item.id}-${locale}-label`}
                  value={item.label[locale]}
                  onChange={(event) =>
                    onUpdate((current) => ({
                      ...current,
                      label: { ...current.label, [locale]: event.target.value }
                    }))
                  }
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor={`${kind}-${item.id}-${locale}-description`}>
                  {t('configsPage.checkoutMethodsDialog.methodDescription')}
                </Label>
                <Textarea
                  id={`${kind}-${item.id}-${locale}-description`}
                  rows={3}
                  value={item.description[locale]}
                  onChange={(event) =>
                    onUpdate((current) => ({
                      ...current,
                      description: { ...current.description, [locale]: event.target.value }
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
