import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { bannerKeySuffix } from '../features/configs/banners-palette'
import { CARD_PRICES_KEY, CARD_SIZES_KEY } from '../features/configs/card-config-palette'
import {
  CHECKOUT_DELIVERY_METHODS_KEY,
  CHECKOUT_PAYMENT_METHODS_KEY
} from '../features/configs/checkout-methods-palette'
import B2BEntryList from '../features/configs/components/b2b/b2b-entry-list'
import BannersCollectionEditor from '../features/configs/components/banners/banners-collection-editor'
import CalligraphyPricingEditor from '../features/configs/components/cards-calligraphy/calligraphy-pricing-editor'
import CardSizesEditor from '../features/configs/components/cards-calligraphy/card-sizes-editor'
import CheckoutMethodsEditor from '../features/configs/components/checkout/checkout-methods-editor'
import OrderSlotsEditor from '../features/configs/components/orders/order-slots-editor'
import FeedbacksCollectionEditor from '../features/configs/components/feedbacks/feedbacks-collection-editor'
import SignatureLandingConfigEditor from '../features/configs/components/generic/signature-landing-config-editor'
import UpdateConfigDialog from '../features/configs/components/generic/update-config-dialog'
import ImagegenSection from '../features/configs/components/imagegen/imagegen-section'
import PostgenSection from '../features/configs/components/postgen/postgen-section'
import ProductCollectionEditor from '../features/configs/components/product-collections/product-collection-editor'
import PromotionPopupEditor from '../features/configs/components/promotion-popup/promotion-popup-editor'
import EditorCallout from '../features/configs/components/settings/editor-callout'
import CategoryEditorPanel, {
  type CategoryEditorItem
} from '../features/configs/components/shared/category-editor-panel'
import ConfigFieldRow from '../features/configs/components/shared/config-field-row'
import ConfigsErrorState from '../features/configs/components/shared/configs-error-state'
import ConfigsNav from '../features/configs/components/shared/configs-nav'
import UnsavedChangesBar from '../features/configs/components/shared/unsaved-changes-bar'
import {
  categorize,
  DEFAULT_CATEGORY_ID,
  groupOf,
  resolveLegacyCategory,
  resolveRenamedCategory
} from '../features/configs/config-registry'
import { feedbacksKeySuffix } from '../features/configs/feedbacks-palette'
import { useCollectionRegistries } from '../features/configs/hooks/use-collection-registries'
import { useGetContentConfigs } from '../features/configs/hooks/use-get-content-configs'
import { useGetSecretConfigs } from '../features/configs/hooks/use-get-secret-configs'
import { useGetSettingConfigs } from '../features/configs/hooks/use-get-setting-configs'
import {
  NEW_BANNERS,
  NEW_FEEDBACKS,
  NEW_PRODUCT_COLLECTION,
  useRecordEditor
} from '../features/configs/hooks/use-record-editor'
import { productCollectionKeySuffix } from '../features/configs/product-collection-palette'
import { PROMOTION_POPUP_KEY } from '../features/configs/promotion-popup-palette'
import { PRODUCT_SIGNATURE_KEY } from '../features/configs/signature-landing-palette'
import { DirtyRegistryProvider } from '../features/configs/state/dirty-registry'
import { useDirtySnapshot, useUnsavedChangesGuard } from '../features/configs/state/dirty-registry-hooks'
import { ConfigKind, InputType, type CategoryId, type Config } from '../features/configs/types'

const KIND_ORDER = [ConfigKind.content, ConfigKind.setting, ConfigKind.secret] as const

const B2B_CATEGORY_ID = 'b2b'
const FEEDBACKS_CATEGORY_ID = 'feedbacks'
const POSTGEN_CATEGORY_ID = 'postgen'
const BANNERS_CATEGORY_ID = 'banners'
const PRODUCT_COLLECTIONS_CATEGORY_ID = 'product-collections'
const PAYMENT_METHODS_CATEGORY_ID = 'payment-methods'
const DELIVERY_METHODS_CATEGORY_ID = 'delivery-methods'
const CARD_SIZES_CATEGORY_ID = 'card-sizes'
const CALLIGRAPHY_CATEGORY_ID = 'calligraphy'
const PROMOTION_POPUP_CATEGORY_ID = 'promotion-popup'
const SIGNATURE_LANDING_CATEGORY_ID = 'signature-landing'
const SECRETS_CATEGORY_ID = 'secrets'
const IMAGEGEN_CATEGORY_ID = 'imagegen'
const ORDER_SLOTS_CATEGORY_ID = 'order-slots'

const SETTINGS_LIST_CLASS = 'divide-y'

export default function ConfigsPage() {
  return (
    <DirtyRegistryProvider>
      <ConfigsPageContent />
    </DirtyRegistryProvider>
  )
}

function ConfigsPageContent() {
  const { t } = useTenantTranslation()

  const [categoryParam, setCategoryParam] = useQueryState('category', parseAsString)
  const [kindFilter, setKindFilter] = useQueryState('kind', parseAsString)
  const [legacySection, setLegacySection] = useQueryState('section', parseAsString)

  const { contentConfigs, isGettingContentConfigs, isContentConfigsError, refetchContentConfigs } =
    useGetContentConfigs()
  const { settingConfigs, isGettingSettingConfigs, isSettingConfigsError, refetchSettingConfigs } =
    useGetSettingConfigs()
  const { secretConfigs, isGettingSecretConfigs, isSecretConfigsError, refetchSecretConfigs } = useGetSecretConfigs({
    enabled: categoryParam === SECRETS_CATEGORY_ID
  })

  const allConfigs = useMemo<Config[]>(
    () => [...(contentConfigs ?? []), ...(settingConfigs ?? []), ...(secretConfigs ?? [])],
    [contentConfigs, settingConfigs, secretConfigs]
  )
  const { categories, byCategory, assignments } = useMemo(() => categorize(allConfigs), [allConfigs])

  const { rows: dirtyRows } = useDirtySnapshot()
  const dirtyCategories = useMemo(() => {
    const ids = new Set<CategoryId>()
    for (const row of dirtyRows) {
      if (!row.isDirty) continue
      const category = assignments.get(row.configId)
      if (category) ids.add(category)
    }
    return ids
  }, [dirtyRows, assignments])

  const knownCategoryIds = useMemo(() => new Set(categories.map((category) => category.id)), [categories])

  // Link cũ trỏ tới category đã bị tách đôi vẫn mở được, không rơi về category mặc định.
  const renamedCategory = resolveRenamedCategory(categoryParam)
  const isUnknownCategory = Boolean(categoryParam) && !renamedCategory && !knownCategoryIds.has(categoryParam as string)
  const activeCategory = renamedCategory ?? (isUnknownCategory || !categoryParam ? DEFAULT_CATEGORY_ID : categoryParam)
  const [dismissedUnknownCategory, setDismissedUnknownCategory] = useState(false)

  const categoryConfigs = useMemo(() => byCategory.get(activeCategory) ?? [], [byCategory, activeCategory])

  const isSecretsCategory = activeCategory === SECRETS_CATEGORY_ID
  const isGettingConfigs = isSecretsCategory
    ? isGettingSecretConfigs
    : isGettingContentConfigs || isGettingSettingConfigs

  const isConfigsError = isSecretsCategory ? isSecretConfigsError : isContentConfigsError || isSettingConfigsError

  const retryCurrentCategory = useCallback(() => {
    if (isSecretsCategory) {
      refetchSecretConfigs()
      return
    }
    refetchContentConfigs()
    refetchSettingConfigs()
  }, [isSecretsCategory, refetchSecretConfigs, refetchContentConfigs, refetchSettingConfigs])

  const kindsInCategory = useMemo(
    () => KIND_ORDER.filter((kind) => categoryConfigs.some((config) => config.kind === kind)),
    [categoryConfigs]
  )
  const activeKindFilter = kindFilter && kindsInCategory.includes(kindFilter as ConfigKind) ? kindFilter : null
  const visibleConfigs = useMemo(
    () => (activeKindFilter ? categoryConfigs.filter((config) => config.kind === activeKindFilter) : categoryConfigs),
    [categoryConfigs, activeKindFilter]
  )

  const groupedVisible = useMemo(() => {
    const buckets = new Map<string, { documents: Config[]; settings: Config[] }>()
    for (const config of visibleConfigs) {
      const group = groupOf(config) || 'other'
      const bucket = buckets.get(group) ?? { documents: [], settings: [] }
      if (config.value?.inputType === InputType.json) bucket.documents.push(config)
      else bucket.settings.push(config)
      buckets.set(group, bucket)
    }
    return [...buckets.entries()]
  }, [visibleConfigs])

  const {
    productCollectionRegistry,
    feedbacksRegistry,
    bannersRegistry,
    bannersConfigs,
    productCollectionConfigs,
    feedbacksConfigs,
    promotionPopupConfig,
    signatureLandingConfig,
    checkoutPaymentMethodsConfig,
    checkoutDeliveryMethodsConfig,
    cardSizesConfig,
    cardPricesConfig,
    maxWordsAcrossSizes
  } = useCollectionRegistries({ contentConfigs, isContentConfigsError, settingConfigs })

  const bannerItems = useMemo<CategoryEditorItem[]>(
    () =>
      bannersConfigs.length > 0
        ? bannersConfigs.map((config) => ({ key: config.key, label: bannerKeySuffix(config.key), config, mono: true }))
        : [{ key: `new:${NEW_BANNERS}`, label: t('configsPage.bannersPalette.newLabel'), config: null }],
    [bannersConfigs, t]
  )

  const productCollectionItems = useMemo<CategoryEditorItem[]>(
    () =>
      productCollectionConfigs.length > 0
        ? productCollectionConfigs.map((config) => ({
            key: config.key,
            label: productCollectionKeySuffix(config.key),
            config,
            mono: true
          }))
        : [
            {
              key: `new:${NEW_PRODUCT_COLLECTION}`,
              label: t('configsPage.productCollectionPalette.newLabel'),
              config: null
            }
          ],
    [productCollectionConfigs, t]
  )

  const feedbacksItems = useMemo<CategoryEditorItem[]>(
    () =>
      feedbacksConfigs.length > 0
        ? feedbacksConfigs.map((config) => ({
            key: config.key,
            label: feedbacksKeySuffix(config.key),
            config,
            mono: true
          }))
        : [{ key: `new:${NEW_FEEDBACKS}`, label: t('configsPage.feedbacksPalette.newLabel'), config: null }],
    [feedbacksConfigs, t]
  )

  const paymentMethodsItems = useMemo<CategoryEditorItem[]>(
    () => [
      {
        key: CHECKOUT_PAYMENT_METHODS_KEY,
        label: t('configsPage.checkoutMethodsPalette.payment'),
        config: checkoutPaymentMethodsConfig
      }
    ],
    [checkoutPaymentMethodsConfig, t]
  )

  const deliveryMethodsItems = useMemo<CategoryEditorItem[]>(
    () => [
      {
        key: CHECKOUT_DELIVERY_METHODS_KEY,
        label: t('configsPage.checkoutMethodsPalette.delivery'),
        config: checkoutDeliveryMethodsConfig
      }
    ],
    [checkoutDeliveryMethodsConfig, t]
  )

  const cardSizesItems = useMemo<CategoryEditorItem[]>(
    () => [{ key: CARD_SIZES_KEY, label: t('configsPage.cardSizesDialog.title'), config: cardSizesConfig }],
    [cardSizesConfig, t]
  )

  const calligraphyItems = useMemo<CategoryEditorItem[]>(
    () => [{ key: CARD_PRICES_KEY, label: t('configsPage.calligraphyDialog.title'), config: cardPricesConfig }],
    [cardPricesConfig, t]
  )

  const promotionPopupItems = useMemo<CategoryEditorItem[]>(
    () => [{ key: PROMOTION_POPUP_KEY, label: t('configsPage.category.promotionPopup'), config: promotionPopupConfig }],
    [promotionPopupConfig, t]
  )

  const signatureLandingItems = useMemo<CategoryEditorItem[]>(
    () => [
      { key: PRODUCT_SIGNATURE_KEY, label: t('configsPage.category.signatureLanding'), config: signatureLandingConfig }
    ],
    [signatureLandingConfig, t]
  )

  const { requestNavigation } = useUnsavedChangesGuard({
    title: t('configsPage.unsaved.leaveTitle'),
    description: t('configsPage.unsaved.leaveDescription'),
    confirmText: t('common.button.leave'),
    cancelText: t('common.button.cancel')
  })

  const {
    editingKey,
    openEdit,
    finishEditor,
    selectRecord,
    editOpen,
    editingConfig,
    closeEdit,
    liveOptionsByKey,
    syncLiveOptions,
    openB2BOverviewEditor,
    openB2BServiceEditor
  } = useRecordEditor({ requestNavigation })

  const hasMigratedLegacyUrl = useRef(false)
  useEffect(() => {
    if (hasMigratedLegacyUrl.current || categoryParam) return
    if (!legacySection && !kindFilter) return
    if (isGettingContentConfigs || isGettingSettingConfigs) return

    hasMigratedLegacyUrl.current = true
    const resolved = resolveLegacyCategory({ section: legacySection, kind: kindFilter }, knownCategoryIds)
    void setCategoryParam(resolved ?? DEFAULT_CATEGORY_ID)
    void setLegacySection(null)
    void setKindFilter(null)
  }, [
    categoryParam,
    legacySection,
    kindFilter,
    isGettingContentConfigs,
    isGettingSettingConfigs,
    knownCategoryIds,
    setCategoryParam,
    setLegacySection,
    setKindFilter
  ])

  const [isNavOpen, setIsNavOpen] = useState(false)

  const selectCategory = useCallback(
    (id: CategoryId) => {
      if (id === activeCategory) return
      void requestNavigation(() => {
        setDismissedUnknownCategory(false)
        void setCategoryParam(id)
        void setKindFilter(null)
        finishEditor()
      })
    },
    [activeCategory, requestNavigation, setCategoryParam, setKindFilter, finishEditor]
  )

  const activeCategoryMeta = categories.find((category) => category.id === activeCategory) ?? null
  const activeCategoryLabel = activeCategoryMeta
    ? activeCategoryMeta.labelKey
      ? t(activeCategoryMeta.labelKey)
      : (activeCategoryMeta.fallbackLabel ?? activeCategoryMeta.id)
    : ''

  const navProps = {
    categories,
    recordsByCategory: byCategory,
    activeCategory,
    dirtyCategories
  }

  const renderUnsupportedRows = (supported: readonly (Config | null)[]) => {
    const supportedKeys = new Set(supported.flatMap((config) => (config ? [config.key] : [])))
    const rest = categoryConfigs.filter((config) => !supportedKeys.has(config.key))
    if (rest.length === 0) return null

    return (
      <div className='border-t p-4'>
        <h3 className='mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          {t('configsPage.unsupportedRecords')}
        </h3>
        <div className='divide-y border-t'>
          {rest.map((config) => (
            <ConfigFieldRow key={config.id} config={config} onEdit={() => openEdit(config)} />
          ))}
        </div>
      </div>
    )
  }

  const renderCategoryPanel = () => {
    if (isConfigsError) return <ConfigsErrorState onRetry={retryCurrentCategory} />

    if (isGettingConfigs) {
      return (
        <div className='space-y-3'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-20 w-full' />
          ))}
        </div>
      )
    }

    if (activeCategory === BANNERS_CATEGORY_ID) {
      return (
        <CategoryEditorPanel
          items={bannerItems}
          selectedKey={editingKey}
          onSelect={selectRecord}
          navLabel={t('configsPage.category.banners')}
          footer={renderUnsupportedRows(bannersConfigs)}
        >
          {(item) => (
            <BannersCollectionEditor
              key={item.key}
              existingConfig={item.config}
              registry={bannersRegistry}
              onSaved={finishEditor}
            />
          )}
        </CategoryEditorPanel>
      )
    }

    if (activeCategory === ORDER_SLOTS_CATEGORY_ID) {
      return <OrderSlotsEditor />
    }

    if (activeCategory === PRODUCT_COLLECTIONS_CATEGORY_ID) {
      return (
        <CategoryEditorPanel
          items={productCollectionItems}
          selectedKey={editingKey}
          onSelect={selectRecord}
          navLabel={t('configsPage.category.productCollections')}
          footer={renderUnsupportedRows(productCollectionConfigs)}
        >
          {(item) => (
            <ProductCollectionEditor
              key={item.key}
              existingConfig={item.config}
              registry={productCollectionRegistry}
              onSaved={(saved) => finishEditor(saved?.key)}
            />
          )}
        </CategoryEditorPanel>
      )
    }

    if (activeCategory === FEEDBACKS_CATEGORY_ID) {
      return (
        <CategoryEditorPanel
          items={feedbacksItems}
          selectedKey={editingKey}
          onSelect={selectRecord}
          navLabel={t('configsPage.category.feedbacks')}
          footer={renderUnsupportedRows(feedbacksConfigs)}
        >
          {(item) => (
            <FeedbacksCollectionEditor
              key={item.key}
              existingConfig={item.config}
              registry={feedbacksRegistry}
              onSaved={finishEditor}
            />
          )}
        </CategoryEditorPanel>
      )
    }

    if (activeCategory === PAYMENT_METHODS_CATEGORY_ID) {
      return (
        <CategoryEditorPanel
          items={paymentMethodsItems}
          selectedKey={editingKey}
          onSelect={selectRecord}
          navLabel={t('configsPage.category.paymentMethods')}
          footer={renderUnsupportedRows([checkoutPaymentMethodsConfig])}
        >
          {(item) => (
            <CheckoutMethodsEditor key={item.key} kind='payment' existingConfig={item.config} onSaved={finishEditor} />
          )}
        </CategoryEditorPanel>
      )
    }

    if (activeCategory === DELIVERY_METHODS_CATEGORY_ID) {
      return (
        <CategoryEditorPanel
          items={deliveryMethodsItems}
          selectedKey={editingKey}
          onSelect={selectRecord}
          navLabel={t('configsPage.category.deliveryMethods')}
          footer={renderUnsupportedRows([checkoutDeliveryMethodsConfig])}
        >
          {(item) => (
            <CheckoutMethodsEditor key={item.key} kind='delivery' existingConfig={item.config} onSaved={finishEditor} />
          )}
        </CategoryEditorPanel>
      )
    }

    if (activeCategory === CARD_SIZES_CATEGORY_ID) {
      return (
        <CategoryEditorPanel
          items={cardSizesItems}
          selectedKey={editingKey}
          onSelect={selectRecord}
          navLabel={t('configsPage.category.cardSizes')}
          footer={renderUnsupportedRows([cardSizesConfig])}
        >
          {(item) => <CardSizesEditor key={item.key} existingConfig={item.config} onSaved={finishEditor} />}
        </CategoryEditorPanel>
      )
    }

    if (activeCategory === CALLIGRAPHY_CATEGORY_ID) {
      return (
        <CategoryEditorPanel
          items={calligraphyItems}
          selectedKey={editingKey}
          onSelect={selectRecord}
          navLabel={t('configsPage.category.calligraphy')}
          footer={renderUnsupportedRows([cardPricesConfig])}
        >
          {(item) => (
            <CalligraphyPricingEditor
              key={item.key}
              existingConfig={item.config}
              onSaved={finishEditor}
              maxWordsAcrossSizes={maxWordsAcrossSizes}
            />
          )}
        </CategoryEditorPanel>
      )
    }

    if (activeCategory === PROMOTION_POPUP_CATEGORY_ID) {
      return (
        <CategoryEditorPanel
          items={promotionPopupItems}
          selectedKey={editingKey}
          onSelect={selectRecord}
          navLabel={t('configsPage.category.promotionPopup')}
          footer={renderUnsupportedRows([promotionPopupConfig])}
        >
          {(item) => <PromotionPopupEditor existingConfig={item.config} onSaved={finishEditor} />}
        </CategoryEditorPanel>
      )
    }

    if (activeCategory === SIGNATURE_LANDING_CATEGORY_ID) {
      return (
        <CategoryEditorPanel
          items={signatureLandingItems}
          selectedKey={editingKey}
          onSelect={selectRecord}
          navLabel={t('configsPage.category.signatureLanding')}
          footer={renderUnsupportedRows([signatureLandingConfig])}
        >
          {(item) => <SignatureLandingConfigEditor existingConfig={item.config} onSaved={finishEditor} />}
        </CategoryEditorPanel>
      )
    }

    if (activeCategory === B2B_CATEGORY_ID) {
      return (
        <B2BEntryList
          configs={categoryConfigs}
          onOpenOverview={openB2BOverviewEditor}
          onOpenService={openB2BServiceEditor}
        />
      )
    }

    if (activeCategory === POSTGEN_CATEGORY_ID) {
      return (
        <PostgenSection
          configs={categoryConfigs}
          onEditConfig={openEdit}
          selectedKey={editingKey}
          onSelect={selectRecord}
        />
      )
    }

    if (activeCategory === IMAGEGEN_CATEGORY_ID) {
      return (
        <ImagegenSection
          configs={categoryConfigs}
          onEditConfig={openEdit}
          selectedKey={editingKey}
          onSelect={selectRecord}
        />
      )
    }

    if (visibleConfigs.length === 0) {
      return <p className='py-16 text-center text-sm text-muted-foreground'>{t('configsPage.emptySection')}</p>
    }

    return (
      <section className='flex flex-1 flex-col'>
        <div className='flex items-center gap-2.5 border-b border-border p-4'>
          <div className='min-w-0 flex-1 -space-y-0.5'>
            <h3 className='truncate text-lg font-semibold'>{activeCategoryLabel}</h3>
            <p className='text-xs text-muted-foreground'>
              {isSecretsCategory
                ? t('configsPage.genericPanel.secretsSubtitle')
                : t('configsPage.genericPanel.subtitle', { count: visibleConfigs.length })}
            </p>
          </div>
        </div>

        <div className='flex-1 space-y-8 p-4'>
          {isSecretsCategory && (
            <EditorCallout tone='warning'>{t('configsPage.genericPanel.secretsWarning')}</EditorCallout>
          )}

          {groupedVisible.map(([group, { documents, settings }]) => (
            <div key={group} className='space-y-3'>
              {documents.length > 0 && (
                <div className='space-y-2'>
                  {documents.map((config) => (
                    <ConfigFieldRow key={config.id} config={config} onEdit={() => openEdit(config)} />
                  ))}
                </div>
              )}

              {settings.length > 0 && (
                <div className={SETTINGS_LIST_CLASS}>
                  {settings.map((config) => (
                    <ConfigFieldRow key={config.id} config={config} onEdit={() => openEdit(config)} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='flex min-h-0 flex-1'>
        <ConfigsNav {...navProps} onSelect={selectCategory} className='hidden w-72 shrink-0 border-r lg:flex' />

        <div className='min-h-0 flex flex-col flex-1 overflow-y-auto'>
          {isUnknownCategory && !dismissedUnknownCategory && (
            <div
              role='status'
              className='mb-4 flex items-center gap-3 rounded-lg border border-dashed bg-muted/40 px-3 py-2'
            >
              <p className='flex-1 text-xs text-muted-foreground'>{t('configsPage.categoryRemoved')}</p>
              <Button type='button' variant='ghost' size='sm' onClick={() => setDismissedUnknownCategory(true)}>
                {t('common.button.close')}
              </Button>
            </div>
          )}

          <div className='flex-1 flex'>{renderCategoryPanel()}</div>

          <UnsavedChangesBar />
        </div>
      </div>

      <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
        <SheetContent side='left' className='flex w-4/5 flex-col gap-0 p-0 sm:max-w-xs'>
          <SheetHeader className='shrink-0 border-b'>
            <SheetTitle>{t('configsPage.nav.label')}</SheetTitle>
          </SheetHeader>
          <ConfigsNav
            {...navProps}
            onSelect={(id) => {
              setIsNavOpen(false)
              selectCategory(id)
            }}
            className='min-h-0 flex-1'
          />
        </SheetContent>
      </Sheet>

      <UpdateConfigDialog
        open={editOpen}
        config={editingConfig}
        onClose={closeEdit}
        liveOptionsByKey={liveOptionsByKey}
        onSyncOptions={syncLiveOptions}
      />
    </div>
  )
}
