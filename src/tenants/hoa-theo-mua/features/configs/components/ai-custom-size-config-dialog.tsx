import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, SaveIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  AI_CUSTOM_SIZE_CONFIG_GROUP,
  AI_CUSTOM_SIZE_CONFIG_KEY,
  defaultAiCustomSize,
  defaultAiCustomSizeSection,
  parseAiCustomSizeSection,
  parseAiCustomSizes,
  type AiCustomSize,
  type AiCustomSizeSection
} from '../ai-custom-size-config-palette'
import configService from '../services'
import { ConfigKind, InputType, type Config } from '../types'
import type { CreateConfigFormValues } from '../validations'
import AiCustomSizeCard from './ai-custom-size-card'
import { LocalizedTabs } from './collection-shared'

interface AiCustomSizeConfigDialogProps {
  open: boolean
  onClose: () => void
  existingConfig: Config | null
}

export default function AiCustomSizeConfigDialog({ open, onClose, existingConfig }: AiCustomSizeConfigDialogProps) {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()
  const [sizes, setSizes] = useState<AiCustomSize[]>([])
  const [configLabel, setConfigLabel] = useState('')
  const [section, setSection] = useState<AiCustomSizeSection>(defaultAiCustomSizeSection)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setSizes(existingConfig ? parseAiCustomSizes(existingConfig.value.value) : [])
      setConfigLabel(existingConfig?.value.label || t('configsPage.aiCustomSizeDialog.title'))
      setSection(existingConfig ? parseAiCustomSizeSection(existingConfig.value.value) : defaultAiCustomSizeSection())
      setExpandedIndex(null)
    }
  }, [open, existingConfig, t])

  const visibleSizes = useMemo(() => sizes.filter((size) => !size.isDelete), [sizes])
  const updateSize = (index: number, patch: Partial<AiCustomSize>) => {
    setSizes((current) => current.map((size, sizeIndex) => (sizeIndex === index ? { ...size, ...patch } : size)))
  }

  const addSize = () => {
    setSizes((current) => [...current, defaultAiCustomSize()])
    setExpandedIndex(sizes.length)
  }

  const removeSize = (index: number) => updateSize(index, { isDelete: true })

  const save = async () => {
    if (visibleSizes.some((size) => !size.name.trim() || size.comboQuantity <= 0)) {
      toast.error(t('configsPage.aiCustomSizeDialog.invalid'))
      return
    }

    setIsSaving(true)
    try {
      const body: CreateConfigFormValues = {
        key: AI_CUSTOM_SIZE_CONFIG_KEY,
        isPublic: true,
        group: AI_CUSTOM_SIZE_CONFIG_GROUP,
        kind: ConfigKind.setting,
        value: {
          group: AI_CUSTOM_SIZE_CONFIG_GROUP,
          label: t('configsPage.aiCustomSizeDialog.title'),
          inputType: InputType.json,
          required: false,
          options: [],
          validations: [],
          value: JSON.stringify({ section, items: sizes })
        }
      }

      if (existingConfig) await configService.updateConfig({ id: existingConfig.id, body })
      else await configService.createConfig({ body })
      await queryClient.invalidateQueries({ queryKey: ['configs'] })
      toast.success(t('configKeys.toast.updated'))
      onClose()
    } catch {
      toast.error(t('configKeys.toast.error'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !isSaving && onClose()}>
      <DialogContent
        position='top-center'
        className='flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:min-w-3xl'
      >
        <DialogHeader className='border-b px-6 py-5'>
          <DialogTitle>{t('configsPage.aiCustomSizeDialog.title')}</DialogTitle>
          <p className='text-xs text-muted-foreground'>{t('configsPage.aiCustomSizeDialog.description')}</p>
        </DialogHeader>
        <div className='min-h-0 flex-1 space-y-2 overflow-y-auto px-6 py-5'>
          <div className='space-y-1.5'>
            <Label htmlFor='ai-custom-size-key'>{t('configsPage.dialog.keyField')}</Label>
            <div className='flex items-stretch overflow-hidden rounded-md border bg-background'>
              <span className='flex items-center border-r bg-muted px-2 font-mono text-xs text-muted-foreground'>
                {`${AI_CUSTOM_SIZE_CONFIG_GROUP}.`}
              </span>
              <Input
                id='ai-custom-size-key'
                value='size_config'
                disabled
                className='rounded-none border-0 font-mono shadow-none disabled:opacity-100'
              />
            </div>
            <p className='text-xs text-muted-foreground'>{t('configsPage.aiCustomSizeDialog.keyHint')}</p>
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='ai-custom-size-label'>{t('configsPage.aiCustomSizeDialog.fields.configLabel')}</Label>
            <Input
              id='ai-custom-size-label'
              value={configLabel}
              onChange={(event) => setConfigLabel(event.target.value)}
            />
          </div>
          <div className='space-y-3 rounded-xl border p-4'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-semibold'>{t('configsPage.aiCustomSizeDialog.section.title')}</p>
                <p className='text-xs text-muted-foreground'>
                  {t('configsPage.aiCustomSizeDialog.section.description')}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground'>
                  {t('configsPage.aiCustomSizeDialog.section.enabled')}
                </span>
                <Switch
                  checked={section.enabled}
                  onCheckedChange={(enabled) => setSection((current) => ({ ...current, enabled }))}
                />
              </div>
            </div>
            <LocalizedTabs
              viLabel={t('configsPage.productCollectionDialog.locale.vi')}
              enLabel={t('configsPage.productCollectionDialog.locale.en')}
              renderField={(language) => (
                <div className='space-y-3'>
                  <div className='space-y-1.5'>
                    <Label>{t('configsPage.aiCustomSizeDialog.section.titleField')}</Label>
                    <Input
                      value={section.title[language]}
                      onChange={(event) =>
                        setSection((current) => ({
                          ...current,
                          title: { ...current.title, [language]: event.target.value }
                        }))
                      }
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>{t('configsPage.aiCustomSizeDialog.section.descriptionField')}</Label>
                    <Textarea
                      rows={2}
                      value={section.description[language]}
                      onChange={(event) =>
                        setSection((current) => ({
                          ...current,
                          description: { ...current.description, [language]: event.target.value }
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            />
          </div>
          <div className='flex items-end justify-between gap-3 pt-3'>
            <div>
              <p className='text-sm font-semibold'>{t('configsPage.aiCustomSizeDialog.itemsTitle')}</p>
              <p className='text-xs text-muted-foreground'>{t('configsPage.aiCustomSizeDialog.itemsDescription')}</p>
            </div>
            <Button type='button' variant='outline' size='sm' onClick={addSize}>
              <Plus />
              {t('configsPage.aiCustomSizeDialog.add')}
            </Button>
          </div>
          {visibleSizes.length === 0 ? (
            <p className='rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground'>
              {t('configsPage.aiCustomSizeDialog.empty')}
            </p>
          ) : (
            sizes.map(
              (size, index) =>
                !size.isDelete && (
                  <AiCustomSizeCard
                    key={`ai-custom-size-${index}`}
                    size={size}
                    expanded={expandedIndex === index}
                    onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    onChange={(patch) => updateSize(index, patch)}
                    onRemove={() => removeSize(index)}
                  />
                )
            )
          )}
        </div>
        <DialogFooter className='border-t px-6 py-4'>
          <Button type='button' variant='outline' disabled={isSaving} onClick={onClose}>
            {t('configsPage.dialog.cancel')}
          </Button>
          <Button type='button' disabled={isSaving} onClick={save}>
            {isSaving ? <Spinner /> : <SaveIcon />}
            {isSaving ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
