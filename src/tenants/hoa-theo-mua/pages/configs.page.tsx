import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ChevronDown, FileText, KeyRound, Plus, Settings2 } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { normalizeAhamoveKey } from '../features/configs/ahamove-palette'
import AhamoveCreateConfigDialog from '../features/configs/components/ahamove-create-config-dialog'
import ConfigFieldRow from '../features/configs/components/config-field-row'
import ConfigPaletteSidebar from '../features/configs/components/config-palette-sidebar'
import CreateConfigDialog from '../features/configs/components/create-config-dialog'
import FeedbacksCollectionDialog from '../features/configs/components/feedbacks-collection-dialog'
import MainlineCollectionDialog from '../features/configs/components/mainline-collection-dialog'
import OccasionsCollectionDialog from '../features/configs/components/occasions-collection-dialog'
import UpdateConfigDialog from '../features/configs/components/update-config-dialog'
import { FEEDBACKS_COLLECTION_KEY } from '../features/configs/feedbacks-palette'
import { useGetContentConfigs } from '../features/configs/hooks/use-get-content-configs'
import { useGetSecretConfigs } from '../features/configs/hooks/use-get-secret-configs'
import { useGetSettingConfigs } from '../features/configs/hooks/use-get-setting-configs'
import { LOCKED_ASYNC_CONFIG_KEYS } from '../features/configs/locked-config-keys'
import { MAINLINE_COLLECTION_KEY } from '../features/configs/mainline-palette'
import { OCCASIONS_COLLECTION_KEY } from '../features/configs/occasions-palette'
import type { Config, InputOption } from '../features/configs/types'
import { ConfigKind, ConfigKindLabel, InputType } from '../features/configs/types'
import type { CreateConfigFormInput } from '../features/configs/validations'
import { useGetAhamoveService } from '../hooks/use-get-ahamove-service'
import { useGetDepots } from '../hooks/use-get-depots'
import { useGetOrderSources } from '../hooks/use-get-order-sources'
import { useGetOrderTags } from '../hooks/use-get-order-tags'
import type { AhamoveServiceRequest } from '../types/ahamove.type'

type LockedFields = { key?: boolean; options?: boolean; kind?: boolean }

interface LockedPaletteItem {
  key: string
  label: string
  inputType: InputType
  options: InputOption[]
  defaultValue: unknown
}

const KIND_ORDER = [ConfigKind.content, ConfigKind.setting, ConfigKind.secret] as const

const safeJsonParse = (raw: unknown): Record<string, unknown> | null => {
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>
  if (typeof raw !== 'string') return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

const KIND_VISUALS: Record<
  ConfigKind,
  {
    Icon: ComponentType<SVGProps<SVGSVGElement>>
  }
> = {
  [ConfigKind.content]: {
    Icon: FileText
  },
  [ConfigKind.setting]: {
    Icon: Settings2
  },
  [ConfigKind.secret]: {
    Icon: KeyRound
  }
}

export default function ConfigsPage() {
  const { t, i18n } = useTenantTranslation()
  const [currentKind, setCurrentKind] = useState<ConfigKind>(ConfigKind.content)

  const { contentConfigs = [], isGettingContentConfigs } = useGetContentConfigs({
    enabled: currentKind === ConfigKind.content
  })
  const { settingConfigs = [], isGettingSettingConfigs } = useGetSettingConfigs({
    enabled: currentKind === ConfigKind.setting
  })
  const { secretConfigs = [], isGettingSecretConfigs } = useGetSecretConfigs({
    enabled: currentKind === ConfigKind.secret
  })

  const { depots } = useGetDepots()
  const { orderTags } = useGetOrderTags()
  const { orderSources } = useGetOrderSources()
  const { requests: ahamoveRequests, isGettingAhamoveService } = useGetAhamoveService()

  const currentKindConfigs =
    currentKind === ConfigKind.content
      ? contentConfigs
      : currentKind === ConfigKind.setting
        ? settingConfigs
        : secretConfigs

  const isGettingConfigs =
    (currentKind === ConfigKind.content && isGettingContentConfigs) ||
    (currentKind === ConfigKind.setting && isGettingSettingConfigs) ||
    (currentKind === ConfigKind.secret && isGettingSecretConfigs)

  const allLoadedConfigs = useMemo<Config[]>(
    () => [...contentConfigs, ...settingConfigs, ...secretConfigs],
    [contentConfigs, settingConfigs, secretConfigs]
  )

  const [createOpen, setCreateOpen] = useState(false)
  const [createInitialValues, setCreateInitialValues] = useState<Partial<CreateConfigFormInput>>()
  const [createLockedFields, setCreateLockedFields] = useState<LockedFields | undefined>()
  const [selectedAhamoveRequest, setSelectedAhamoveRequest] = useState<AhamoveServiceRequest | null>(null)
  const [editingAhamoveConfig, setEditingAhamoveConfig] = useState<Config | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)
  const [occasionsDialogOpen, setOccasionsDialogOpen] = useState(false)
  const [mainlineDialogOpen, setMainlineDialogOpen] = useState(false)
  const [feedbacksDialogOpen, setFeedbacksDialogOpen] = useState(false)

  const depotOptions = useMemo<InputOption[]>(
    () => depots.map((depot) => ({ label: depot.name, value: depot.id })),
    [depots]
  )

  const orderTagOptions = useMemo<InputOption[]>(
    () => orderTags.map((tag) => ({ label: tag.name, value: tag.id })),
    [orderTags]
  )

  const orderSourceOptions = useMemo<InputOption[]>(
    () => orderSources.map((source) => ({ label: source.name, value: source.id })),
    [orderSources]
  )

  const liveOptionsByKey = useMemo<Record<string, InputOption[]>>(
    () => ({
      [LOCKED_ASYNC_CONFIG_KEYS.defaultDepot]: depotOptions,
      [LOCKED_ASYNC_CONFIG_KEYS.orderTags]: orderTagOptions,
      [LOCKED_ASYNC_CONFIG_KEYS.orderSources]: orderSourceOptions
    }),
    [depotOptions, orderTagOptions, orderSourceOptions]
  )

  const groups = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []

    for (const config of currentKindConfigs) {
      if (!seen.has(config.value.group)) {
        seen.add(config.value.group)
        result.push(config.value.group)
      }
    }

    return result
  }, [currentKindConfigs])

  const [activeGroup, setActiveGroup] = useState<string>()
  const currentGroup = activeGroup && groups.includes(activeGroup) ? activeGroup : (groups[0] ?? '')

  const groupedConfigs = useMemo(
    () =>
      currentKindConfigs.reduce<Record<string, Config[]>>((acc, config) => {
        const g = config.value.group
        if (!acc[g]) acc[g] = []
        acc[g].push(config)
        return acc
      }, {}),
    [currentKindConfigs]
  )

  const openCreate = useCallback((initial: Partial<CreateConfigFormInput>, locked?: LockedFields) => {
    setCreateInitialValues(initial)
    setCreateLockedFields(locked)
    setCreateOpen(true)
  }, [])

  const openStaticPaletteCreate = useCallback(
    (inputType: InputType, options?: InputOption[]) => {
      openCreate({
        key: currentGroup ? `${currentGroup}.` : '',
        kind: currentKind,
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
    [openCreate, currentGroup, currentKind]
  )

  const openLockedPaletteCreate = useCallback(
    (item: LockedPaletteItem) => {
      const existing = allLoadedConfigs.find((c) => c.key === item.key)
      if (existing) {
        setEditingConfig(existing)
        setEditOpen(true)
        return
      }
      const [group] = item.key.split('.')
      openCreate(
        {
          key: item.key,
          kind: ConfigKind.setting,
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
        { key: true, options: true, kind: true }
      )
    },
    [allLoadedConfigs, openCreate]
  )

  const occasionsConfig = useMemo(
    () => allLoadedConfigs.find((c) => c.key === OCCASIONS_COLLECTION_KEY) ?? null,
    [allLoadedConfigs]
  )
  const mainlineConfig = useMemo(
    () => allLoadedConfigs.find((c) => c.key === MAINLINE_COLLECTION_KEY) ?? null,
    [allLoadedConfigs]
  )
  const feedbacksConfig = useMemo(
    () => allLoadedConfigs.find((c) => c.key === FEEDBACKS_COLLECTION_KEY) ?? null,
    [allLoadedConfigs]
  )

  const findAhamoveRequestForConfig = useCallback(
    (config: Config): AhamoveServiceRequest | null => {
      const raw = config.value.value
      const parsed = typeof raw === 'string' ? safeJsonParse(raw) : (raw as Record<string, unknown> | null)
      const storedId = typeof parsed?._id === 'string' ? parsed._id : null
      if (storedId) {
        const byId = ahamoveRequests.find((r) => r._id === storedId)
        if (byId) return byId
      }
      const suffix = config.key.replace(/^ahamove\.shipping\./, '')
      return ahamoveRequests.find((r) => normalizeAhamoveKey(r._id) === suffix) ?? null
    },
    [ahamoveRequests]
  )

  const openEdit = useCallback(
    (config: Config) => {
      if (config.key === OCCASIONS_COLLECTION_KEY) {
        setOccasionsDialogOpen(true)
        return
      }
      if (config.key === MAINLINE_COLLECTION_KEY) {
        setMainlineDialogOpen(true)
        return
      }
      if (config.key === FEEDBACKS_COLLECTION_KEY) {
        setFeedbacksDialogOpen(true)
        return
      }
      if (config.key.startsWith('ahamove.shipping.')) {
        const match = findAhamoveRequestForConfig(config)
        if (match) {
          setEditingAhamoveConfig(config)
          setSelectedAhamoveRequest(match)
          return
        }
      }
      setEditingConfig(config)
      setEditOpen(true)
    },
    [findAhamoveRequestForConfig]
  )

  const closeEdit = useCallback(() => {
    setEditOpen(false)
  }, [])

  return (
    <div className='flex h-full min-h-0'>
      <div className='flex flex-col gap-4 p-6 w-6xl mx-auto'>
        <nav className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          <span>{t('configsPage.breadcrumb')}</span>
          <ChevronDown className='size-3.5 -rotate-90' />
          <span>{t(`systemConfigs.kind.${currentKind}`)}</span>
          {currentGroup && (
            <>
              <ChevronDown className='size-3.5 -rotate-90' />
              <span className='capitalize'>{currentGroup}</span>
            </>
          )}
        </nav>

        <div className='flex items-start justify-between'>
          <h1 className='text-2xl font-bold'>{t(`systemConfigs.kind.${currentKind}`)}</h1>
        </div>

        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center gap-2'>
            {KIND_ORDER.map((kind) => {
              const isActive = kind === currentKind
              const visuals = KIND_VISUALS[kind]

              return (
                <Button
                  key={kind}
                  type='button'
                  onClick={() => setCurrentKind(kind)}
                  variant={isActive ? 'default' : 'outline'}
                  size='sm'
                >
                  <visuals.Icon />
                  <p>{t(ConfigKindLabel[kind])}</p>
                </Button>
              )
            })}
          </div>

          {isGettingConfigs ? (
            <div className='space-y-3'>
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
              <div className='border-b'>
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
              </div>

              {groups.length === 0 ? (
                <p className='py-16 text-center text-sm text-muted-foreground'>{t('configsPage.emptySection')}</p>
              ) : (
                groups.map((group) => (
                  <TabsContent key={group} value={group} className='mt-3 space-y-4'>
                    {(groupedConfigs[group] ?? []).length === 0 ? (
                      <p className='py-8 text-center text-sm text-muted-foreground'>{t('configsPage.emptySection')}</p>
                    ) : (
                      (groupedConfigs[group] ?? []).map((config) => (
                        <ConfigFieldRow key={config.id} config={config} onEdit={() => openEdit(config)} />
                      ))
                    )}
                  </TabsContent>
                ))
              )}
            </Tabs>
          )}
        </div>
      </div>

      <ConfigPaletteSidebar
        depotOptions={depotOptions}
        orderTagOptions={orderTagOptions}
        orderSourceOptions={orderSourceOptions}
        occasionsConfig={occasionsConfig}
        mainlineConfig={mainlineConfig}
        feedbacksConfig={feedbacksConfig}
        ahamoveRequests={ahamoveRequests}
        isGettingAhamoveService={isGettingAhamoveService}
        language={i18n.language}
        onCreateStatic={openStaticPaletteCreate}
        onCreateLocked={openLockedPaletteCreate}
        onOpenOccasions={() => setOccasionsDialogOpen(true)}
        onOpenMainline={() => setMainlineDialogOpen(true)}
        onOpenFeedbacks={() => setFeedbacksDialogOpen(true)}
        onSelectAhamove={(request) => {
          setEditingAhamoveConfig(null)
          setSelectedAhamoveRequest(request)
        }}
      />

      <CreateConfigDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialValues={createInitialValues}
        lockedFields={createLockedFields}
      />

      <AhamoveCreateConfigDialog
        open={selectedAhamoveRequest !== null}
        request={selectedAhamoveRequest}
        existingConfig={editingAhamoveConfig}
        onClose={() => {
          setSelectedAhamoveRequest(null)
          setEditingAhamoveConfig(null)
        }}
      />

      <UpdateConfigDialog
        open={editOpen}
        config={editingConfig}
        onClose={closeEdit}
        liveOptionsByKey={liveOptionsByKey}
      />

      <OccasionsCollectionDialog
        open={occasionsDialogOpen}
        onClose={() => setOccasionsDialogOpen(false)}
        existingConfig={occasionsConfig}
      />

      <MainlineCollectionDialog
        open={mainlineDialogOpen}
        onClose={() => setMainlineDialogOpen(false)}
        existingConfig={mainlineConfig}
      />

      <FeedbacksCollectionDialog
        open={feedbacksDialogOpen}
        onClose={() => setFeedbacksDialogOpen(false)}
        existingConfig={feedbacksConfig}
      />
    </div>
  )
}
