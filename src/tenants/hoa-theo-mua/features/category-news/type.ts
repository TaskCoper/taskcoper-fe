export interface NewsCategoryRow {
  categoryId: string
  title: string
  userId: string
  parentId: string
  parent: NewsCategoryRow
  children: NewsCategoryRow[]
  count: number
}
export interface GetCategoryParams {
  pageIndex?: number
  pageSize?: number
}
