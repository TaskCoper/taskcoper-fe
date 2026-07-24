import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type { GetProductsParams } from './hooks/use-get-products'
import type { Product, ProductDetail } from './types'

class ProductService extends BaseService {
  private readonly baseUrl = 'products'

  getProducts = async ({ PageIndex, PageSize, PriceFrom, PriceTo, SortBy }: GetProductsParams) => {
    const { data } = await this.get<BasePaginationResponse<Product>>(`/v1/${this.baseUrl}`, {
      params: {
        PageIndex,
        PageSize,
        PriceFrom,
        PriceTo,
        SortBy
      }
    })

    return data
  }

  getProduct = async ({ id }: { id: string | number }) => {
    const { data } = await this.get<BaseResponse<ProductDetail>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }
}

const productService = new ProductService()
export default productService
