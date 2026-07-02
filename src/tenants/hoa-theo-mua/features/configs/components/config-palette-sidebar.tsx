import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import type { AhamoveServiceRequest } from '@/tenants/hoa-theo-mua/types/ahamove.type'
import {
  AlignLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  FileIcon,
  Flower2Icon,
  LayoutGrid,
  ListChecks,
  MapPin,
  MessageSquareHeart,
  Store,
  Tags,
  ToggleLeft,
  Truck,
  Type,
  Warehouse
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { LOCKED_ASYNC_CONFIG_KEYS } from '../locked-config-keys'
import { InputType, type Config, type InputOption } from '../types'

interface LockedPaletteItem {
  key: string
  label: string
  inputType: InputType
  options: InputOption[]
  defaultValue: unknown
}

interface Props {
  depotOptions: InputOption[]
  orderTagOptions: InputOption[]
  orderSourceOptions: InputOption[]
  occasionsConfig: Config | null
  mainlineConfig: Config | null
  feedbacksConfig: Config | null
  ahamoveRequests: AhamoveServiceRequest[]
  isGettingAhamoveService: boolean
  language: string | undefined
  onCreateStatic: (inputType: InputType, options?: InputOption[]) => void
  onCreateLocked: (item: LockedPaletteItem) => void
  onOpenOccasions: () => void
  onOpenMainline: () => void
  onOpenFeedbacks: () => void
  onSelectAhamove: (request: AhamoveServiceRequest) => void
}

export default function ConfigPaletteSidebar({
  depotOptions,
  orderTagOptions,
  orderSourceOptions,
  occasionsConfig,
  mainlineConfig,
  feedbacksConfig,
  ahamoveRequests,
  isGettingAhamoveService,
  language,
  onCreateStatic,
  onCreateLocked,
  onOpenOccasions,
  onOpenMainline,
  onOpenFeedbacks,
  onSelectAhamove
}: Props) {
  const { t } = useTenantTranslation()

  const genericPalette = useMemo(
    () => [
      {
        label: t('configsPage.palette.singleLineText'),
        inputType: InputType.text,
        icon: <Type className='size-4' />,
        color: 'text-red-500',
        bg: 'bg-red-50'
      },
      {
        label: t('configsPage.palette.multiLineText'),
        inputType: InputType.textarea,
        icon: <AlignLeft className='size-4' />,
        color: 'text-blue-500',
        bg: 'bg-blue-50'
      },
      {
        label: t('configsPage.palette.checkbox'),
        inputType: InputType.boolean,
        icon: <CheckCircle2 className='size-4' />,
        color: 'text-yellow-500',
        bg: 'bg-yellow-50'
      },
      {
        label: t('configsPage.palette.dropdown'),
        inputType: InputType.select,
        icon: <ChevronDown className='size-4' />,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50'
      },
      {
        label: t('configsPage.palette.multiSelect'),
        inputType: InputType.multiSelect,
        icon: <ListChecks className='size-4' />,
        color: 'text-pink-600',
        bg: 'bg-pink-50'
      },
      {
        label: t('configsPage.palette.file'),
        inputType: InputType.file,
        icon: <FileIcon className='size-4' />,
        color: 'text-orange-500',
        bg: 'bg-orange-50'
      },
      {
        label: t('configsPage.palette.toggleButton'),
        inputType: InputType.switch,
        icon: <ToggleLeft className='size-4' />,
        color: 'text-purple-500',
        bg: 'bg-purple-50'
      },
      {
        label: t('configsPage.palette.dateAndTime'),
        inputType: InputType.date,
        icon: <Calendar className='size-4' />,
        color: 'text-blue-500',
        bg: 'bg-blue-50'
      },
      {
        label: t('configsPage.palette.address'),
        inputType: InputType.address,
        icon: <MapPin className='size-4' />,
        color: 'text-red-500',
        bg: 'bg-red-50'
      }
    ],
    [t]
  )

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
      },
      {
        key: LOCKED_ASYNC_CONFIG_KEYS.orderSources,
        label: t('configsPage.palette.orderSources'),
        inputType: InputType.select,
        icon: <Store className='size-4' />,
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
        options: orderSourceOptions,
        defaultValue: [] as unknown
      }
    ],
    [depotOptions, orderTagOptions, orderSourceOptions, t]
  )

  return (
    <div className='w-80 shrink-0 overflow-y-auto border-l'>
      <div className='px-2 py-4'>
        {/* Generic — single-click fields */}
        <PaletteSection title={t('configsPage.palette.title')}>
          {genericPalette.map((item) => (
            <button
              key={item.label}
              type='button'
              className='flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
              onClick={() => onCreateStatic(item.inputType)}
            >
              <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md', item.bg, item.color)}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </PaletteSection>

        <Separator className='my-5' />

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

        {/* Mainline */}
        <PaletteSection title={t('configsPage.mainlinePalette.title')}>
          <CollectionPaletteButton
            icon={<LayoutGrid className='size-4' />}
            tone='sky'
            label={t('configsPage.mainlinePalette.openEditor')}
            hint={
              mainlineConfig ? t('configsPage.mainlinePalette.existsHint') : t('configsPage.mainlinePalette.emptyHint')
            }
            configured={Boolean(mainlineConfig)}
            onClick={onOpenMainline}
          />
        </PaletteSection>

        <Separator className='my-5' />

        {/* Occasions */}
        <PaletteSection title={t('configsPage.occasionsPalette.title')}>
          <CollectionPaletteButton
            icon={<Flower2Icon className='size-4' />}
            tone='emerald'
            label={t('configsPage.occasionsPalette.openEditor')}
            hint={
              occasionsConfig
                ? t('configsPage.occasionsPalette.existsHint')
                : t('configsPage.occasionsPalette.emptyHint')
            }
            configured={Boolean(occasionsConfig)}
            onClick={onOpenOccasions}
          />
        </PaletteSection>

        <Separator className='my-5' />

        {/* Feedbacks */}
        <PaletteSection title={t('configsPage.feedbacksPalette.title')}>
          <CollectionPaletteButton
            icon={<MessageSquareHeart className='size-4' />}
            tone='rose'
            label={t('configsPage.feedbacksPalette.openEditor')}
            hint={
              feedbacksConfig
                ? t('configsPage.feedbacksPalette.existsHint')
                : t('configsPage.feedbacksPalette.emptyHint')
            }
            configured={Boolean(feedbacksConfig)}
            onClick={onOpenFeedbacks}
          />
        </PaletteSection>

        <Separator className='my-5' />

        {/* Ahamove */}
        <PaletteSection title={t('configsPage.ahamovePalette.title')}>
          {isGettingAhamoveService ? (
            <div className='space-y-1.5'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-8 w-full' />
              ))}
            </div>
          ) : ahamoveRequests.length === 0 ? (
            <p className='px-2 text-xs text-muted-foreground'>{t('configsPage.ahamovePalette.empty')}</p>
          ) : (
            ahamoveRequests.map((request) => {
              const label =
                (language?.toLowerCase().startsWith('vi') ? request.name_vi_vn : request.name_en_us) ||
                request.name ||
                request._id

              return (
                <button
                  key={request._id}
                  type='button'
                  className='flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
                  onClick={() => onSelectAhamove(request)}
                  title={label}
                >
                  <span className='flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600'>
                    {request.icon_url ? (
                      <img
                        src={request.icon_url}
                        alt=''
                        className='size-4 object-contain'
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Truck className='size-4' />
                    )}
                  </span>
                  <span className='truncate'>{label}</span>
                </button>
              )
            })
          )}
        </PaletteSection>
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

function CollectionPaletteButton({
  icon,
  tone,
  label,
  hint,
  configured,
  onClick
}: {
  icon: ReactNode
  tone: 'emerald' | 'rose' | 'sky'
  label: string
  hint: string
  configured: boolean
  onClick: () => void
}) {
  const tones = {
    emerald: { iconBg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
    rose: { iconBg: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
    sky: { iconBg: 'bg-sky-50 text-sky-600', dot: 'bg-sky-500' }
  }[tone]

  return (
    <button
      type='button'
      className='flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
      onClick={onClick}
      title={hint}
    >
      <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md', tones.iconBg)}>{icon}</span>
      <span className='flex-1 truncate'>{label}</span>
      {configured && <span className={cn('size-1.5 shrink-0 rounded-full', tones.dot)} aria-hidden='true' />}
    </button>
  )
}
