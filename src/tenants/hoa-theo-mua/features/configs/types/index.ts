/**
 * Contract miền của feature config, chia theo từng họ config.
 *
 * Thuộc về đây: shape của document đã *lưu* - JSON của một config record trông thế nào sau khi
 * parse - cùng các enum đóng dựng nên shape đó (`InputType`, `FEEDBACK_SOURCES`, …). Đây là
 * contract dùng chung với storefront nên có một chỗ ở chính thức.
 *
 * Không thuộc về đây, mà nên nằm cạnh code sở hữu nó: túi options của một hàm
 * (`AhamovePayloadInput`), union kết quả validate (`CardSizesIssue`), một dòng bảng tra
 * (`BannerShape`), contract riêng của một store (`state/dirty-registry-store.ts`), và mọi thứ suy
 * ra từ schema Zod (`validations.ts` - ở đó schema mới là nguồn sự thật).
 *
 * Tất cả đều re-export qua barrel này nên `import { … } from '../../types'` luôn chạy, bất kể một
 * type nằm ở file nào.
 */

export * from './b2b-overview'
export * from './b2b-service'
export * from './banners'
export * from './card-config'
export * from './checkout'
export * from './config'
export * from './feedbacks'
export * from './localized'
export * from './postgen'
export * from './product-collection'
export * from './promotion-popup'
export * from './registry'
export * from './signature-landing'
