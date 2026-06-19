import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { GetCategoryParams, NewsCategoryRow } from './type'
import type { AddCategoryFormValues } from './validation'

type MessageResponse = string | { message?: string }

const getCategoryPayload = ({ parentId, ...rest }: AddCategoryFormValues) => ({
  ...rest,
  ...(parentId ? { parentId } : {})
})

class NewsCategory {
  private readonly baseUrl = 'category-news'

  getNewsCategories = async ({ pageIndex, pageSize }: GetCategoryParams) => {
    const { data } = await htmApi.get<BasePaginationResponse<NewsCategoryRow>>(`v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize
      }
    })
    return data
  }

  getNewsCategory = async ({ id }: { id?: string }) => {
    const { data } = await htmApi.get<BaseResponse<NewsCategoryRow>>(`v1/${this.baseUrl}/${id}`)
    return data
  }

  addNewsCategory = async ({ body }: { body: AddCategoryFormValues }) => {
    const { data } = await htmApi.post<BaseResponse<NewsCategoryRow>>(`/v1/${this.baseUrl}`, getCategoryPayload(body))
    return data.value
  }

  deleteNewsCategory = async ({ id }: { id: string }) => {
    const { data } = await htmApi.delete<BaseResponse<MessageResponse>>(`v1/${this.baseUrl}/${id}`)
    return data.value
  }

  updateNewsCategory = async ({
    id,
    body
  }: { id: string | undefined } & {
    body: AddCategoryFormValues
  }) => {
    const { data } = await htmApi.put<BaseResponse<MessageResponse>>(
      `/v1/${this.baseUrl}/${id}`,
      getCategoryPayload(body)
    )

    return data.value
  }
}
const newsCategoryService = new NewsCategory()
export default newsCategoryService
