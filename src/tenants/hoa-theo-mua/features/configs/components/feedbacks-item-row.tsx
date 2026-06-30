import { DatePickerField } from '@/components/date-picker-field'
import RatingField, { type RatingValue } from '@/components/rating-field'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { ArrowDown, ArrowUp, ChevronsUpDown, ImageIcon, Sparkles, Star, Trash2, UploadIcon } from 'lucide-react'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { FEEDBACK_SOURCES, type FeedbackItem, type FeedbackSource } from '../feedbacks-palette'

type Lang = 'vi' | 'en'

const ymdToISO = (ymd: string): string => {
  if (!ymd) return ''
  const d = new Date(`${ymd}T00:00:00`)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

const isoToYMD = (iso: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function LocalizedTabs({ renderField }: { renderField: (lang: Lang) => React.ReactNode }) {
  const { t } = useTenantTranslation()
  return (
    <Tabs defaultValue='vi'>
      <TabsList className='h-8'>
        <TabsTrigger value='vi' className='text-xs'>
          {t('configsPage.feedbacksDialog.locale.vi')}
        </TabsTrigger>
        <TabsTrigger value='en' className='text-xs'>
          {t('configsPage.feedbacksDialog.locale.en')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value='vi' className='mt-2'>
        {renderField('vi')}
      </TabsContent>
      <TabsContent value='en' className='mt-2'>
        {renderField('en')}
      </TabsContent>
    </Tabs>
  )
}

interface Props {
  uid: string
  index: number
  total: number
  item: FeedbackItem
  pendingPreviewUrl?: string
  onChange: (patch: Partial<FeedbackItem>) => void
  onRemove: () => void
  onMove: (direction: 1 | -1) => void
  onPickFile: (file: File) => void
  onClearPendingFile: () => void
}

export default function FeedbacksItemRow({
  uid,
  index,
  total,
  item,
  pendingPreviewUrl,
  onChange,
  onRemove,
  onMove,
  onPickFile,
  onClearPendingFile
}: Props) {
  const { t } = useTenantTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const displayPreview = pendingPreviewUrl || item.image || ''
  const displayName = item.customerName || t('configsPage.feedbacksDialog.item.untitled', { index: index + 1 })

  const dateForm = useForm<{ postDate: string }>({
    defaultValues: { postDate: ymdToISO(item.postDate) }
  })

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
              <span className='flex items-center gap-1.5 truncate text-xs text-muted-foreground'>
                {item.rating !== undefined && (
                  <span className='flex items-center gap-0.5 text-amber-500'>
                    <Star className='size-3 fill-current' />
                    {item.rating}
                  </span>
                )}
                <span className='truncate'>
                  {[item.area, item.flowerType].filter(Boolean).join(' · ') ||
                    t('configsPage.feedbacksDialog.item.noMeta')}
                </span>
              </span>
            </div>
            {item.isPlaceholder && (
              <Badge variant='outline' className='border-amber-300 bg-amber-50 text-[0.625rem] text-amber-700'>
                {t('configsPage.feedbacksDialog.item.demoBadge')}
              </Badge>
            )}
            {item.featured && (
              <Badge variant='outline' className='border-emerald-300 bg-emerald-50 text-[0.625rem] text-emerald-700'>
                <Sparkles className='mr-0.5 size-2.5' />
                {t('configsPage.feedbacksDialog.item.featuredBadge')}
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
            aria-label={t('configsPage.feedbacksDialog.item.moveUp')}
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
            aria-label={t('configsPage.feedbacksDialog.item.moveDown')}
          >
            <ArrowDown className='size-3.5' />
          </Button>

          <Label className='ml-1 flex items-center gap-1 text-[0.625rem] text-muted-foreground'>
            {t('configsPage.feedbacksDialog.item.featuredToggle')}
            <Switch checked={item.featured} onCheckedChange={(checked) => onChange({ featured: checked })} />
          </Label>

          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-7 text-muted-foreground hover:text-destructive'
            onClick={onRemove}
            aria-label={t('configsPage.feedbacksDialog.item.remove')}
          >
            <Trash2 className='size-3.5' />
          </Button>
        </div>
      </div>

      <AccordionContent className='p-4 rounded-b-2xl'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr]'>
          <div className='space-y-2'>
            <FieldLabel className='text-xs'>{t('configsPage.feedbacksDialog.item.image')}</FieldLabel>
            <div className='mt-1 aspect-square overflow-hidden rounded-lg border bg-muted'>
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

            <div className='mt-2 flex items-center gap-1'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='flex-1 w-full'
                onClick={() => fileRef.current?.click()}
              >
                <UploadIcon data-icon='inline-start' />
                {displayPreview
                  ? t('configsPage.feedbacksDialog.item.replaceImage')
                  : t('configsPage.feedbacksDialog.item.uploadImage')}
              </Button>

              {(pendingPreviewUrl || item.image) && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-destructive'
                  onClick={() => {
                    onClearPendingFile()
                    onChange({ image: '' })
                  }}
                >
                  <Trash2 className='size-3.5' />
                </Button>
              )}
            </div>

            <FieldDescription className='text-xs'>{t('configsPage.feedbacksDialog.item.imageHelp')}</FieldDescription>
          </div>

          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.feedbacksDialog.item.nameField')}</FieldLabel>
                <Input
                  value={item.customerName}
                  onChange={(e) => onChange({ customerName: e.target.value })}
                  placeholder={t('configsPage.feedbacksDialog.item.namePlaceholder')}
                />
                <FieldDescription className='text-xs'>
                  {t('configsPage.feedbacksDialog.item.nameHelp')}
                </FieldDescription>
              </Field>

              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.feedbacksDialog.item.areaField')}</FieldLabel>
                <Input
                  value={item.area}
                  onChange={(e) => onChange({ area: e.target.value })}
                  placeholder={t('configsPage.feedbacksDialog.item.areaPlaceholder')}
                />
              </Field>

              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.feedbacksDialog.item.flowerTypeField')}</FieldLabel>
                <Input
                  value={item.flowerType}
                  onChange={(e) => onChange({ flowerType: e.target.value })}
                  placeholder={t('configsPage.feedbacksDialog.item.flowerTypePlaceholder')}
                />
              </Field>

              <DatePickerField
                control={dateForm.control}
                name='postDate'
                label={'configsPage.feedbacksDialog.item.postDateField' as I18nKey}
                placeholder={'configsPage.feedbacksDialog.item.postDatePlaceholder' as I18nKey}
                isRequired
                displayError={false}
                onValueChange={(iso) => onChange({ postDate: isoToYMD(iso) })}
                maxDate={new Date()}
              />

              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.feedbacksDialog.item.sourceField')}</FieldLabel>
                <Select value={item.source} onValueChange={(value) => onChange({ source: value as FeedbackSource })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_SOURCES.map((src) => (
                      <SelectItem key={src} value={src}>
                        {t(`configsPage.feedbacksDialog.item.source.${src}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field className='gap-1'>
                <FieldLabel>{t('configsPage.feedbacksDialog.item.sourceUrlField')}</FieldLabel>
                <Input
                  value={item.sourceUrl}
                  onChange={(e) => onChange({ sourceUrl: e.target.value })}
                  placeholder='https://...'
                />
              </Field>
            </div>

            <Field className='gap-1'>
              <FieldLabel>{t('configsPage.feedbacksDialog.item.ratingField')}</FieldLabel>
              <div className='flex items-center gap-3'>
                <RatingField
                  value={item.rating}
                  setValue={(value: RatingValue | undefined) => onChange({ rating: value })}
                  size={22}
                />
                <span className='text-xs text-muted-foreground'>
                  {item.rating !== undefined
                    ? t('configsPage.feedbacksDialog.item.ratingValue', { value: item.rating })
                    : t('configsPage.feedbacksDialog.item.ratingEmpty')}
                </span>
              </div>
              <FieldDescription className='text-xs'>
                {t('configsPage.feedbacksDialog.item.ratingHelp')}
              </FieldDescription>
            </Field>

            <LocalizedTabs
              renderField={(lang) => (
                <Field className='gap-1'>
                  <FieldLabel>{t('configsPage.feedbacksDialog.item.contentField')}</FieldLabel>
                  <Textarea
                    rows={4}
                    value={item.content[lang]}
                    onChange={(e) => onChange({ content: { ...item.content, [lang]: e.target.value } })}
                    placeholder={t('configsPage.feedbacksDialog.item.contentPlaceholder')}
                  />
                  <FieldDescription className='text-xs'>
                    {t('configsPage.feedbacksDialog.item.contentHelp')}
                  </FieldDescription>
                </Field>
              )}
            />

            <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Switch
                checked={item.isPlaceholder}
                onCheckedChange={(checked) => onChange({ isPlaceholder: checked })}
              />
              {t('configsPage.feedbacksDialog.item.placeholderToggle')}
            </Label>
            <FieldDescription className='text-xs'>
              {t('configsPage.feedbacksDialog.item.placeholderHelp')}
            </FieldDescription>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
