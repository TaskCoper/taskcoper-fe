import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ChevronDown, FileText, KeyRound, PanelRight, Plus, Settings2 } from 'lucide-react'
import { parseAsString, parseAsStringEnum, useQueryState } from 'nuqs'
import type { ComponentType, SVGProps } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../config'
import {
  B2B_SERVICE_SLUGS,
  B2B_SERVICES_GROUP,
  b2bServicesKeySuffix,
  isB2BOverviewKey,
  matchesB2BServicesConfig,
  type B2BServiceSlug
} from '../features/configs/b2b-service-detail-palette'
import { bannerKeySuffix, matchesBannerKey } from '../features/configs/banners-palette'
import {
  CHECKOUT_CONFIG_GROUP,
  CHECKOUT_DELIVERY_METHODS_KEY,
  CHECKOUT_PAYMENT_METHODS_KEY,
  checkoutMethodKindFromKey,
  matchesCheckoutMethodsKey,
  type CheckoutMethodKind
} from '../features/configs/checkout-methods-palette'
import AhamoveCreateConfigDialog from '../features/configs/components/ahamove-create-config-dialog'
import BannersCollectionDialog from '../features/configs/components/banners-collection-dialog'
import CheckoutMethodsDialog from '../features/configs/components/checkout-methods-dialog'
import ConfigFieldRow from '../features/configs/components/config-field-row'
import ConfigPaletteSidebar from '../features/configs/components/config-palette-sidebar'
import CreateConfigDialog from '../features/configs/components/create-config-dialog'
import FeedbacksCollectionDialog from '../features/configs/components/feedbacks-collection-dialog'
import ProductCollectionDialog from '../features/configs/components/product-collection-dialog'
import PromotionPopupDialog from '../features/configs/components/promotion-popup-dialog'
import UpdateConfigDialog from '../features/configs/components/update-config-dialog'
import { feedbacksKeySuffix, matchesFeedbacksKey } from '../features/configs/feedbacks-palette'
import { useGetContentConfigs } from '../features/configs/hooks/use-get-content-configs'
import { useGetSecretConfigs } from '../features/configs/hooks/use-get-secret-configs'
import { useGetSettingConfigs } from '../features/configs/hooks/use-get-setting-configs'
import { LOCKED_ASYNC_CONFIG_KEYS } from '../features/configs/locked-config-keys'
import {
  matchesProductCollectionConfig,
  productCollectionKeySuffix
} from '../features/configs/product-collection-palette'
import {
  isPromotionPopupKey,
  PROMOTION_POPUP_GROUP,
  PROMOTION_POPUP_KEY
} from '../features/configs/promotion-popup-palette'
import type { Config, InputOption } from '../features/configs/types'
import { ConfigKind, ConfigKindLabel, InputType } from '../features/configs/types'
import type { CreateConfigFormInput } from '../features/configs/validations'
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

// Legacy `b2bservices` rows predate the `b2bServices` casing convention; fold them into
// one tab instead of splitting the group across two casings.
const B2B_SERVICES_GROUP_LC = B2B_SERVICES_GROUP.toLowerCase()
const resolveGroupKey = (group: string): string =>
  group.toLowerCase() === B2B_SERVICES_GROUP_LC ? B2B_SERVICES_GROUP : group

// const safeJsonParse = (raw: unknown): Record<string, unknown> | null => {
//   if (raw && typeof raw === 'object') return raw as Record<string, unknown>
//   if (typeof raw !== 'string') return null
//   try {
//     const parsed = JSON.parse(raw)
//     return parsed && typeof parsed === 'object' ? parsed : null
//   } catch {
//     return null
//   }
// }

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
  const { t } = useTenantTranslation()
  const navigate = useNavigate()
  const [currentKind, setCurrentKind] = useQueryState(
    'kind',
    parseAsStringEnum<ConfigKind>(Object.values(ConfigKind)).withDefault(ConfigKind.content)
  )

  const { contentConfigs = [], isGettingContentConfigs } = useGetContentConfigs({
    enabled: currentKind === ConfigKind.content
  })
  const { settingConfigs = [], isGettingSettingConfigs } = useGetSettingConfigs({
    enabled: currentKind === ConfigKind.setting
  })
  const { secretConfigs = [], isGettingSecretConfigs } = useGetSecretConfigs({
    enabled: currentKind === ConfigKind.secret
  })

  const { contentConfigs: promotionsGroupConfigs = [] } = useGetContentConfigs({ groupName: PROMOTION_POPUP_GROUP })
  const { contentConfigs: checkoutGroupConfigs = [] } = useGetContentConfigs({ groupName: CHECKOUT_CONFIG_GROUP })

  const { depots } = useGetDepots()
  const { orderTags } = useGetOrderTags()
  const { orderSources } = useGetOrderSources()
  // const { requests: ahamoveRequests, isGettingAhamoveService } = useGetAhamoveService()

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
  const [productCollectionDialogOpen, setProductCollectionDialogOpen] = useState(false)
  const [editingProductCollectionConfig, setEditingProductCollectionConfig] = useState<Config | null>(null)
  const [feedbacksDialogOpen, setFeedbacksDialogOpen] = useState(false)
  const [editingFeedbacksConfig, setEditingFeedbacksConfig] = useState<Config | null>(null)
  const [bannersDialogOpen, setBannersDialogOpen] = useState(false)
  const [editingBannersConfig, setEditingBannersConfig] = useState<Config | null>(null)
  const [promotionPopupDialogOpen, setPromotionPopupDialogOpen] = useState(false)
  const [checkoutMethodsKind, setCheckoutMethodsKind] = useState<CheckoutMethodKind | null>(null)
  const [paletteSheetOpen, setPaletteSheetOpen] = useState(false)

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
      const group = resolveGroupKey(config.value.group)
      if (!seen.has(group)) {
        seen.add(group)
        result.push(group)
      }
    }

    return result
  }, [currentKindConfigs])

  const [activeGroup, setActiveGroup] = useQueryState('section', parseAsString)
  const currentGroup = activeGroup && groups.includes(activeGroup) ? activeGroup : (groups[0] ?? '')

  const groupedConfigs = useMemo(
    () =>
      currentKindConfigs.reduce<Record<string, Config[]>>((acc, config) => {
        const g = resolveGroupKey(config.value.group)
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

  const productCollectionConfigs = useMemo(
    () => allLoadedConfigs.filter(matchesProductCollectionConfig),
    [allLoadedConfigs]
  )
  const feedbacksConfigs = useMemo(() => allLoadedConfigs.filter((c) => matchesFeedbacksKey(c.key)), [allLoadedConfigs])
  const bannersConfigs = useMemo(() => allLoadedConfigs.filter((c) => matchesBannerKey(c.key)), [allLoadedConfigs])

  const productCollectionTakenSuffixes = useMemo(
    () => new Set(productCollectionConfigs.map((c) => productCollectionKeySuffix(c.key))),
    [productCollectionConfigs]
  )
  const feedbacksTakenSuffixes = useMemo(
    () => new Set(feedbacksConfigs.map((c) => feedbacksKeySuffix(c.key))),
    [feedbacksConfigs]
  )
  const bannersTakenSuffixes = useMemo(
    () => new Set(bannersConfigs.map((c) => bannerKeySuffix(c.key))),
    [bannersConfigs]
  )

  // Own query, not `allLoadedConfigs`: content configs only load on the Content tab, so
  // deriving it there would read as "not created yet" and make the editor POST a duplicate.
  const promotionPopupConfig = useMemo(
    () => promotionsGroupConfigs.find((c) => c.key === PROMOTION_POPUP_KEY) ?? null,
    [promotionsGroupConfigs]
  )
  const checkoutPaymentMethodsConfig = useMemo(
    () => checkoutGroupConfigs.find((config) => config.key === CHECKOUT_PAYMENT_METHODS_KEY) ?? null,
    [checkoutGroupConfigs]
  )
  const checkoutDeliveryMethodsConfig = useMemo(
    () => checkoutGroupConfigs.find((config) => config.key === CHECKOUT_DELIVERY_METHODS_KEY) ?? null,
    [checkoutGroupConfigs]
  )

  const b2bServicesConfigs = useMemo(() => allLoadedConfigs.filter(matchesB2BServicesConfig), [allLoadedConfigs])
  // The shared `b2bServices` group holds two doc kinds; split them so each routes to its own editor.
  const b2bServiceDocs = useMemo(() => b2bServicesConfigs.filter((c) => !isB2BOverviewKey(c.key)), [b2bServicesConfigs])
  const b2bOverviewConfig = useMemo(
    () => b2bServicesConfigs.find((c) => isB2BOverviewKey(c.key)) ?? null,
    [b2bServicesConfigs]
  )
  const usedB2BSlugs = useMemo(() => new Set(b2bServiceDocs.map((c) => b2bServicesKeySuffix(c.key))), [b2bServiceDocs])
  const availableB2BSlugs = useMemo<B2BServiceSlug[]>(
    () => B2B_SERVICE_SLUGS.filter((slug) => !usedB2BSlugs.has(slug)),
    [usedB2BSlugs]
  )

  // const findAhamoveRequestForConfig = useCallback(
  //   (config: Config): AhamoveServiceRequest | null => {
  //     const raw = config.value.value
  //     const parsed = typeof raw === 'string' ? safeJsonParse(raw) : (raw as Record<string, unknown> | null)
  //     const storedId = typeof parsed?._id === 'string' ? parsed._id : null
  //     if (storedId) {
  //       const byId = ahamoveRequests.find((r) => r._id === storedId)
  //       if (byId) return byId
  //     }
  //     const suffix = config.key.replace(/^ahamove\.shipping\./, '')
  //     return ahamoveRequests.find((r) => normalizeAhamoveKey(r._id) === suffix) ?? null
  //   },
  //   [ahamoveRequests]
  // )

  const openB2BOverviewEditor = useCallback(() => {
    navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/configs/b2b-overview`)
  }, [navigate])

  // B2B service docs are edited on a dedicated full-page editor; existing rows route to their
  // slug, "add service" routes to the first free slug.
  const openB2BServiceEditor = useCallback(
    (config: Config | null) => {
      const slug = config ? b2bServicesKeySuffix(config.key) : availableB2BSlugs[0]
      if (!slug) {
        toast.error(t('configsPage.b2bServicesPalette.allSlugsUsed'))
        return
      }
      navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/configs/b2b-service/${slug}`)
    },
    [navigate, availableB2BSlugs, t]
  )

  const openEdit = useCallback(
    (config: Config) => {
      if (matchesCheckoutMethodsKey(config.key)) {
        setCheckoutMethodsKind(checkoutMethodKindFromKey(config.key))
        return
      }
      if (isPromotionPopupKey(config.key)) {
        setPromotionPopupDialogOpen(true)
        return
      }
      if (matchesProductCollectionConfig(config)) {
        setEditingProductCollectionConfig(config)
        setProductCollectionDialogOpen(true)
        return
      }
      if (matchesFeedbacksKey(config.key)) {
        setEditingFeedbacksConfig(config)
        setFeedbacksDialogOpen(true)
        return
      }
      if (matchesBannerKey(config.key)) {
        setEditingBannersConfig(config)
        setBannersDialogOpen(true)
        return
      }
      if (matchesB2BServicesConfig(config)) {
        if (isB2BOverviewKey(config.key)) {
          openB2BOverviewEditor()
        } else {
          openB2BServiceEditor(config)
        }
        return
      }
      setEditingConfig(config)
      setEditOpen(true)
    },
    [openB2BOverviewEditor, openB2BServiceEditor]
  )

  const openProductCollectionDialog = useCallback((config: Config | null) => {
    setEditingProductCollectionConfig(config)
    setProductCollectionDialogOpen(true)
  }, [])
  const openFeedbacksDialog = useCallback((config: Config | null) => {
    setEditingFeedbacksConfig(config)
    setFeedbacksDialogOpen(true)
  }, [])
  const openBannersDialog = useCallback((config: Config | null) => {
    setEditingBannersConfig(config)
    setBannersDialogOpen(true)
  }, [])
  const openPromotionPopupDialog = useCallback(() => {
    setPromotionPopupDialogOpen(true)
  }, [])
  const openCheckoutPaymentMethods = useCallback(() => setCheckoutMethodsKind('payment'), [])
  const openCheckoutDeliveryMethods = useCallback(() => setCheckoutMethodsKind('delivery'), [])
  const closeEdit = useCallback(() => {
    setEditOpen(false)
  }, [])

  return (
    <div className='flex h-full min-h-0'>
      <div className='flex w-full min-h-0 flex-col gap-4 p-4 lg:max-w-6xl lg:mx-auto lg:p-6'>
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

        <div className='flex items-start justify-between gap-2'>
          <h1 className='text-2xl font-bold'>{t(`systemConfigs.kind.${currentKind}`)}</h1>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='shrink-0 lg:hidden'
            onClick={() => setPaletteSheetOpen(true)}
          >
            <PanelRight className='size-4' />
            <span className='sr-only'>{t('configsPage.palette.title')}</span>
          </Button>
        </div>

        <div className='flex flex-1 flex-col gap-4 min-h-0'>
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
            <Tabs
              value={currentGroup}
              onValueChange={(v) => setActiveGroup(v)}
              className='flex flex-1 flex-col gap-0 min-h-0'
            >
              <div className='shrink-0 overflow-x-auto border-b'>
                <TabsList className='h-auto w-max gap-0 rounded-none bg-transparent p-0'>
                  {groups.map((group) => (
                    <TabsTrigger
                      key={group}
                      value={group}
                      className={cn(
                        'relative h-9 shrink-0 rounded-none border-b-2 border-b-transparent px-4 text-sm font-medium capitalize text-muted-foreground shadow-none transition-none',
                        'data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none'
                      )}
                    >
                      {group}
                    </TabsTrigger>
                  ))}

                  <Button
                    variant='ghost'
                    size='sm'
                    className='shrink-0 text-muted-foreground first:ml-0 ml-2'
                    onClick={() => openStaticPaletteCreate(InputType.text)}
                  >
                    <Plus className='size-3.5' />
                    {t('configsPage.addSection')}
                  </Button>
                </TabsList>
              </div>

              <div className='min-h-0 flex-1 overflow-y-auto'>
                {groups.length === 0 ? (
                  <p className='py-16 text-center text-sm text-muted-foreground'>{t('configsPage.emptySection')}</p>
                ) : (
                  groups.map((group) => (
                    <TabsContent key={group} value={group} className='mt-3 space-y-4'>
                      {(groupedConfigs[group] ?? []).length === 0 ? (
                        <p className='py-8 text-center text-sm text-muted-foreground'>
                          {t('configsPage.emptySection')}
                        </p>
                      ) : (
                        (groupedConfigs[group] ?? []).map((config) => (
                          <ConfigFieldRow key={config.id} config={config} onEdit={() => openEdit(config)} />
                        ))
                      )}
                    </TabsContent>
                  ))
                )}
              </div>
            </Tabs>
          )}
        </div>
      </div>

      {/* <ConfigPaletteSidebar
        className='hidden lg:block'
        depotOptions={depotOptions}
        orderTagOptions={orderTagOptions}
        productCollectionConfigs={productCollectionConfigs}
        feedbacksConfigs={feedbacksConfigs}
        bannersConfigs={bannersConfigs}
        b2bServicesConfigs={b2bServiceDocs}
        b2bOverviewConfig={b2bOverviewConfig}
        promotionPopupConfig={promotionPopupConfig}
        checkoutPaymentMethodsConfig={checkoutPaymentMethodsConfig}
        checkoutDeliveryMethodsConfig={checkoutDeliveryMethodsConfig}
        onCreateLocked={openLockedPaletteCreate}
        onOpenProductCollection={openProductCollectionDialog}
        onOpenFeedbacks={openFeedbacksDialog}
        onOpenBanners={openBannersDialog}
        onOpenB2BService={openB2BServiceEditor}
        onOpenB2BOverview={openB2BOverviewEditor}
        onOpenPromotionPopup={openPromotionPopupDialog}
        onOpenCheckoutPaymentMethods={openCheckoutPaymentMethods}
        onOpenCheckoutDeliveryMethods={openCheckoutDeliveryMethods}
      /> */}

      <Sheet open={paletteSheetOpen} onOpenChange={setPaletteSheetOpen}>
        <SheetContent side='right' className='w-4/5 gap-0 p-0 sm:max-w-sm'>
          <SheetHeader className='border-b'>
            <SheetTitle>{t('configsPage.palette.title')}</SheetTitle>
          </SheetHeader>
          <ConfigPaletteSidebar
            className='w-full flex-1 overflow-y-auto border-0'
            depotOptions={depotOptions}
            orderTagOptions={orderTagOptions}
            productCollectionConfigs={productCollectionConfigs}
            feedbacksConfigs={feedbacksConfigs}
            bannersConfigs={bannersConfigs}
            b2bServicesConfigs={b2bServiceDocs}
            b2bOverviewConfig={b2bOverviewConfig}
            promotionPopupConfig={promotionPopupConfig}
            checkoutPaymentMethodsConfig={checkoutPaymentMethodsConfig}
            checkoutDeliveryMethodsConfig={checkoutDeliveryMethodsConfig}
            onCreateLocked={(item) => {
              setPaletteSheetOpen(false)
              openLockedPaletteCreate(item)
            }}
            onOpenProductCollection={(config) => {
              setPaletteSheetOpen(false)
              openProductCollectionDialog(config)
            }}
            onOpenFeedbacks={(config) => {
              setPaletteSheetOpen(false)
              openFeedbacksDialog(config)
            }}
            onOpenBanners={(config) => {
              setPaletteSheetOpen(false)
              openBannersDialog(config)
            }}
            onOpenB2BService={(config) => {
              setPaletteSheetOpen(false)
              openB2BServiceEditor(config)
            }}
            onOpenB2BOverview={() => {
              setPaletteSheetOpen(false)
              openB2BOverviewEditor()
            }}
            onOpenPromotionPopup={() => {
              setPaletteSheetOpen(false)
              openPromotionPopupDialog()
            }}
            onOpenCheckoutPaymentMethods={() => {
              setPaletteSheetOpen(false)
              openCheckoutPaymentMethods()
            }}
            onOpenCheckoutDeliveryMethods={() => {
              setPaletteSheetOpen(false)
              openCheckoutDeliveryMethods()
            }}
          />
        </SheetContent>
      </Sheet>

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

      <ProductCollectionDialog
        open={productCollectionDialogOpen}
        onClose={() => setProductCollectionDialogOpen(false)}
        existingConfig={editingProductCollectionConfig}
        takenSuffixes={productCollectionTakenSuffixes}
      />

      <FeedbacksCollectionDialog
        open={feedbacksDialogOpen}
        onClose={() => setFeedbacksDialogOpen(false)}
        existingConfig={editingFeedbacksConfig}
        takenSuffixes={feedbacksTakenSuffixes}
      />

      <BannersCollectionDialog
        open={bannersDialogOpen}
        onClose={() => setBannersDialogOpen(false)}
        existingConfig={editingBannersConfig}
        takenSuffixes={bannersTakenSuffixes}
      />

      <PromotionPopupDialog
        open={promotionPopupDialogOpen}
        onClose={() => setPromotionPopupDialogOpen(false)}
        existingConfig={promotionPopupConfig}
      />

      <CheckoutMethodsDialog
        open={checkoutMethodsKind !== null}
        kind={checkoutMethodsKind ?? 'payment'}
        existingConfig={
          checkoutMethodsKind === 'delivery' ? checkoutDeliveryMethodsConfig : checkoutPaymentMethodsConfig
        }
        onClose={() => setCheckoutMethodsKind(null)}
      />
    </div>
  )
}
