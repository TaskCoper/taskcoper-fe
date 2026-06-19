export interface NewsCategoryRow {
  categoryId: string
  title: string
  userId: string
  parentId: string | null
  parent: NewsCategoryRow | null
  children: NewsCategoryRow[]
  count: number | null
}
export interface GetCategoryParams {
  pageIndex?: number
  pageSize?: number
}
