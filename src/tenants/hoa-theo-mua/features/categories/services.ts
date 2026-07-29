import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '../../services/base.service'
import type {
  AssignProductsPayload,
  Category,
  CategoryProductPage,
  CreateCategoryPayload,
  GetCategoriesParams,
  SortableCategory
} from './types'
import { CategoryProductType } from './types'
import type { CategoryProductFormValues, UpdateProductCategoriesFormValues } from './validations'

type MessageResponse = string | { message?: string }

const toCategoryPayload = ({
  type,
  startTime,
  endTime,
  parentId,
  name_En,
  description,
  description_En,
  metaData,
  page,
  ...rest
}: CategoryProductFormValues): CreateCategoryPayload => {
  const isCampaign = type === CategoryProductType.Campaign

  // A child category (has a parent) only carries `isFilterable`; a parent carries the filter inputs
  // plus the product grid layout (`rows`/`cols`) for its section.
  const scopedMetadata = parentId
    ? { isFilterable: metaData.isFilterable }
    : {
        filterByName: metaData.filterByName,
        filterByPrice: metaData.filterByPrice,
        rows: metaData.rows,
        cols: metaData.cols
      }

  return {
    ...rest,
    type,
    name_En: name_En?.trim() || null,
    description: description?.trim() || null,
    description_En: description_En?.trim() || null,
    metaData: JSON.stringify(scopedMetadata),
    startTime: isCampaign ? (startTime ?? null) : null,
    endTime: isCampaign ? (endTime ?? null) : null,
    page: parentId ? [] : page,
    ...(parentId ? { parentId } : {})
  }
}

class CategoryService extends BaseService {
  private readonly baseUrl = 'category-products'

  getCategories = async ({ pageIndex, pageSize, keyword }: GetCategoriesParams) => {
    const { data } = await this.get<BasePaginationResponse<Category>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        keyword
      }
    })

    return data
  }

  getCategory = async ({ id }: { id?: string }) => {
    const { data } = await this.get<BaseResponse<Category>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  addCategory = async ({ body }: { body: CategoryProductFormValues }) => {
    const { data } = await this.post<BaseResponse<Category>>(`/v1/${this.baseUrl}`, toCategoryPayload(body))

    return data.value
  }

  updateCategory = async ({ id, body }: { id?: string; body: CategoryProductFormValues }) => {
    const { data } = await this.put<BaseResponse<Category>>(`/v1/${this.baseUrl}/${id}`, toCategoryPayload(body))

    return data.value
  }

  reorderCategory = async ({
    category,
    position,
    parentId
  }: {
    category: SortableCategory
    position: number
    parentId?: string | null
  }) => {
    const nextParentId = parentId !== undefined ? parentId : category.parentId

    const payload: CreateCategoryPayload = {
      name: category.name,
      name_En: category.nameEn,
      description: category.description,
      description_En: category.descriptionEn,
      position,
      metaData: category.metaData,
      type: category.type,
      isActive: true,
      startTime: category.startTime,
      endTime: category.endTime,
      ...(nextParentId ? { parentId: nextParentId } : {})
    }

    const { data } = await this.put<BaseResponse<Category>>(`/v1/${this.baseUrl}/${category.categoryId}`, payload)

    return data.value
  }

  deleteCategory = async ({ id }: { id: string }) => {
    const { data } = await this.delete<BaseResponse<MessageResponse>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  assignProducts = async ({ id, body }: { id: string; body: AssignProductsPayload }) => {
    const { data } = await this.put<BaseResponse<MessageResponse>>(`/v1/${this.baseUrl}/${id}/products`, body)

    return data.value
  }

  getSortableCategories = async ({ page }: { page?: CategoryProductPage[] }) => {
    const { data } = await this.get<BaseResponse<SortableCategory[]>>(`/v1/${this.baseUrl}/with-children`, {
      params: {
        page
      }
    })

    return data.value
  }

  updateProductCategories = async ({ body }: { body: UpdateProductCategoriesFormValues }) => {
    const { data } = await this.put<BaseResponse<string>>(`/v1/${this.baseUrl}/detail`, body)

    return data.value
  }
}

const categoryService = new CategoryService()
export default categoryService
