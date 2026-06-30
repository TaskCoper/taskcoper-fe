import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { ArrowDown, ArrowUp, ChevronsUpDown, ImageIcon, Trash2, UploadIcon } from 'lucide-react'
import { useRef } from 'react'
import { slugify, type MainlineCard } from '../mainline-palette'
import { ChipInput, LocalizedTabs } from './collection-shared'

type Lang = 'vi' | 'en'

interface Props {
  uid: string
  index: number
  total: number
  card: MainlineCard
  pendingPreviewUrl?: string
  onChange: (patch: Partial<MainlineCard>) => void
  onRemove: () => void
  onMove: (direction: 1 | -1) => void
  onPickFile: (file: File) => void
  onClearPendingFile: () => void
  usedIds: Set<string>
}

export default function MainlineCardRow({
  uid,
  index,
  total,
  card,
  pendingPreviewUrl,
  onChange,
  onRemove,
  onMove,
  onPickFile,
  onClearPendingFile,
  usedIds
}: Props) {
  const { t } = useTenantTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const displayPreview = pendingPreviewUrl || card.image || ''
  const displayName = card.name.vi || t('configsPage.mainlineDialog.card.untitled', { index: index + 1 })

  const handleNameBlur = (lang: Lang, value: string) => {
    if (lang === 'vi' && !card.id) {
      let candidate = slugify(value) || `card-${index + 1}`
      let n = 2
      while (usedIds.has(candidate)) candidate = `${slugify(value) || 'card'}-${n++}`
      onChange({ id: candidate })
    }
  }

  return (
    <AccordionItem value={uid} className='border-b-transparent'>
      <div className='flex items-center gap-2 border rounded-xl bg-muted w-full'>
        <AccordionTrigger className='p-2 hover:no-underline' headerClassName='flex-1 min-w-0' displayIcon={false}>
          <div className='flex flex-1 items-center gap-3'>
            <div className='size-10 shrink-0 overflow-hidden rounded-lg border bg-muted'>
              {displayPreview ? (
                <img src={displayPreview} alt='' className='size-full object-cover' />
              ) : (
                <div className='flex size-full items-center justify-center text-muted-foreground'>
                  <ImageIcon className='size-4' />
                </div>
              )}
            </div>
            <div className='flex min-w-0 flex-1 flex-col items-start'>
              <span className='truncate text-sm font-medium'>{displayName}</span>
              <span className='truncate text-xs text-muted-foreground'>
                {card.id ? `/${card.id}` : t('configsPage.mainlineDialog.card.noSlug')}
              </span>
            </div>

            {!card.enabled && (
              <Badge variant='outline' className='text-[0.625rem] text-muted-foreground'>
                {t('configsPage.mainlineDialog.card.disabled')}
              </Badge>
            )}
            <ChevronsUpDown className='size-3.5 text-muted-foreground' />
          </div>
        </AccordionTrigger>

        <div className='flex items-center gap-0.5 mr-2'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground'
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={t('configsPage.mainlineDialog.card.moveUp')}
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
            aria-label={t('configsPage.mainlineDialog.card.moveDown')}
          >
            <ArrowDown className='size-3.5' />
          </Button>
          <Switch
            checked={card.enabled}
            onCheckedChange={(checked) => onChange({ enabled: checked })}
            className='ml-1'
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground hover:text-destructive'
            onClick={onRemove}
            aria-label={t('configsPage.mainlineDialog.card.remove')}
          >
            <Trash2 className='size-3.5' />
          </Button>
        </div>
      </div>

      <AccordionContent className='p-4 rounded-b-2xl'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr]'>
          <div>
            <FieldLabel className='text-xs'>{t('configsPage.mainlineDialog.card.image')}</FieldLabel>
            <div className='mt-1 aspect-square overflow-hidden rounded-md border bg-muted'>
              {displayPreview ? (
                <img src={displayPreview} alt='' className='size-full object-cover' />
              ) : (
                <div className='flex size-full items-center justify-center text-muted-foreground'>
                  <ImageIcon className='size-6' />
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) onPickFile(file)
              }}
            />
            <div className='mt-2 flex gap-1.5'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='flex-1'
                onClick={() => fileRef.current?.click()}
              >
                <UploadIcon className='size-3.5' data-icon='inline-start' />
                {displayPreview
                  ? t('configsPage.mainlineDialog.card.replaceImage')
                  : t('configsPage.mainlineDialog.card.uploadImage')}
              </Button>
              {(pendingPreviewUrl || card.image) && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-8 text-muted-foreground hover:text-destructive'
                  onClick={() => {
                    onClearPendingFile()
                    onChange({ image: '' })
                  }}
                >
                  <Trash2 className='size-3.5' />
                </Button>
              )}
            </div>
          </div>

          <div className='space-y-4'>
            <LocalizedTabs
              viLabel={t('configsPage.mainlineDialog.locale.vi')}
              enLabel={t('configsPage.mainlineDialog.locale.en')}
              renderField={(lang) => (
                <div className='space-y-2'>
                  <Field className='gap-1'>
                    <FieldLabel>{t('configsPage.mainlineDialog.card.badgeField')}</FieldLabel>
                    <Input
                      value={card.badge[lang]}
                      onChange={(e) => onChange({ badge: { ...card.badge, [lang]: e.target.value } })}
                      placeholder={t('configsPage.mainlineDialog.card.badgePlaceholder')}
                    />
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel>{t('configsPage.mainlineDialog.card.nameField')}</FieldLabel>
                    <Input
                      value={card.name[lang]}
                      onChange={(e) => onChange({ name: { ...card.name, [lang]: e.target.value } })}
                      onBlur={(e) => handleNameBlur(lang, e.target.value)}
                      placeholder={t('configsPage.mainlineDialog.card.namePlaceholder')}
                    />
                  </Field>
                  <Field className='gap-1'>
                    <FieldLabel>{t('configsPage.mainlineDialog.card.descriptionField')}</FieldLabel>
                    <Textarea
                      rows={2}
                      value={card.description[lang]}
                      onChange={(e) => onChange({ description: { ...card.description, [lang]: e.target.value } })}
                      placeholder={t('configsPage.mainlineDialog.card.descriptionPlaceholder')}
                    />
                  </Field>
                </div>
              )}
            />

            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.mainlineDialog.card.slugField')}</FieldLabel>
              <Input value={card.id} onChange={(e) => onChange({ id: e.target.value })} className='font-mono text-sm' />
              <FieldDescription className='text-xs'>{t('configsPage.mainlineDialog.card.slugHelp')}</FieldDescription>
            </Field>

            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.mainlineDialog.card.categoryIdsField')}</FieldLabel>
              <ChipInput
                values={card.categoryIds}
                onChange={(next) => onChange({ categoryIds: next })}
                placeholder={t('configsPage.mainlineDialog.card.categoryIdsPlaceholder')}
              />
              <FieldDescription className='text-xs'>
                {t('configsPage.mainlineDialog.card.categoryIdsHelp')}
              </FieldDescription>
            </Field>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
