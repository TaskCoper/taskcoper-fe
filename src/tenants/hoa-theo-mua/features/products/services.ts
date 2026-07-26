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
  name_En,
  description,
  description_En,
  metaData,
  ...rest
}: CategoryProductFormValues): CategoryProductPayload => {
  const isCampaign = type === CategoryProductType.Campaign

  // A child category (has a parent) only carries `isFilterable`; a parent carries the filter inputs.
  const scopedMetadata = parentId
    ? { isFilterable: metaData.isFilterable }
    : { filterByName: metaData.filterByName, filterByPrice: metaData.filterByPrice }

  return {
    ...rest,
    type,
    name_En: name_En?.trim() || null,
    description: description?.trim() || null,
    description_En: description_En?.trim() || null,
    metaData: JSON.stringify(scopedMetadata),
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

  /**
   * Persist a new sort position for a category. Reuses the PUT contract, echoing the category's
   * current fields back (metaData is already a stored JSON string) with only `position` changed.
   */
  reorderCategory = async ({ category, position }: { category: CategoryProduct; position: number }) => {
    const payload: CategoryProductPayload = {
      name: category.name,
      name_En: category.name_En,
      description: category.description,
      description_En: category.description_En,
      position,
      metaData: category.metaData,
      type: category.type,
      isActive: category.isActive,
      startTime: category.startTime,
      endTime: category.endTime,
      ...(category.parentId ? { parentId: category.parentId } : {})
    }

    const { data } = await this.put<BaseResponse<CategoryProduct>>(
      `/v1/${this.baseUrl}/${category.categoryId}`,
      payload
    )

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
