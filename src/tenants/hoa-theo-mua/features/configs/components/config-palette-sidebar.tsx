import { Separator } from '@/components/ui/separator'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { GalleryHorizontalEnd, MessageSquareHeart, Plus, ShoppingBag, Tags, Warehouse } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { bannerKeySuffix } from '../banners-palette'
import { feedbacksKeySuffix } from '../feedbacks-palette'
import { LOCKED_ASYNC_CONFIG_KEYS } from '../locked-config-keys'
import { productCollectionKeySuffix } from '../product-collection-palette'
import { InputType, type Config, type InputOption } from '../types'

interface LockedPaletteItem {
  key: string
  label: string
  inputType: InputType
  options: InputOption[]
  defaultValue: unknown
}

type Tone = 'emerald' | 'rose' | 'sky' | 'amber'

interface Props {
  depotOptions: InputOption[]
  orderTagOptions: InputOption[]
  productCollectionConfigs: Config[]
  feedbacksConfigs: Config[]
  bannersConfigs: Config[]
  onCreateLocked: (item: LockedPaletteItem) => void
  onOpenProductCollection: (config: Config | null) => void
  onOpenFeedbacks: (config: Config | null) => void
  onOpenBanners: (config: Config | null) => void
}

export default function ConfigPaletteSidebar({
  depotOptions,
  orderTagOptions,
  productCollectionConfigs,
  feedbacksConfigs,
  bannersConfigs,
  onCreateLocked,
  onOpenProductCollection,
  onOpenFeedbacks,
  onOpenBanners
}: Props) {
  const { t } = useTenantTranslation()

  const lockedPalette = useMemo<Array<LockedPaletteItem & { icon: ReactNode; color: string; bg: string }>>(
    () => [
      {
        key: LOCKED_ASYNC_CONFIG_KEYS.defaultDepot,
        label: t('configsPage.palette.defaultDepot'),
        inputType: InputType.select,
        icon: <Warehouse className='size-4' />,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        options: depotOptions,
        defaultValue: undefined as unknown
      },
      {
        key: LOCKED_ASYNC_CONFIG_KEYS.orderTags,
        label: t('configsPage.palette.orderTags'),
        inputType: InputType.multiSelect,
        icon: <Tags className='size-4' />,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        options: orderTagOptions,
        defaultValue: [] as unknown
      }
    ],
    [depotOptions, orderTagOptions, t]
  )

  return (
    <div className='w-80 shrink-0 overflow-y-auto border-l'>
      <div className='px-2 py-4'>
        {/* Async-backed */}
        <PaletteSection title={t('configsPage.lockedPalette.title')}>
          {lockedPalette.map((item) => (
            <button
              key={item.key}
              type='button'
              className='flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
              onClick={() => onCreateLocked(item)}
            >
              <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md', item.bg, item.color)}>
                {item.icon}
              </span>
              <span className='truncate'>{item.label}</span>
            </button>
          ))}
        </PaletteSection>

        <Separator className='my-5' />

        {/* Product collections (unified: mainline, occasions, featured, …) */}
        <CollectionPaletteList
          title={t('configsPage.productCollectionPalette.title')}
          icon={<ShoppingBag className='size-4' />}
          tone='sky'
          configs={productCollectionConfigs}
          suffixOf={productCollectionKeySuffix}
          emptyLabel={t('configsPage.productCollectionPalette.emptyList')}
          newLabel={t('configsPage.productCollectionPalette.newLabel')}
          onSelect={onOpenProductCollection}
        />

        <Separator className='my-5' />

        {/* Feedbacks */}
        <CollectionPaletteList
          title={t('configsPage.feedbacksPalette.title')}
          icon={<MessageSquareHeart className='size-4' />}
          tone='rose'
          configs={feedbacksConfigs}
          suffixOf={feedbacksKeySuffix}
          emptyLabel={t('configsPage.feedbacksPalette.emptyList')}
          newLabel={t('configsPage.feedbacksPalette.newLabel')}
          onSelect={onOpenFeedbacks}
        />

        <Separator className='my-5' />

        {/* Banners */}
        <CollectionPaletteList
          title={t('configsPage.bannersPalette.title')}
          icon={<GalleryHorizontalEnd className='size-4' />}
          tone='amber'
          configs={bannersConfigs}
          suffixOf={bannerKeySuffix}
          emptyLabel={t('configsPage.bannersPalette.emptyList')}
          newLabel={t('configsPage.bannersPalette.newLabel')}
          onSelect={onOpenBanners}
        />
      </div>
    </div>
  )
}

function PaletteSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className='mb-2 px-2 text-xs font-medium text-muted-foreground/80'>{title}</div>
      <div className='space-y-1'>{children}</div>
    </div>
  )
}

const TONES: Record<Tone, { iconBg: string; dot: string }> = {
  emerald: { iconBg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
  rose: { iconBg: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
  sky: { iconBg: 'bg-sky-50 text-sky-600', dot: 'bg-sky-500' },
  amber: { iconBg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' }
}

function CollectionPaletteList({
  title,
  icon,
  tone,
  configs,
  suffixOf,
  emptyLabel,
  newLabel,
  onSelect
}: {
  title: string
  icon: ReactNode
  tone: Tone
  configs: Config[]
  suffixOf: (key: string) => string
  emptyLabel: string
  newLabel: string
  onSelect: (config: Config | null) => void
}) {
  const tones = TONES[tone]

  return (
    <PaletteSection title={title}>
      {configs.length === 0 ? (
        <p className='px-2 text-xs text-muted-foreground'>{emptyLabel}</p>
      ) : (
        configs.map((config) => (
          <button
            key={config.id}
            type='button'
            className='flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
            onClick={() => onSelect(config)}
            title={config.key}
          >
            <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md', tones.iconBg)}>
              {icon}
            </span>
            <span className='flex-1 truncate font-mono text-xs'>{suffixOf(config.key)}</span>
            <span className={cn('size-1.5 shrink-0 rounded-full', tones.dot)} aria-hidden='true' />
          </button>
        ))
      )}

      <button
        type='button'
        className='mt-1 flex w-full cursor-pointer items-center gap-2.5 rounded-md border border-dashed px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground'
        onClick={() => onSelect(null)}
      >
        <span className='flex size-6 shrink-0 items-center justify-center rounded-md bg-muted'>
          <Plus className='size-3.5' />
        </span>
        <span className='flex-1 truncate'>{newLabel}</span>
      </button>
    </PaletteSection>
  )
}
