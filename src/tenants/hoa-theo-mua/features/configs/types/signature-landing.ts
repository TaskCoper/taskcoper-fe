/** Document `products.signature`: bảng ánh xạ product id -> URL landing page. */

export type SignatureLandingMap = Record<string, string>

/** Các sản phẩm dùng chung một URL, gom thành một hàng sửa được. */
export interface SignatureLandingGroup {
  uid: string
  url: string
  productIds: string[]
}

export interface SignatureProductRef {
  id: string
  productName: string | null
  productCode: string | null
  coverImage: string | null
}
