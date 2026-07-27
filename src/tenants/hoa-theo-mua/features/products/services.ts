import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type { GetProductsParams } from './hooks/use-get-products'
import type { PinnedProduct, ProductDetail } from './types'
import { productDetailToProduct } from './utils'

class ProductService extends BaseService {
  private readonly baseUrl = 'products'

  getProducts = async ({ pageIndex, pageSize, search, priceFrom, priceTo, sortBy }: GetProductsParams) => {
    const { data } = await this.get<BasePaginationResponse<ProductDetail>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        search,
        priceFrom,
        priceTo,
        sortBy
      }
    })

    return {
      ...data,
      value: {
        ...data.value,
        items: data.value.items.map(productDetailToProduct)
      }
    }
  }

  getPinnedProducts = async ({ categoryId }: { categoryId?: string }) => {
    const { data } = await this.get<BaseResponse<PinnedProduct[]>>(`/v1/${this.baseUrl}-pin`, {
      params: {
        CategoryId: categoryId
      }
    })

    return data.value
  }

  getProduct = async ({ id }: { id: string | number }) => {
    const { data } = await this.get<BaseResponse<ProductDetail>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  moveProduct = async ({ id, position, categoryId }: { id: string; position: number; categoryId?: string }) => {
    // `categoryId` selects which (isPin, position) pair the backend writes: absent → the Product-level
    // position, present → the junction (product ↔ category) position. `undefined` is dropped by JSON
    // serialization, so a global move sends a clean `{ position }` body.
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}/move`, {
      position,
      categoryId
    })

    return data.value
  }

  pinProduct = async ({ body }: { body: { productId: string; isPin: boolean; categoryId?: string } }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/pin`, body)

    return data.value
  }

  getMaxPriceProduct = async ({ categoryId }: { categoryId?: string }) => {
    const { data } = await this.get<BaseResponse<number>>(`/v1/${this.baseUrl}/max-price`, {
      params: {
        categoryId
      }
    })

    return data.value
  }
}

const productService = new ProductService()
export default productService
