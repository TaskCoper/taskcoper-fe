import type { BasePaginationResponse } from '@/lib/axios'
import htmApi from '../../lib/api'
import type { GetCategoryParams, NewsCategoryRow } from './type'

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
}
const newsCategoryService = new NewsCategory()
export default newsCategoryService
