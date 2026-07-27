import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type { GetProductsParams } from './hooks/use-get-products'
import type { PinnedProduct, ProductDetail, ProductListItem } from './types'
import { productDetailToProduct } from './utils'

class ProductService extends BaseService {
  private readonly baseUrl = 'products'

  getProducts = async ({ pageIndex, pageSize, priceFrom, priceTo, sortBy }: GetProductsParams) => {
    // The list endpoint returns numeric price/stock fields (same shape as ProductDetail), while the
    // table renders the raw-string `Product` shape — map each item so every column resolves correctly.
    const { data } = await this.get<BasePaginationResponse<ProductListItem>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
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

  getPinnedProducts = async () => {
    const { data } = await this.get<BaseResponse<PinnedProduct[]>>(`/v1/${this.baseUrl}-pin`)

    return data.value
  }

  getProduct = async ({ id }: { id: string | number }) => {
    const { data } = await this.get<BaseResponse<ProductDetail>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  moveProduct = async ({ id, position }: { id: string; position: number }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}/move`, {
      position
    })

    return data.value
  }

  pinProduct = async ({ body }: { body: { productId: string; isPin: boolean } }) => {
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
