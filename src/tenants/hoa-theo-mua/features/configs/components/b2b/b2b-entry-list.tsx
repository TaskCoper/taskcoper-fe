import { Badge } from '@/components/ui/badge'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { Briefcase, ChevronRight, LayoutDashboard } from 'lucide-react'
import type { ReactNode } from 'react'
import { B2B_OVERVIEW_KEY, b2bServicesKeySuffix, isB2BOverviewKey } from '../../b2b-service-detail-palette'
import { B2B_SERVICE_SLUGS, type B2BServiceSlug, type Config } from '../../types'
import EditorSection from '../shared/editor-section'

interface Props {
  /** Mọi record thuộc category `b2b`, lấy từ registry. */
  configs: readonly Config[]
  onOpenOverview: () => void
  onOpenService: (slug: B2BServiceSlug) => void
}

export default function B2BEntryList({ configs, onOpenOverview, onOpenService }: Props) {
  const { t } = useTenantTranslation()

  const overview = configs.find((config) => isB2BOverviewKey(config.key)) ?? null
  const bySlug = new Map(
    configs
      .filter((config) => !isB2BOverviewKey(config.key))
      .map((config) => [b2bServicesKeySuffix(config.key), config])
  )

  // Record cùng group nhưng không phải overview cũng không phải slug đã biết thì vẫn phải vào
  // được, nên xếp sau nhóm cố định thay vì bỏ đi.
  const unrecognised = configs.filter(
    (config) =>
      !isB2BOverviewKey(config.key) &&
      !(B2B_SERVICE_SLUGS as readonly string[]).includes(b2bServicesKeySuffix(config.key))
  )

  const configuredServices = B2B_SERVICE_SLUGS.filter((slug) => bySlug.has(slug)).length

  return (
    <section className='flex flex-1 flex-col'>
      <div className='flex items-center gap-2.5 border-b border-border p-4'>
        <div className='min-w-0 flex-1 -space-y-0.5'>
          <h3 className='truncate text-lg font-semibold'>{t('configsPage.b2bServicesPalette.title')}</h3>
          <p className='text-xs text-muted-foreground'>{t('configsPage.b2b.subtitle')}</p>
        </div>
      </div>

      <div className='flex-1 space-y-8 p-4'>
        <EditorSection title={t('configsPage.b2b.overviewSection')}>
          <EntryRow
            icon={<LayoutDashboard className='size-4' />}
            title={t('configsPage.b2bServicesPalette.overviewLabel')}
            subtitle={B2B_OVERVIEW_KEY}
            configured={overview !== null}
            onOpen={onOpenOverview}
          />
        </EditorSection>

        <EditorSection
          title={t('configsPage.b2b.servicesSection')}
          description={t('configsPage.b2b.servicesSectionSubtitle', {
            configured: configuredServices,
            total: B2B_SERVICE_SLUGS.length
          })}
          contentClassName='space-y-2'
        >
          {B2B_SERVICE_SLUGS.map((slug) => (
            <EntryRow
              key={slug}
              icon={<Briefcase className='size-4' />}
              title={t(`configsPage.b2b.slug.${slug}`, { defaultValue: slug })}
              subtitle={`${B2B_OVERVIEW_KEY.split('.')[0]}.${slug}`}
              configured={bySlug.has(slug)}
              onOpen={() => onOpenService(slug)}
            />
          ))}
        </EditorSection>

        {unrecognised.length > 0 && (
          <EditorSection title={t('configsPage.b2b.otherSection')} contentClassName='space-y-2'>
            {unrecognised.map((config) => (
              <EntryRow
                key={config.id}
                icon={<Briefcase className='size-4' />}
                title={config.value?.label || config.key}
                subtitle={config.key}
                configured
                onOpen={() => onOpenService(b2bServicesKeySuffix(config.key) as B2BServiceSlug)}
              />
            ))}
          </EditorSection>
        )}
      </div>
    </section>
  )
}

function EntryRow({
  icon,
  title,
  subtitle,
  configured,
  onOpen
}: {
  icon: ReactNode
  title: string
  subtitle: string
  configured: boolean
  onOpen: () => void
}) {
  const { t } = useTenantTranslation()

  const body = (
    <>
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg border',
          configured ? 'bg-background text-foreground' : 'border-dashed bg-transparent text-muted-foreground'
        )}
      >
        {icon}
      </span>

      <div className='min-w-0 flex-1'>
        <p className={cn('truncate text-sm font-medium', !configured && 'text-muted-foreground')}>{title}</p>
        <p className='truncate font-mono text-xs text-muted-foreground'>{subtitle}</p>
      </div>
    </>
  )

  if (!configured) {
    return (
      <div className='flex w-full items-center gap-3 rounded-xl border border-dashed bg-muted/30 p-2'>
        {body}
        <Badge variant='outline' className='mr-1 shrink-0 text-[0.625rem] text-muted-foreground'>
          {t('configsPage.b2b.notConfigured')}
        </Badge>
      </div>
    )
  }

  return (
    <button
      type='button'
      onClick={onOpen}
      aria-label={`${t('configsPage.b2b.edit')} - ${title}`}
      className='flex w-full cursor-pointer items-center gap-3 rounded-xl border bg-muted p-2 text-left transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none'
    >
      {body}
      <ChevronRight className='mr-1 size-4 shrink-0 text-muted-foreground' />
    </button>
  )
}
