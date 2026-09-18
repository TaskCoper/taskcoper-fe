import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { Briefcase, ExternalLink, LayoutDashboard } from 'lucide-react'
import { B2B_OVERVIEW_KEY, b2bServicesKeySuffix, isB2BOverviewKey } from '../../b2b-service-detail-palette'
import { B2B_SERVICE_SLUGS, type B2BServiceSlug, type Config } from '../../types'

interface Props {
  /** Every record the `b2b` category owns, from the registry. */
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

  // Records that share the group but are neither the overview nor a known slug still need to be
  // reachable, so they are listed after the fixed set rather than dropped.
  const unrecognised = configs.filter(
    (config) =>
      !isB2BOverviewKey(config.key) &&
      !(B2B_SERVICE_SLUGS as readonly string[]).includes(b2bServicesKeySuffix(config.key))
  )

  return (
    <div className='space-y-2'>
      <EntryRow
        icon={<LayoutDashboard className='size-4' />}
        title={t('configsPage.b2bServicesPalette.overviewLabel')}
        subtitle={B2B_OVERVIEW_KEY}
        configured={overview !== null}
        onOpen={onOpenOverview}
        openLabel={t('configsPage.b2b.edit')}
        notConfiguredLabel={t('configsPage.b2b.notConfigured')}
      />

      {B2B_SERVICE_SLUGS.map((slug) => (
        <EntryRow
          key={slug}
          icon={<Briefcase className='size-4' />}
          title={t(`configsPage.b2b.slug.${slug}`, { defaultValue: slug })}
          subtitle={`${B2B_OVERVIEW_KEY.split('.')[0]}.${slug}`}
          configured={bySlug.has(slug)}
          onOpen={() => onOpenService(slug)}
          openLabel={t('configsPage.b2b.edit')}
          notConfiguredLabel={t('configsPage.b2b.notConfigured')}
        />
      ))}

      {unrecognised.map((config) => (
        <EntryRow
          key={config.id}
          icon={<Briefcase className='size-4' />}
          title={config.value?.label || config.key}
          subtitle={config.key}
          configured
          onOpen={() => onOpenService(b2bServicesKeySuffix(config.key) as B2BServiceSlug)}
          openLabel={t('configsPage.b2b.edit')}
          notConfiguredLabel={t('configsPage.b2b.notConfigured')}
        />
      ))}
    </div>
  )
}

function EntryRow({
  icon,
  title,
  subtitle,
  configured,
  onOpen,
  openLabel,
  notConfiguredLabel
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  configured: boolean
  onOpen: () => void
  openLabel: string
  notConfiguredLabel: string
}) {
  return (
    <Card className={cn('flex-row items-center gap-3 rounded-xl p-3 shadow-none', !configured && 'border-dashed')}>
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-md',
          configured ? 'bg-muted text-foreground' : 'bg-muted/50 text-muted-foreground'
        )}
      >
        {icon}
      </span>

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{title}</p>
        <p className='truncate font-mono text-xs text-muted-foreground'>{subtitle}</p>
      </div>

      {configured ? (
        <Button type='button' variant='outline' size='sm' className='shrink-0' onClick={onOpen}>
          {openLabel}
          <ExternalLink data-icon='inline-end' />
        </Button>
      ) : (
        <span className='shrink-0 text-xs text-muted-foreground'>{notConfiguredLabel}</span>
      )}
    </Card>
  )
}
