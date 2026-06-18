export const ArticleStatus = {
  Published: 'Published',
  Draft: 'Draft'
} as const

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus]

export const ArticleStatusLabel: Record<ArticleStatus, string> = {
  [ArticleStatus.Published]: 'tenant.hoaTheoMua.articles.status.published',
  [ArticleStatus.Draft]: 'tenant.hoaTheoMua.articles.status.draft'
}
export type ArticleStatusLabel = (typeof ArticleStatusLabel)[ArticleStatus]
export interface ArticleRow {
  id: string
  title: string
  description: string
  viewCount: number
  pictureUrl: string | null
  slug: string
  status: ArticleStatus
  userId: string
  userFirstName: string
  userLastName: string
  categories: CategoryResponse[]
  createdAt: string
  updatedAt: string | null
}

export interface CategoryData {
  categoryId: string
  title: string
}

export interface CategoryResponse {
  categoryId: string
  categoryName: string
}
