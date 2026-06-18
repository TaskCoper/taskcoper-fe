import type { BasePaginationResponse, BaseResponse } from '@/lib/axios'
import htmApi from '@/tenants/hoa-theo-mua/lib/api'
import type { GetArticlesParams } from './hooks/use-get-articles'
import type { GetCategoryNewsParam } from './hooks/use-get-categories'
import type { ArticleRow, CategoryData } from './types'
import type { AddArticleForm } from './validations'

export interface ArticleParams {
  id: string
}

class ArticleService {
  private readonly baseUrl = 'news'
  getArticles = async ({ pageIndex, pageSize, keyword, status }: GetArticlesParams) => {
    const { data } = await htmApi.get<BasePaginationResponse<ArticleRow>>(`v1/${this.baseUrl}`, {
      params: {
        pageIndex,
        pageSize,
        keyword,
        status
      }
    })

    return data
  }

  getArticlesById = async ({ id }: ArticleParams) => {
    const { data } = await htmApi.get<BaseResponse<ArticleRow>>(`/v1/${this.baseUrl}/${id}`)
    return data
  }

  addArticle = async ({ body }: { body: AddArticleForm }) => {
    const { categories, ...rest } = body

    const payload = {
      ...rest,
      categoryIds: categories.map((x) => x.id)
    }

    const { data } = await htmApi.post<BaseResponse<string>>(`/v1/${this.baseUrl}`, payload)
    return data.value
  }

  getCategoryNews = async ({ pageIndex, pageSize }: GetCategoryNewsParam) => {
    const { data } = await htmApi.get<BasePaginationResponse<CategoryData>>(`v1/category-news`, {
      params: {
        pageIndex,
        pageSize
      }
    })
    return data
  }

  deleteArticle = async ({ id }: ArticleParams) => {
    const { data } = await htmApi.delete<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}`)

    return data.value
  }

  updateArticle = async ({
    id,
    body
  }: ArticleParams & {
    body: AddArticleForm
  }) => {
    const { categories, ...rest } = body

    const payload = {
      ...rest,
      categoryIds: categories.map((x) => x.id)
    }

    const { data } = await htmApi.put<BaseResponse<string>>(`/v1/${this.baseUrl}/${id}`, payload)
    return data.value
  }
}
const articleService = new ArticleService()
export default articleService
