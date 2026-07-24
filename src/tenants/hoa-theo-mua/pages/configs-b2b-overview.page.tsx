import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ArrowLeft, Maximize2, SaveIcon, WandSparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import { defaultB2BOverview, parseB2BOverview, type B2BOverview } from '../features/configs/b2b-overview-palette'
import {
  B2B_SERVICE_SLUGS,
  b2bServicesKeySuffix,
  isB2BOverviewKey,
  matchesB2BServicesConfig,
  parseB2BServiceDetail
} from '../features/configs/b2b-service-detail-palette'
import { B2B_OVERVIEW_PRESET } from '../features/configs/components/b2b-services/b2b-overview-preset'
import { AdvantagesForm } from '../features/configs/components/b2b-services/editor/advantages-form'
import { CaseStudiesForm } from '../features/configs/components/b2b-services/editor/case-studies-form'
import { CtaForm } from '../features/configs/components/b2b-services/editor/cta-form'
import { FaqForm } from '../features/configs/components/b2b-services/editor/faq-form'
import { HeroForm } from '../features/configs/components/b2b-services/editor/hero-form'
import { PackagesForm } from '../features/configs/components/b2b-services/editor/packages-form'
import { PartnersForm } from '../features/configs/components/b2b-services/editor/partners-form'
import { ProcessForm } from '../features/configs/components/b2b-services/editor/process-form'
import { ServicesForm } from '../features/configs/components/b2b-services/editor/services-form'
import { TrustBarForm } from '../features/configs/components/b2b-services/editor/trust-bar-form'
import { useSaveB2BOverview } from '../features/configs/components/b2b-services/editor/use-save-b2b-overview'
import { FullPagePreview } from '../features/configs/components/b2b-services/preview/full-page-preview'
import {
  PreviewScrollPane,
  type PreviewSelection
} from '../features/configs/components/b2b-services/preview/preview-scroll-pane'
import type {
  PreviewContact,
  PreviewLocale,
  ServiceCardData
} from '../features/configs/components/b2b-services/preview/preview-shared'
import { useGetContentConfigs } from '../features/configs/hooks/use-get-content-configs'
import type { Config } from '../features/configs/types'

// `partners` lives at `caseStudies.partners` but gets its own nav entry/form.
type SectionId = PreviewSelection

const SECTION_ORDER: SectionId[] = [
  'hero',
  'trustBar',
  'services',
  'caseStudies',
  'partners',
  'packages',
  'advantages',
  'process',
  'faq',
  'cta'
]

const PREVIEW_LOCALES: PreviewLocale[] = ['vi', 'en']

export default function B2BOverviewEditorPage() {
  const { contentConfigs = [], isGettingContentConfigs } = useGetContentConfigs({})

  const b2bServicesConfigs = useMemo(() => contentConfigs.filter(matchesB2BServicesConfig), [contentConfigs])
  const overviewConfig = useMemo(
    () => b2bServicesConfigs.find((c) => isB2BOverviewKey(c.key)) ?? null,
    [b2bServicesConfigs]
  )

  // Missing slugs get a placeholder so the services grid always previews with the real layout.
  const cards = useMemo<Record<string, ServiceCardData>>(() => {
    const result: Record<string, ServiceCardData> = {}
    for (const slug of B2B_SERVICE_SLUGS) {
      result[slug] = { tag: { vi: '—', en: '—' }, name: { vi: slug, en: slug }, description: { vi: '', en: '' } }
    }
    for (const config of b2bServicesConfigs) {
      if (isB2BOverviewKey(config.key)) continue
      result[b2bServicesKeySuffix(config.key)] = parseB2BServiceDetail(config.value.value).card
    }
    return result
  }, [b2bServicesConfigs])

  const contact = useMemo<PreviewContact>(() => {
    const find = (key: string) => {
      const raw = contentConfigs.find((c) => c.key === key)?.value.value
      return typeof raw === 'string' && raw.trim() ? raw : undefined
    }
    return { phone: find('contact.phone'), email: find('contact.email'), zaloUrl: find('contact.zalo') }
  }, [contentConfigs])

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

  return <B2BOverviewEditor overviewConfig={overviewConfig} cards={cards} contact={contact} />
}

// Seeds its working copy once from the fetched doc; post-save refetches don't clobber it.
function B2BOverviewEditor({
  overviewConfig,
  cards,
  contact
}: {
  overviewConfig: Config | null
  cards: Record<string, ServiceCardData>
  contact: PreviewContact
}) {
  const { t } = useTenantTranslation()
  const navigate = useNavigate()
  const { save, isSaving } = useSaveB2BOverview()

  const [working, setWorking] = useState<B2BOverview>(() =>
    overviewConfig ? parseB2BOverview(overviewConfig.value.value) : defaultB2BOverview()
  )
  const [baseline, setBaseline] = useState(() => JSON.stringify(parseB2BOverview(working)))
  const [selected, setSelected] = useState<SectionId>('hero')
  const [previewLocale, setPreviewLocale] = useState<PreviewLocale>('vi')
  const [editLocale, setEditLocale] = useState<PreviewLocale>('vi')
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false)

  const isDirty = useMemo(() => JSON.stringify(parseB2BOverview(working)) !== baseline, [working, baseline])

  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  // Keeps other slices' referential identity so their memoized previews skip re-rendering.
  const patch = <K extends keyof B2BOverview>(key: K, next: B2BOverview[K]) =>
    setWorking((prev) => ({ ...prev, [key]: next }))

  const handleBack = () => {
    if (isDirty && !window.confirm(t('configsPage.b2bOverviewPage.unsavedWarning'))) return
    navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/configs`)
  }

  const handleSave = async () => {
    const saved = await save(working, overviewConfig)
    if (saved) setBaseline(JSON.stringify(parseB2BOverview(working)))
  }

  const renderForm = () => {
    switch (selected) {
      case 'hero':
        return <HeroForm value={working.hero} onChange={(next) => patch('hero', next)} locale={editLocale} />
      case 'trustBar':
        return (
          <TrustBarForm value={working.trustBar} onChange={(next) => patch('trustBar', next)} locale={editLocale} />
        )
      case 'services':
        return (
          <ServicesForm value={working.services} onChange={(next) => patch('services', next)} locale={editLocale} />
        )
      case 'caseStudies':
        return (
          <CaseStudiesForm
            value={working.caseStudies}
            onChange={(next) => patch('caseStudies', next)}
            locale={editLocale}
          />
        )
      case 'partners':
        return (
          <PartnersForm
            value={working.caseStudies.partners}
            onChange={(partners) => patch('caseStudies', { ...working.caseStudies, partners })}
            locale={editLocale}
          />
        )
      case 'packages':
        return (
          <PackagesForm value={working.packages} onChange={(next) => patch('packages', next)} locale={editLocale} />
        )
      case 'advantages':
        return (
          <AdvantagesForm
            value={working.advantages}
            onChange={(next) => patch('advantages', next)}
            locale={editLocale}
          />
        )
      case 'process':
        return <ProcessForm value={working.process} onChange={(next) => patch('process', next)} locale={editLocale} />
      case 'faq':
        return <FaqForm value={working.faq} onChange={(next) => patch('faq', next)} locale={editLocale} />
      case 'cta':
        return <CtaForm value={working.cta} onChange={(next) => patch('cta', next)} locale={editLocale} />
    }
  }

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='flex items-center gap-2 border-b p-2'>
        <Button
          type='button'
          variant='ghost'
          size='icon-sm'
          onClick={handleBack}
          title={t('configsPage.b2bOverviewPage.back')}
        >
          <ArrowLeft />
        </Button>
        <div className='min-w-0 -space-y-0.5'>
          <div className='flex items-center gap-2'>
            <h1 className='truncate text-sm font-semibold'>{t('configsPage.b2bOverviewPage.title')}</h1>
            {isDirty && <span className='size-1.5 shrink-0 rounded-full bg-amber-500' aria-hidden='true' />}
          </div>
          <p className='truncate text-xs text-muted-foreground'>{t('configsPage.b2bOverviewDialog.subtitle')}</p>
        </div>

        <div className='ml-auto flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setWorking(parseB2BOverview(B2B_OVERVIEW_PRESET))}
          >
            <WandSparkles />
            {t('configsPage.b2bOverviewDialog.fillPresetButton')}
          </Button>

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
            {t('configsPage.b2bOverviewPage.previewFullPage')}
          </Button>

          <Button type='button' size='sm' disabled={!isDirty || isSaving} onClick={handleSave}>
            {isSaving ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
            {isSaving ? t('configsPage.dialog.saving') : t('configsPage.dialog.save')}
          </Button>
        </div>
      </div>

      <div className='flex min-h-0 flex-1'>
        <nav className='w-48 shrink-0 space-y-1 overflow-y-auto border-r p-2'>
          {SECTION_ORDER.map((section) => (
            <button
              key={section}
              type='button'
              onClick={() => setSelected(section)}
              className={cn(
                'flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                section === selected
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60'
              )}
            >
              <span className='truncate'>{t(`configsPage.b2bOverviewDialog.section.${section}`)}</span>
            </button>
          ))}
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
          <div className='flex-1 overflow-y-auto p-4'>{renderForm()}</div>
        </div>

        <div className='relative min-w-0 flex-1 bg-muted/40'>
          <div className='mx-auto h-full w-full max-w-7xl border-x bg-background'>
            <PreviewScrollPane
              selected={selected}
              overview={working}
              cards={cards}
              contact={contact}
              locale={previewLocale}
            />
          </div>
          <p className='pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-[0.625rem] text-muted-foreground shadow-sm backdrop-blur'>
            {t('configsPage.b2bOverviewPage.previewHint')}
          </p>
        </div>
      </div>

      {fullPreviewOpen && (
        <FullPagePreview
          overview={working}
          cards={cards}
          contact={contact}
          locale={previewLocale}
          onLocaleChange={setPreviewLocale}
          onClose={() => setFullPreviewOpen(false)}
        />
      )}
    </div>
  )
}
