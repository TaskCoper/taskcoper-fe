import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import { BaseService } from '@/tenants/hoa-theo-mua/services/base.service'
import type { GetCategoryParams, NewsCategoryRow } from './types'
import type { AddCategoryFormValues } from './validations'

type MessageResponse = string | { message?: string }

const getCategoryPayload = ({ parentId, ...rest }: AddCategoryFormValues) => ({
  ...rest,
  ...(parentId ? { parentId } : {})
})

class NewsCategory extends BaseService {
  private readonly baseUrl = 'category-news'

  getNewsCategories = async ({ pageIndex, pageSize }: GetCategoryParams) => {
    const { data } = await this.get<BasePaginationResponse<NewsCategoryRow>>(`/v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize
      }
    })
    return data
  }

  getNewsCategory = async ({ id }: { id?: string }) => {
    const { data } = await this.get<BaseResponse<NewsCategoryRow>>(`/v1/${this.baseUrl}/${id}`)
    return data
  }

  addNewsCategory = async ({ body }: { body: AddCategoryFormValues }) => {
    const { data } = await this.post<BaseResponse<NewsCategoryRow>>(`/v1/${this.baseUrl}`, getCategoryPayload(body))
    return data.value
  }

  deleteNewsCategory = async ({ id }: { id: string }) => {
    const { data } = await this.delete<BaseResponse<MessageResponse>>(`/v1/${this.baseUrl}/${id}`)
    return data.value
  }

  updateNewsCategory = async ({
    id,
    body
  }: { id: string | undefined } & {
    body: AddCategoryFormValues
  }) => {
    const { data } = await this.put<BaseResponse<MessageResponse>>(
      `/v1/${this.baseUrl}/${id}`,
      getCategoryPayload(body)
    )

    return data.value
  }
}
const newsCategoryService = new NewsCategory()
export default newsCategoryService
