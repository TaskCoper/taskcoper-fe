import type { BasePaginationResponse } from '@/lib/axios'
import htmApi from '@/tenants/hoa-theo-mua/lib/api'
import type { GetArticlesParams } from './hooks/use-get-articles'
import type { ArticleRow } from './types'

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
}
const articleService = new ArticleService()
export default articleService
