import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import {
  AlignLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ImageIcon,
  ListChecks,
  MapPin,
  MoreVertical,
  Plus,
  Tags,
  ToggleLeft,
  Truck,
  Type,
  Warehouse
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import AhamoveCreateConfigDialog from '../features/configs/components/ahamove-create-config-dialog'
import ConfigFieldRow from '../features/configs/components/config-field-row'
import CreateConfigDialog from '../features/configs/components/create-config-dialog'
import UpdateConfigDialog from '../features/configs/components/update-config-dialog'
import { useGetConfigs } from '../features/configs/hooks/use-get-configs'
import { LOCKED_ASYNC_CONFIG_KEYS } from '../features/configs/locked-config-keys'
import type { Config, InputOption } from '../features/configs/types'
import { InputType } from '../features/configs/types'
import type { CreateConfigFormInput } from '../features/configs/validations'
import { useGetAhamoveService } from '../hooks/use-get-ahamove-service'
import { useGetDepots } from '../hooks/use-get-depots'
import { useGetOrderTags } from '../hooks/use-get-order-tags'
import type { AhamoveServiceRequest } from '../types/ahamove.type'

type LockedFields = { key?: boolean; options?: boolean }

export default function ConfigsPage() {
  const { t, i18n } = useTenantTranslation()
  const { configs, isGettingConfigs } = useGetConfigs()
  const { depots } = useGetDepots()
  const { orderTags } = useGetOrderTags()
  const { requests: ahamoveRequests, isGettingAhamoveService } = useGetAhamoveService()

  const [createOpen, setCreateOpen] = useState(false)
  const [createInitialValues, setCreateInitialValues] = useState<Partial<CreateConfigFormInput>>()
  const [createLockedFields, setCreateLockedFields] = useState<LockedFields | undefined>()
  const [selectedAhamoveRequest, setSelectedAhamoveRequest] = useState<AhamoveServiceRequest | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)

  const depotOptions = useMemo<InputOption[]>(
    () => depots.map((depot) => ({ label: depot.name, value: depot.id })),
    [depots]
  )

  const orderTagOptions = useMemo<InputOption[]>(
    () => orderTags.map((tag) => ({ label: tag.name, value: tag.id })),
    [orderTags]
  )

  const liveOptionsByKey = useMemo<Record<string, InputOption[]>>(
    () => ({
      [LOCKED_ASYNC_CONFIG_KEYS.defaultDepot]: depotOptions,
      [LOCKED_ASYNC_CONFIG_KEYS.orderTags]: orderTagOptions
    }),
    [depotOptions, orderTagOptions]
  )

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
        label: t('configsPage.palette.image'),
        inputType: InputType.image,
        icon: <ImageIcon className='size-4' />,
        color: 'text-sky-500',
        bg: 'bg-sky-50'
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

  const lockedPalette = useMemo(
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

  const groups = useMemo(() => {
    if (!configs) return []
    const seen = new Set<string>()
    const result: string[] = []
    for (const config of configs) {
      if (!seen.has(config.value.group)) {
        seen.add(config.value.group)
        result.push(config.value.group)
      }
    }
    return result
  }, [configs])

  const [activeGroup, setActiveGroup] = useState<string>()
  const currentGroup = activeGroup ?? groups[0] ?? ''

  const groupedConfigs = useMemo(() => {
    if (!configs) return {} as Record<string, Config[]>
    return configs.reduce<Record<string, Config[]>>((acc, config) => {
      const g = config.value.group
      if (!acc[g]) acc[g] = []
      acc[g].push(config)
      return acc
    }, {})
  }, [configs])

  const openCreate = useCallback((initial: Partial<CreateConfigFormInput>, locked?: LockedFields) => {
    setCreateInitialValues(initial)
    setCreateLockedFields(locked)
    setCreateOpen(true)
  }, [])

  const openStaticPaletteCreate = useCallback(
    (inputType: InputType, options?: InputOption[]) => {
      openCreate({
        key: currentGroup ? `${currentGroup}.` : '',
        value: {
          group: currentGroup,
          label: '',
          inputType,
          value: inputType === InputType.multiSelect ? [] : undefined,
          required: false,
          options: options ?? [],
          validations: []
        }
      })
    },
    [openCreate, currentGroup]
  )

  const openLockedPaletteCreate = useCallback(
    (item: { key: string; label: string; inputType: InputType; options: InputOption[]; defaultValue: unknown }) => {
      const existing = configs?.find((c) => c.key === item.key)
      if (existing) {
        setEditingConfig(existing)
        setEditOpen(true)
        return
      }
      const [group] = item.key.split('.')
      openCreate(
        {
          key: item.key,
          value: {
            group,
            label: item.label,
            inputType: item.inputType,
            value: item.defaultValue,
            required: false,
            options: item.options,
            validations: []
          }
        },
        { key: true, options: true }
      )
    },
    [configs, openCreate]
  )

  const openEdit = useCallback((config: Config) => {
    setEditingConfig(config)
    setEditOpen(true)
  }, [])

  const closeEdit = useCallback(() => {
    setEditOpen(false)
  }, [])

  return (
    <div className='flex h-full min-h-0'>
      <div className='flex min-w-0 flex-1 flex-col gap-4 p-6'>
        <nav className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          <span>{t('configsPage.breadcrumb')}</span>
          <ChevronDown className='size-3.5 -rotate-90' />
          <span className='capitalize'>{currentGroup || '—'}</span>
        </nav>

        <div className='flex items-start justify-between'>
          <h1 className='text-2xl font-bold capitalize'>{currentGroup || t('configsPage.fallbackTitle')}</h1>
        </div>

        {isGettingConfigs ? (
          <div className='space-y-2'>
            <div className='flex gap-4 border-b pb-2'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-8 w-28' />
              ))}
            </div>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='h-20 w-full' />
            ))}
          </div>
        ) : (
          <Tabs value={currentGroup} onValueChange={(v) => setActiveGroup(v)} className='flex flex-col gap-0'>
            <div className='flex items-center'>
              <TabsList className='h-auto gap-0 rounded-none bg-transparent p-0'>
                {groups.map((group) => (
                  <TabsTrigger
                    key={group}
                    value={group}
                    className={cn(
                      'relative h-9 rounded-none border-b-2 border-b-transparent px-4 text-sm font-medium capitalize text-muted-foreground shadow-none transition-none',
                      'data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none'
                    )}
                  >
                    {group}
                  </TabsTrigger>
                ))}

                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground first:ml-0 ml-2'
                  onClick={() => openStaticPaletteCreate(InputType.text)}
                >
                  <Plus className='size-3.5' />
                  {t('configsPage.addSection')}
                </Button>
              </TabsList>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='ml-auto size-8 shrink-0'>
                    <MoreVertical className='size-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>{t('configsPage.cloneSection')}</DropdownMenuItem>
                  <DropdownMenuItem className='text-destructive focus:text-destructive'>
                    {t('configsPage.deleteSection')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {groups.map((group) => (
              <TabsContent key={group} value={group} className='mt-3 space-y-4'>
                {(groupedConfigs[group] ?? []).length === 0 ? (
                  <p className='py-8 text-center text-sm text-muted-foreground'>{t('configsPage.emptySection')}</p>
                ) : (
                  (groupedConfigs[group] ?? []).map((config) => (
                    <ConfigFieldRow key={config.id} config={config} onEdit={() => openEdit(config)} />
                  ))
                )}
              </TabsContent>
            ))}

            {groups.length === 0 && (
              <div className='py-16 text-center text-sm text-muted-foreground'>{t('configsPage.emptyPage')}</div>
            )}
          </Tabs>
        )}
      </div>

      {/* Right sidebar — field palette */}
      <div className='w-80 shrink-0 overflow-y-auto border-l p-2'>
        <div className='space-y-2'>
          {genericPalette.map((item) => (
            <button
              key={item.label}
              type='button'
              className='flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
              onClick={() => openStaticPaletteCreate(item.inputType)}
            >
              <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-md', item.bg, item.color)}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className='mt-4 border-t pt-3'>
          <div className='mb-2 px-2 text-sm font-medium'>{t('configsPage.lockedPalette.title')}</div>
          <div className='space-y-2'>
            {lockedPalette.map((item) => (
              <button
                key={item.key}
                type='button'
                className='flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
                onClick={() => openLockedPaletteCreate(item)}
              >
                <span
                  className={cn('flex size-6 shrink-0 items-center justify-center rounded-md', item.bg, item.color)}
                >
                  {item.icon}
                </span>
                <span className='truncate'>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className='mt-4 border-t pt-3'>
          <div className='mb-2 px-2 text-sm font-medium'>{t('configsPage.ahamovePalette.title')}</div>

          {isGettingAhamoveService ? (
            <div className='space-y-2'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-8 w-full' />
              ))}
            </div>
          ) : ahamoveRequests.length === 0 ? (
            <p className='px-2 text-xs text-muted-foreground'>{t('configsPage.ahamovePalette.empty')}</p>
          ) : (
            <div className='space-y-2'>
              {ahamoveRequests.map((request) => {
                const label =
                  (i18n.language?.toLowerCase().startsWith('vi') ? request.name_vi_vn : request.name_en_us) ||
                  request.name ||
                  request._id

                return (
                  <button
                    key={request._id}
                    type='button'
                    className='flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
                    onClick={() => setSelectedAhamoveRequest(request)}
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
              })}
            </div>
          )}
        </div>
      </div>

      <CreateConfigDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialValues={createInitialValues}
        lockedFields={createLockedFields}
      />

      <AhamoveCreateConfigDialog
        open={selectedAhamoveRequest !== null}
        request={selectedAhamoveRequest}
        onClose={() => setSelectedAhamoveRequest(null)}
      />

      <UpdateConfigDialog
        open={editOpen}
        config={editingConfig}
        onClose={closeEdit}
        liveOptionsByKey={liveOptionsByKey}
      />
    </div>
  )
}
