import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ArrowLeft, Maximize2, SaveIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { defaultB2BOverview, parseB2BOverview } from '../features/configs/b2b-overview-palette'
import {
  B2B_SERVICE_SLUGS,
  B2B_SERVICES_KEY_PREFIX,
  b2bServicesKeySuffix,
  defaultB2BServiceDetail,
  defaultBenefitsBlock,
  defaultFaqBlock,
  defaultListBlock,
  defaultMiceBlock,
  defaultPersonalizationBlock,
  defaultStatsBlock,
  isB2BOverviewKey,
  matchesB2BServicesConfig,
  parseB2BServiceDetail,
  type B2BServiceDetail,
  type B2BServiceSlug,
  type BenefitsBlock,
  type FaqBlock,
  type ListBlock,
  type MiceBlock,
  type PersonalizationBlock,
  type StatsBlock
} from '../features/configs/b2b-service-detail-palette'
import {
  FaqListEditor,
  ImageUploadField,
  LocalizedField,
  LocalizedParagraphList,
  OptionalSection,
  RichItemListEditor,
  StatsListEditor
} from '../features/configs/components/b2b-services/b2b-section-editors'
// import { B2B_SERVICE_PRESETS } from '../features/configs/components/b2b-services/b2b-service-presets'
import { useSaveB2BService } from '../features/configs/components/b2b-services/editor/use-save-b2b-service'
import type { PreviewContact, PreviewLocale } from '../features/configs/components/b2b-services/preview/preview-shared'
import type { ServiceSibling } from '../features/configs/components/b2b-services/service-preview/service-chrome'
import { ServiceFullPagePreview } from '../features/configs/components/b2b-services/service-preview/service-full-page-preview'
import {
  ServicePreviewScrollPane,
  type ServicePreviewSelection
} from '../features/configs/components/b2b-services/service-preview/service-preview-scroll-pane'
import { useGetContentConfigs } from '../features/configs/hooks/use-get-content-configs'
import type { Config } from '../features/configs/types'

// Nav order: identity/hero/intro up front, then the optional content blocks, then closing/seo.
type NavKey =
  | 'settings'
  | 'hero'
  | 'intro'
  | 'stats'
  | 'inclusions'
  | 'mice'
  | 'schedule'
  | 'personalization'
  | 'benefits'
  | 'process'
  | 'audience'
  | 'faq'
  | 'closing'
  | 'seo'

const NAV_ORDER: NavKey[] = [
  'settings',
  'hero',
  'intro',
  'stats',
  'inclusions',
  'mice',
  'schedule',
  'personalization',
  'benefits',
  'process',
  'audience',
  'faq',
  'closing',
  'seo'
]

type OptionalSectionKey =
  | 'inclusions'
  | 'stats'
  | 'mice'
  | 'schedule'
  | 'personalization'
  | 'benefits'
  | 'process'
  | 'audience'
  | 'faq'

const OPTIONAL_KEYS: OptionalSectionKey[] = [
  'inclusions',
  'stats',
  'mice',
  'schedule',
  'personalization',
  'benefits',
  'process',
  'audience',
  'faq'
]

// Which page section the preview scrolls to for each nav entry (settings/seo focus the hero).
const NAV_TO_PREVIEW: Record<NavKey, ServicePreviewSelection> = {
  settings: 'hero',
  hero: 'hero',
  intro: 'intro',
  stats: 'stats',
  inclusions: 'inclusions',
  mice: 'mice',
  schedule: 'schedule',
  personalization: 'personalization',
  benefits: 'benefits',
  process: 'process',
  audience: 'audience',
  faq: 'faq',
  closing: 'closing',
  seo: 'hero'
}

const PREVIEW_LOCALES: PreviewLocale[] = ['vi', 'en']

// Working state keeps every optional block materialised (so toggling a section off then on
// preserves its edits) plus the set of sections the admin has switched on.
interface Working extends Omit<B2BServiceDetail, OptionalSectionKey> {
  inclusions: ListBlock
  stats: StatsBlock
  mice: MiceBlock
  schedule: ListBlock
  personalization: PersonalizationBlock
  benefits: BenefitsBlock
  process: ListBlock
  audience: ListBlock
  faq: FaqBlock
  enabledSections: Set<OptionalSectionKey>
}

const toWorking = (detail: B2BServiceDetail): Working => {
  const enabled = new Set<OptionalSectionKey>()
  for (const key of OPTIONAL_KEYS) if (detail[key] !== undefined) enabled.add(key)
  return {
    ...detail,
    inclusions: detail.inclusions ?? defaultListBlock(),
    stats: detail.stats ?? defaultStatsBlock(),
    mice: detail.mice ?? defaultMiceBlock(),
    schedule: detail.schedule ?? defaultListBlock(),
    personalization: detail.personalization ?? defaultPersonalizationBlock(),
    benefits: detail.benefits ?? defaultBenefitsBlock(),
    process: detail.process ?? defaultListBlock(),
    audience: detail.audience ?? defaultListBlock(),
    faq: detail.faq ?? defaultFaqBlock(),
    enabledSections: enabled
  }
}

// Presence rule: an optional block is stored only when enabled AND non-empty.
const listHasItems = (block: { items: unknown[] }): boolean => block.items.length > 0
const miceHasContent = (block: MiceBlock): boolean =>
  Boolean(block.heading.vi || block.heading.en || block.intro.vi || block.intro.en || block.body.vi || block.body.en)

// Materialise a Working back into the stored/rendered B2BServiceDetail shape.
const buildResolved = (working: Working): B2BServiceDetail => {
  const { enabledSections } = working
  const include = (key: OptionalSectionKey, nonEmpty: boolean) => enabledSections.has(key) && nonEmpty

  const resolved: B2BServiceDetail = {
    slug: working.slug,
    enabled: working.enabled,
    showPackagesLink: working.showPackagesLink,
    heroImage: working.heroImage,
    ogImage: working.ogImage,
    introImage: working.introImage,
    card: working.card,
    lede: working.lede,
    seo: working.seo,
    intro: working.intro,
    closing: working.closing
  }

  if (include('inclusions', listHasItems(working.inclusions))) resolved.inclusions = working.inclusions
  if (include('stats', listHasItems(working.stats))) resolved.stats = working.stats
  if (include('mice', miceHasContent(working.mice))) resolved.mice = working.mice
  if (include('schedule', listHasItems(working.schedule))) resolved.schedule = working.schedule
  if (include('personalization', listHasItems(working.personalization)))
    resolved.personalization = working.personalization
  if (include('benefits', listHasItems(working.benefits))) resolved.benefits = working.benefits
  if (include('process', listHasItems(working.process))) resolved.process = working.process
  if (include('audience', listHasItems(working.audience))) resolved.audience = working.audience
  if (include('faq', listHasItems(working.faq))) resolved.faq = working.faq

  return parseB2BServiceDetail(resolved)
}

export default function B2BServiceEditorPage() {
  const { slug: rawSlug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { contentConfigs = [], isGettingContentConfigs } = useGetContentConfigs({})

  const isValidSlug = (B2B_SERVICE_SLUGS as readonly string[]).includes(rawSlug ?? '')
  const slug = (isValidSlug ? rawSlug : B2B_SERVICE_SLUGS[0]) as B2BServiceSlug

  const b2bServiceDocs = useMemo(
    () => contentConfigs.filter((c) => matchesB2BServicesConfig(c) && !isB2BOverviewKey(c.key)),
    [contentConfigs]
  )
  const existingConfig = useMemo(
    () => b2bServiceDocs.find((c) => b2bServicesKeySuffix(c.key) === slug) ?? null,
    [b2bServiceDocs, slug]
  )

  const overviewCta = useMemo(() => {
    const overviewConfig = contentConfigs.find((c) => matchesB2BServicesConfig(c) && isB2BOverviewKey(c.key))
    return (overviewConfig ? parseB2BOverview(overviewConfig.value.value) : defaultB2BOverview()).cta
  }, [contentConfigs])

  // Sibling services (already configured) power the sidebar's "related services" list.
  const siblings = useMemo<ServiceSibling[]>(
    () =>
      b2bServiceDocs
        .filter((c) => b2bServicesKeySuffix(c.key) !== slug)
        .map((c) => {
          const detail = parseB2BServiceDetail(c.value.value)
          return { slug: detail.slug, name: detail.card.name }
        }),
    [b2bServiceDocs, slug]
  )

  const contact = useMemo<PreviewContact>(() => {
    const find = (key: string) => {
      const raw = contentConfigs.find((c) => c.key === key)?.value.value
      return typeof raw === 'string' && raw.trim() ? raw : undefined
    }
    return { phone: find('contact.phone'), email: find('contact.email'), zaloUrl: find('contact.zalo') }
  }, [contentConfigs])

  const availableSlugs = useMemo<B2BServiceSlug[]>(() => {
    const used = new Set(b2bServiceDocs.map((c) => b2bServicesKeySuffix(c.key)))
    return B2B_SERVICE_SLUGS.filter((s) => !used.has(s) || s === slug)
  }, [b2bServiceDocs, slug])

  if (isGettingContentConfigs) {
    return (
      <div className='flex h-full min-h-0 flex-col'>
        <div className='flex items-center gap-2 border-b px-4 py-3'>
          <Skeleton className='h-8 w-64' />
        </div>
        <div className='flex flex-1 gap-4 p-4'>
          <Skeleton className='h-full w-48' />
          <Skeleton className='h-full w-[26rem]' />
          <Skeleton className='h-full flex-1' />
        </div>
      </div>
    )
  }

  return (
    <B2BServiceEditor
      key={slug}
      slug={slug}
      existingConfig={existingConfig}
      siblings={siblings}
      contact={contact}
      overviewCta={overviewCta}
      availableSlugs={availableSlugs}
      onNavigateSlug={(next) =>
        navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/configs/b2b-service/${next}`, { replace: true })
      }
    />
  )
}

function B2BServiceEditor({
  slug,
  existingConfig,
  siblings,
  contact,
  overviewCta,
  availableSlugs,
  onNavigateSlug
}: {
  slug: B2BServiceSlug
  existingConfig: Config | null
  siblings: ServiceSibling[]
  contact: PreviewContact
  overviewCta: ReturnType<typeof defaultB2BOverview>['cta']
  availableSlugs: B2BServiceSlug[]
  onNavigateSlug: (slug: B2BServiceSlug) => void
}) {
  const { t } = useTenantTranslation()
  const navigate = useNavigate()
  const { save, isSaving } = useSaveB2BService()

  const [working, setWorking] = useState<Working>(() =>
    toWorking(existingConfig ? parseB2BServiceDetail(existingConfig.value.value) : defaultB2BServiceDetail(slug))
  )
  const [configLabel, setConfigLabel] = useState(
    () => existingConfig?.value.label ?? t('configsPage.b2bServicesDialog.configLabel', { slug })
  )
  const [baseline, setBaseline] = useState(() => JSON.stringify(buildResolved(working)))
  const [baselineLabel, setBaselineLabel] = useState(configLabel)
  const [selected, setSelected] = useState<NavKey>('hero')
  const [previewLocale, setPreviewLocale] = useState<PreviewLocale>('vi')
  const [editLocale, setEditLocale] = useState<PreviewLocale>('vi')
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false)

  const resolved = useMemo(() => buildResolved(working), [working])
  const isDirty = useMemo(
    () => JSON.stringify(resolved) !== baseline || configLabel !== baselineLabel,
    [resolved, baseline, configLabel, baselineLabel]
  )

  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  const patch = (next: Partial<Working>) => setWorking((prev) => ({ ...prev, ...next }))

  const toggleSection = (key: OptionalSectionKey, enabled: boolean) => {
    setWorking((prev) => {
      const nextSet = new Set(prev.enabledSections)
      if (enabled) nextSet.add(key)
      else nextSet.delete(key)
      return { ...prev, enabledSections: nextSet }
    })
  }

  const confirmDiscard = () => !isDirty || window.confirm(t('configsPage.b2bServicePage.unsavedWarning'))

  const handleBack = () => {
    if (!confirmDiscard()) return
    navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/configs`)
  }

  const handleSlugChange = (next: B2BServiceSlug) => {
    if (next === slug) return
    if (!confirmDiscard()) return
    onNavigateSlug(next)
  }

  const handleSave = async () => {
    if (!working.card.name.vi.trim()) {
      toast.error(t('configsPage.b2bServicesDialog.errors.cardNameRequired'))
      setSelected('hero')
      return
    }
    const saved = await save(resolved, existingConfig, configLabel)
    if (saved) {
      setBaseline(JSON.stringify(resolved))
      setBaselineLabel(configLabel)
      if (!existingConfig) navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/configs`)
    }
  }

  const previewData = {
    detail: resolved,
    siblings,
    contact,
    cta: overviewCta,
    locale: previewLocale,
    zaloUrl: contact.zaloUrl
  }

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='flex items-center gap-2 border-b p-2'>
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          onClick={handleBack}
          title={t('configsPage.b2bServicePage.back')}
        >
          <ArrowLeft />
        </Button>
        <div className='min-w-0 -space-y-0.5'>
          <div className='flex items-center gap-2'>
            <h1 className='truncate text-sm font-semibold'>
              {working.card.name.vi || working.card.name.en || t('configsPage.b2bServicePage.title')}
            </h1>
            {isDirty && <span className='size-1.5 shrink-0 rounded-full bg-amber-500' aria-hidden='true' />}
          </div>
          <p className='truncate font-mono text-xs text-muted-foreground'>
            {B2B_SERVICES_KEY_PREFIX}
            {slug}
          </p>
        </div>

        <div className='ml-auto flex items-center gap-2'>
          {/* <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => {
              setWorking(toWorking(B2B_SERVICE_PRESETS[slug]))
              setConfigLabel(t('configsPage.b2bServicesDialog.configLabel', { slug }))
            }}
          >
            <WandSparkles />
            {t('configsPage.b2bServicePage.fillPresetButton')}
          </Button> */}

          <div className='flex items-center rounded-md border p-0.5'>
            {PREVIEW_LOCALES.map((option) => (
              <button
                key={option}
                type='button'
                onClick={() => setPreviewLocale(option)}
                className={cn(
                  'cursor-pointer rounded-sm px-2 py-1 text-xs font-semibold uppercase transition-colors',
                  option === previewLocale ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t(`configsPage.b2bOverviewPage.previewLocale.${option}`)}
              </button>
            ))}
          </div>

          <Button type='button' variant='outline' size='sm' onClick={() => setFullPreviewOpen(true)}>
            <Maximize2 />
            {t('configsPage.b2bServicePage.previewFullPage')}
          </Button>

          <Button type='button' size='sm' disabled={!isDirty || isSaving} onClick={handleSave}>
            {isSaving ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {isSaving ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
          </Button>
        </div>
      </div>

      <div className='flex min-h-0 flex-1'>
        <nav className='w-48 shrink-0 space-y-1 overflow-y-auto border-r p-2'>
          {NAV_ORDER.map((section) => {
            const isOptional = (OPTIONAL_KEYS as string[]).includes(section)
            const isOn = isOptional && working.enabledSections.has(section as OptionalSectionKey)
            return (
              <button
                key={section}
                type='button'
                onClick={() => setSelected(section)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                  section === selected
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60'
                )}
              >
                <span className='truncate'>{t(`configsPage.b2bServicePage.section.${section}`)}</span>
                {isOptional && (
                  <span
                    className={cn(
                      'ml-auto size-1.5 shrink-0 rounded-full',
                      isOn ? 'bg-leaf' : 'bg-muted-foreground/30'
                    )}
                    aria-hidden='true'
                  />
                )}
              </button>
            )
          })}
        </nav>

        <div className='flex w-[26rem] shrink-0 flex-col overflow-hidden border-r'>
          <div className='flex items-center justify-between gap-2 border-b p-2.5'>
            <span className='text-xs font-medium text-muted-foreground'>
              {t('configsPage.b2bOverviewPage.editLocaleLabel')}
            </span>
            <div className='flex items-center rounded-md border p-0.5'>
              {PREVIEW_LOCALES.map((option) => (
                <button
                  key={option}
                  type='button'
                  onClick={() => setEditLocale(option)}
                  className={cn(
                    'cursor-pointer rounded-sm px-2 py-1 text-xs font-semibold uppercase transition-colors',
                    option === editLocale ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t(`configsPage.b2bOverviewPage.previewLocale.${option}`)}
                </button>
              ))}
            </div>
          </div>
          <div className='flex-1 overflow-y-auto p-4'>
            <ServiceForm
              selected={selected}
              working={working}
              patch={patch}
              toggleSection={toggleSection}
              editLocale={editLocale}
              slug={slug}
              existingConfig={existingConfig}
              availableSlugs={availableSlugs}
              onSlugChange={handleSlugChange}
              configLabel={configLabel}
              onConfigLabelChange={setConfigLabel}
            />
          </div>
        </div>

        <div className='relative min-w-0 flex-1 bg-muted/40'>
          <div className='mx-auto h-full w-full max-w-7xl border-x bg-background'>
            <ServicePreviewScrollPane selected={NAV_TO_PREVIEW[selected]} {...previewData} />
          </div>
          <p className='pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-[0.625rem] text-muted-foreground shadow-sm backdrop-blur'>
            {t('configsPage.b2bServicePage.previewHint')}
          </p>
        </div>
      </div>

      {fullPreviewOpen && (
        <ServiceFullPagePreview
          data={previewData}
          onLocaleChange={setPreviewLocale}
          onClose={() => setFullPreviewOpen(false)}
        />
      )}
    </div>
  )
}

// Shared editor for the four plain ListBlock sections (inclusions/schedule/process/audience).
function ListBlockEditor({
  block,
  onChange,
  locale
}: {
  block: ListBlock
  onChange: (next: ListBlock) => void
  locale: PreviewLocale
}) {
  const { t } = useTenantTranslation()
  return (
    <>
      <LocalizedField
        label={t('configsPage.b2bServicesDialog.section.heading')}
        value={block.heading}
        onChange={(heading) => onChange({ ...block, heading })}
        locale={locale}
      />
      <LocalizedField
        label={t('configsPage.b2bServicesDialog.section.subIntro')}
        value={block.subIntro}
        onChange={(subIntro) => onChange({ ...block, subIntro })}
        textarea
        locale={locale}
      />
      <RichItemListEditor items={block.items} onChange={(items) => onChange({ ...block, items })} locale={locale} />
      <LocalizedField
        label={t('configsPage.b2bServicesDialog.section.closing')}
        value={block.closing}
        onChange={(closing) => onChange({ ...block, closing })}
        textarea
        locale={locale}
      />
      <ImageUploadField
        value={block.image ?? ''}
        onChange={(image) => onChange({ ...block, image })}
        label={t('configsPage.b2bServicesDialog.fields.sectionImage')}
      />
    </>
  )
}

function ServiceForm({
  selected,
  working,
  patch,
  toggleSection,
  editLocale,
  slug,
  existingConfig,
  availableSlugs,
  onSlugChange,
  configLabel,
  onConfigLabelChange
}: {
  selected: NavKey
  working: Working
  patch: (next: Partial<Working>) => void
  toggleSection: (key: OptionalSectionKey, enabled: boolean) => void
  editLocale: PreviewLocale
  slug: B2BServiceSlug
  existingConfig: Config | null
  availableSlugs: B2BServiceSlug[]
  onSlugChange: (slug: B2BServiceSlug) => void
  configLabel: string
  onConfigLabelChange: (value: string) => void
}) {
  const { t } = useTenantTranslation()
  const locale = editLocale

  switch (selected) {
    case 'settings':
      return (
        <div className='space-y-4'>
          <Field className='gap-1'>
            <FieldLabel className='text-xs'>{t('configsPage.b2bServicesDialog.fields.configLabel')}</FieldLabel>
            <Input
              value={configLabel}
              onChange={(e) => onConfigLabelChange(e.target.value)}
              placeholder={t('configsPage.b2bServicesDialog.fields.configLabelPlaceholder')}
            />
            <FieldDescription className='text-xs'>
              {t('configsPage.b2bServicesDialog.fields.configLabelHelp')}
            </FieldDescription>
          </Field>

          <Field className='gap-1'>
            <FieldLabel className='text-xs'>{t('configsPage.b2bServicesDialog.slug.field')}</FieldLabel>
            {existingConfig ? (
              <Input value={slug} disabled className='font-mono text-sm' />
            ) : (
              <Select value={slug} onValueChange={(v) => onSlugChange(v as B2BServiceSlug)}>
                <SelectTrigger className='font-mono text-sm'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableSlugs.map((s) => (
                    <SelectItem key={s} value={s} className='font-mono'>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FieldDescription className='text-xs'>
              {B2B_SERVICES_KEY_PREFIX}
              {slug}
            </FieldDescription>
          </Field>

          <div className='flex flex-wrap items-center gap-6'>
            <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Switch checked={working.enabled} onCheckedChange={(enabled) => patch({ enabled })} />
              {t('configsPage.b2bServicesDialog.fields.enabled')}
            </Label>
            <Label className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Switch
                checked={working.showPackagesLink}
                onCheckedChange={(showPackagesLink) => patch({ showPackagesLink })}
              />
              {t('configsPage.b2bServicesDialog.fields.showPackagesLink')}
            </Label>
          </div>
        </div>
      )

    case 'hero':
      return (
        <div className='space-y-4'>
          <ImageUploadField
            value={working.heroImage}
            onChange={(heroImage) => patch({ heroImage })}
            label={t('configsPage.b2bServicesDialog.fields.heroImage')}
            description={t('configsPage.b2bServicesDialog.fields.heroImageHelp')}
            allowVideo
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.card.tag')}
            value={working.card.tag}
            onChange={(tag) => patch({ card: { ...working.card, tag } })}
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.card.name')}
            value={working.card.name}
            onChange={(name) => patch({ card: { ...working.card, name } })}
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.card.description')}
            value={working.card.description}
            onChange={(description) => patch({ card: { ...working.card, description } })}
            textarea
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.fields.lede')}
            value={working.lede}
            onChange={(lede) => patch({ lede })}
            textarea
            locale={locale}
          />
        </div>
      )

    case 'intro':
      return (
        <div className='space-y-3'>
          <p className='text-xs text-muted-foreground'>{t('configsPage.b2bServicesDialog.section.introHelp')}</p>
          <LocalizedParagraphList
            items={working.intro}
            onChange={(intro) => patch({ intro })}
            addLabel={t('configsPage.b2bServicesDialog.item.addParagraph')}
            locale={locale}
          />
          <ImageUploadField
            value={working.introImage ?? ''}
            onChange={(introImage) => patch({ introImage })}
            label={t('configsPage.b2bServicesDialog.fields.sectionImage')}
          />
        </div>
      )

    case 'stats':
      return (
        <OptionalSection
          title={t('configsPage.b2bServicesDialog.section.stats')}
          enabled={working.enabledSections.has('stats')}
          onToggle={(v) => toggleSection('stats', v)}
        >
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.section.heading')}
            value={working.stats.heading}
            onChange={(heading) => patch({ stats: { ...working.stats, heading } })}
            locale={locale}
          />
          <StatsListEditor
            items={working.stats.items}
            onChange={(items) => patch({ stats: { ...working.stats, items } })}
            locale={locale}
          />
          <ImageUploadField
            value={working.stats.image ?? ''}
            onChange={(image) => patch({ stats: { ...working.stats, image } })}
            label={t('configsPage.b2bServicesDialog.fields.sectionImage')}
          />
        </OptionalSection>
      )

    case 'inclusions':
      return (
        <OptionalSection
          title={t('configsPage.b2bServicesDialog.section.inclusions')}
          enabled={working.enabledSections.has('inclusions')}
          onToggle={(v) => toggleSection('inclusions', v)}
        >
          <ListBlockEditor
            block={working.inclusions}
            onChange={(inclusions) => patch({ inclusions })}
            locale={locale}
          />
        </OptionalSection>
      )

    case 'mice':
      return (
        <OptionalSection
          title={t('configsPage.b2bServicesDialog.section.mice')}
          enabled={working.enabledSections.has('mice')}
          onToggle={(v) => toggleSection('mice', v)}
        >
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.section.heading')}
            value={working.mice.heading}
            onChange={(heading) => patch({ mice: { ...working.mice, heading } })}
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.section.intro')}
            value={working.mice.intro}
            onChange={(intro) => patch({ mice: { ...working.mice, intro } })}
            textarea
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.section.body')}
            value={working.mice.body}
            onChange={(body) => patch({ mice: { ...working.mice, body } })}
            textarea
            rows={4}
            locale={locale}
          />
          <ImageUploadField
            value={working.mice.image ?? ''}
            onChange={(image) => patch({ mice: { ...working.mice, image } })}
            label={t('configsPage.b2bServicesDialog.fields.sectionImage')}
          />
        </OptionalSection>
      )

    case 'schedule':
      return (
        <OptionalSection
          title={t('configsPage.b2bServicesDialog.section.schedule')}
          enabled={working.enabledSections.has('schedule')}
          onToggle={(v) => toggleSection('schedule', v)}
        >
          <ListBlockEditor block={working.schedule} onChange={(schedule) => patch({ schedule })} locale={locale} />
        </OptionalSection>
      )

    case 'personalization':
      return (
        <OptionalSection
          title={t('configsPage.b2bServicesDialog.section.personalization')}
          enabled={working.enabledSections.has('personalization')}
          onToggle={(v) => toggleSection('personalization', v)}
        >
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.section.heading')}
            value={working.personalization.heading}
            onChange={(heading) => patch({ personalization: { ...working.personalization, heading } })}
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.section.intro')}
            value={working.personalization.intro}
            onChange={(intro) => patch({ personalization: { ...working.personalization, intro } })}
            textarea
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.section.subIntro')}
            value={working.personalization.subIntro}
            onChange={(subIntro) => patch({ personalization: { ...working.personalization, subIntro } })}
            textarea
            locale={locale}
          />
          <RichItemListEditor
            items={working.personalization.items}
            onChange={(items) => patch({ personalization: { ...working.personalization, items } })}
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.section.closing')}
            value={working.personalization.closing}
            onChange={(closing) => patch({ personalization: { ...working.personalization, closing } })}
            textarea
            locale={locale}
          />
          <ImageUploadField
            value={working.personalization.image ?? ''}
            onChange={(image) => patch({ personalization: { ...working.personalization, image } })}
            label={t('configsPage.b2bServicesDialog.fields.sectionImage')}
          />
        </OptionalSection>
      )

    case 'benefits':
      return (
        <OptionalSection
          title={t('configsPage.b2bServicesDialog.section.benefits')}
          enabled={working.enabledSections.has('benefits')}
          onToggle={(v) => toggleSection('benefits', v)}
        >
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.section.heading')}
            value={working.benefits.heading}
            onChange={(heading) => patch({ benefits: { ...working.benefits, heading } })}
            locale={locale}
          />
          <RichItemListEditor
            items={working.benefits.items}
            onChange={(items) => patch({ benefits: { ...working.benefits, items } })}
            locale={locale}
          />
          <ImageUploadField
            value={working.benefits.image ?? ''}
            onChange={(image) => patch({ benefits: { ...working.benefits, image } })}
            label={t('configsPage.b2bServicesDialog.fields.sectionImage')}
          />
        </OptionalSection>
      )

    case 'process':
      return (
        <OptionalSection
          title={t('configsPage.b2bServicesDialog.section.process')}
          enabled={working.enabledSections.has('process')}
          onToggle={(v) => toggleSection('process', v)}
        >
          <ListBlockEditor block={working.process} onChange={(process) => patch({ process })} locale={locale} />
        </OptionalSection>
      )

    case 'audience':
      return (
        <OptionalSection
          title={t('configsPage.b2bServicesDialog.section.audience')}
          enabled={working.enabledSections.has('audience')}
          onToggle={(v) => toggleSection('audience', v)}
        >
          <ListBlockEditor block={working.audience} onChange={(audience) => patch({ audience })} locale={locale} />
        </OptionalSection>
      )

    case 'faq':
      return (
        <OptionalSection
          title={t('configsPage.b2bServicesDialog.section.faq')}
          enabled={working.enabledSections.has('faq')}
          onToggle={(v) => toggleSection('faq', v)}
        >
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.section.heading')}
            value={working.faq.heading}
            onChange={(heading) => patch({ faq: { ...working.faq, heading } })}
            locale={locale}
          />
          <FaqListEditor
            items={working.faq.items}
            onChange={(items) => patch({ faq: { ...working.faq, items } })}
            locale={locale}
          />
          <ImageUploadField
            value={working.faq.image ?? ''}
            onChange={(image) => patch({ faq: { ...working.faq, image } })}
            label={t('configsPage.b2bServicesDialog.fields.sectionImage')}
          />
        </OptionalSection>
      )

    case 'closing':
      return (
        <div className='space-y-3'>
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.section.heading')}
            value={working.closing.heading}
            onChange={(heading) => patch({ closing: { ...working.closing, heading } })}
            locale={locale}
          />
          <LocalizedParagraphList
            items={working.closing.paragraphs}
            onChange={(paragraphs) => patch({ closing: { ...working.closing, paragraphs } })}
            addLabel={t('configsPage.b2bServicesDialog.item.addParagraph')}
            locale={locale}
          />
          <ImageUploadField
            value={working.closing.image ?? ''}
            onChange={(image) => patch({ closing: { ...working.closing, image } })}
            label={t('configsPage.b2bServicesDialog.fields.sectionImage')}
          />
        </div>
      )

    case 'seo':
      return (
        <div className='space-y-3'>
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.seo.metaTitle')}
            value={working.seo.metaTitle}
            onChange={(metaTitle) => patch({ seo: { ...working.seo, metaTitle } })}
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.seo.metaDescription')}
            value={working.seo.metaDescription}
            onChange={(metaDescription) => patch({ seo: { ...working.seo, metaDescription } })}
            textarea
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.seo.keywords')}
            value={working.seo.keywords}
            onChange={(keywords) => patch({ seo: { ...working.seo, keywords } })}
            textarea
            description={t('configsPage.b2bServicesDialog.seo.keywordsHelp')}
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.seo.ogAlt')}
            value={working.seo.ogAlt}
            onChange={(ogAlt) => patch({ seo: { ...working.seo, ogAlt } })}
            locale={locale}
          />
          <LocalizedField
            label={t('configsPage.b2bServicesDialog.seo.breadcrumb')}
            value={working.seo.breadcrumb}
            onChange={(breadcrumb) => patch({ seo: { ...working.seo, breadcrumb } })}
            locale={locale}
          />
          <ImageUploadField
            value={working.ogImage ?? ''}
            onChange={(ogImage) => patch({ ogImage })}
            label={t('configsPage.b2bServicesDialog.fields.ogImage')}
          />
          <Field className='gap-1'>
            <FieldLabel className='text-xs'>{t('configsPage.b2bServicesDialog.seo.serviceType')}</FieldLabel>
            <Input
              value={working.seo.serviceType}
              onChange={(e) => patch({ seo: { ...working.seo, serviceType: e.target.value } })}
              placeholder={t('configsPage.b2bServicesDialog.seo.serviceTypePlaceholder')}
            />
            <FieldDescription className='text-xs'>
              {t('configsPage.b2bServicesDialog.seo.serviceTypeHelp')}
            </FieldDescription>
          </Field>
        </div>
      )
  }
}
