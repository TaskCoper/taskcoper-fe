import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type { GetProductsParams } from './hooks/use-get-products'
import type {
  AssignProductsPayload,
  CategoryProduct,
  CategoryProductPayload,
  GetCategoryProductsParams,
  Product,
  ProductDetail
} from './types'
import { CategoryProductType } from './types'
import type { CategoryProductFormValues } from './validations'

type MessageResponse = string | { message?: string }

/**
 * Map the form values onto the create/update payload: drop the campaign window for `Fix`
 * categories (the picker already emits ISO strings) and only send `parentId` when set.
 */
const toCategoryPayload = ({
  type,
  startTime,
  endTime,
  parentId,
  ...rest
}: CategoryProductFormValues): CategoryProductPayload => {
  const isCampaign = type === CategoryProductType.Campaign

  return {
    ...rest,
    type,
    startTime: isCampaign ? (startTime ?? null) : null,
    endTime: isCampaign ? (endTime ?? null) : null,
    ...(parentId ? { parentId } : {})
  }
}

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

class CategoryProductService extends BaseService {
  private readonly baseUrl = 'category-products'

  getCategories = async ({ pageIndex, pageSize, keyword }: GetCategoryProductsParams) => {
    const { data } = await this.get<BasePaginationResponse<CategoryProduct>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        keyword
      }
    })

    return data
  }

  getCategory = async ({ id }: { id?: string }) => {
    const { data } = await this.get<BaseResponse<CategoryProduct>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  addCategory = async ({ body }: { body: CategoryProductFormValues }) => {
    const { data } = await this.post<BaseResponse<CategoryProduct>>(`/v1/${this.baseUrl}`, toCategoryPayload(body))

    return data.value
  }

  updateCategory = async ({ id, body }: { id?: string; body: CategoryProductFormValues }) => {
    const { data } = await this.put<BaseResponse<CategoryProduct>>(`/v1/${this.baseUrl}/${id}`, toCategoryPayload(body))

    return data.value
  }

  deleteCategory = async ({ id }: { id: string }) => {
    const { data } = await this.delete<BaseResponse<MessageResponse>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  // Full replacement of the category's product list — never a delta (§4.6, §6.5).
  assignProducts = async ({ id, body }: { id: string; body: AssignProductsPayload }) => {
    const { data } = await this.put<BaseResponse<MessageResponse>>(`/v1/${this.baseUrl}/${id}/products`, body)

    return data.value
  }
}

const productService = new ProductService()
export const categoryProductService = new CategoryProductService()
export default productService
