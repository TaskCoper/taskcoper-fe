import { useMemo } from 'react'
import { bannerKeySuffix, matchesBannerKey } from '../banners-palette'
import { CARD_PRICES_KEY, CARD_SIZES_KEY, maxWordsOfSizes, parseCardSizes } from '../card-config-palette'
import { CHECKOUT_DELIVERY_METHODS_KEY, CHECKOUT_PAYMENT_METHODS_KEY } from '../checkout-methods-palette'
import { feedbacksKeySuffix, matchesFeedbacksKey } from '../feedbacks-palette'
import { matchesProductCollectionConfig, productCollectionKeySuffix } from '../product-collection-palette'
import { PROMOTION_POPUP_KEY } from '../promotion-popup-palette'
import { isProductSignatureKey } from '../signature-landing-palette'
import { InputType, type Config } from '../types'
import { buildSuffixRegistry } from '../uniqueness'

/**
 * Registry kiểm tra trùng suffix cho các họ collection, cộng với những singleton tra theo key cố
 * định. Tách khỏi page vì không phần nào phụ thuộc category đang chọn hay routing - tất cả đều
 * suy ra thuần từ danh sách content/settings chưa lọc.
 */
export function useCollectionRegistries({
  contentConfigs,
  isContentConfigsError,
  settingConfigs
}: {
  contentConfigs: Config[] | undefined
  isContentConfigsError: boolean
  settingConfigs: Config[] | undefined
}) {
  // Tính duy nhất chỉ suy ra từ danh sách CONTENT chưa lọc: cả ba họ collection đều là
  // `kind: content` nên một query là đủ. Registry mang theo trạng thái của query, nhờ vậy danh
  // sách đang tải hoặc lỗi sẽ chặn việc tạo mới thay vì báo mọi suffix đều còn trống.
  const productCollectionRegistry = useMemo(
    () =>
      buildSuffixRegistry({
        configs: contentConfigs,
        isError: isContentConfigsError,
        matches: matchesProductCollectionConfig,
        suffixOf: productCollectionKeySuffix
      }),
    [contentConfigs, isContentConfigsError]
  )
  const feedbacksRegistry = useMemo(
    () =>
      buildSuffixRegistry({
        configs: contentConfigs,
        isError: isContentConfigsError,
        matches: (config) => matchesFeedbacksKey(config.key),
        suffixOf: feedbacksKeySuffix
      }),
    [contentConfigs, isContentConfigsError]
  )
  const bannersRegistry = useMemo(
    () =>
      buildSuffixRegistry({
        configs: contentConfigs,
        isError: isContentConfigsError,
        matches: (config) => matchesBannerKey(config.key),
        suffixOf: bannerKeySuffix
      }),
    [contentConfigs, isContentConfigsError]
  )

  // Danh sách bản ghi cho thanh chọn của từng họ config. Chỉ nhận record mà editor chuyên dụng
  // đọc được (`resolveEditor` cũng đòi đúng shape này), và sắp theo key để thứ tự thanh chọn
  // không đổi theo thứ tự API trả về.
  const bannersConfigs = useMemo(
    () =>
      (contentConfigs ?? [])
        .filter((config) => matchesBannerKey(config.key) && config.value?.inputType === InputType.json)
        .sort((a, b) => a.key.localeCompare(b.key)),
    [contentConfigs]
  )
  const productCollectionConfigs = useMemo(
    () => (contentConfigs ?? []).filter(matchesProductCollectionConfig).sort((a, b) => a.key.localeCompare(b.key)),
    [contentConfigs]
  )
  const feedbacksConfigs = useMemo(
    () =>
      (contentConfigs ?? [])
        .filter((config) => matchesFeedbacksKey(config.key) && config.value?.inputType === InputType.json)
        .sort((a, b) => a.key.localeCompare(b.key)),
    [contentConfigs]
  )

  // Danh sách chưa lọc luôn được tải sẵn, nên các singleton dưới đây tra thẳng trong mảng thay
  // vì mỗi cái một query theo `groupName`, và mọi nơi dùng chung một cache entry mà mutation đã
  // invalidate.
  const promotionPopupConfig = useMemo(
    () => contentConfigs?.find((config) => config.key === PROMOTION_POPUP_KEY) ?? null,
    [contentConfigs]
  )
  // `products.signature` cũng là singleton và giờ có category riêng, nên tra thẳng ở đây.
  const signatureLandingConfig = useMemo(
    () =>
      contentConfigs?.find(
        (config) => isProductSignatureKey(config.key) && config.value?.inputType === InputType.json
      ) ?? null,
    [contentConfigs]
  )
  const checkoutPaymentMethodsConfig = useMemo(
    () => contentConfigs?.find((config) => config.key === CHECKOUT_PAYMENT_METHODS_KEY) ?? null,
    [contentConfigs]
  )
  const checkoutDeliveryMethodsConfig = useMemo(
    () => contentConfigs?.find((config) => config.key === CHECKOUT_DELIVERY_METHODS_KEY) ?? null,
    [contentConfigs]
  )

  // Record `card_config.*` là `kind: setting` nên lấy từ danh sách settings.
  const cardSizesConfig = useMemo(
    () => settingConfigs?.find((config) => config.key === CARD_SIZES_KEY) ?? null,
    [settingConfigs]
  )
  const cardPricesConfig = useMemo(
    () => settingConfigs?.find((config) => config.key === CARD_PRICES_KEY) ?? null,
    [settingConfigs]
  )
  const maxWordsAcrossSizes = useMemo(
    () => (cardSizesConfig ? maxWordsOfSizes(parseCardSizes(cardSizesConfig.value.value)) : 0),
    [cardSizesConfig]
  )

  return {
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
  }
}
