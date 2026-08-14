export const CategoryProductType = {
  Fix: 'Fix',
  Campaign: 'Campaign'
} as const

export type CategoryProductType = (typeof CategoryProductType)[keyof typeof CategoryProductType]

export const CategoryProductPage = {
  Home: 'Home',
  Products: 'Products',
  Business: 'Business',
  About: 'About',
  News: 'News',
  Recruitment: 'Recruitment',
  Contact: 'Contact',
  Mainline: 'Mainline',
  Featured: 'Featured'
} as const

export type CategoryProductPage = (typeof CategoryProductPage)[keyof typeof CategoryProductPage]

export const CategoryProductPageLabel: Record<CategoryProductPage, string> = {
  [CategoryProductPage.Home]: 'productCategories.pageOption.home',
  [CategoryProductPage.Products]: 'productCategories.pageOption.products',
  [CategoryProductPage.Business]: 'productCategories.pageOption.business',
  [CategoryProductPage.About]: 'productCategories.pageOption.about',
  [CategoryProductPage.News]: 'productCategories.pageOption.news',
  [CategoryProductPage.Recruitment]: 'productCategories.pageOption.recruitment',
  [CategoryProductPage.Contact]: 'productCategories.pageOption.contact',
  [CategoryProductPage.Mainline]: 'productCategories.pageOption.mainline',
  [CategoryProductPage.Featured]: 'productCategories.pageOption.featured'
} as const

export type CategoryProductPageLabel = (typeof CategoryProductPageLabel)[keyof typeof CategoryProductPageLabel]

export interface CategoryMetadata {
  filterByName?: boolean
  filterByPrice?: boolean
  isFilterable?: boolean
  /** Grid layout for this parent category's product section — rows/cols of items rendered on the UI. */
  rows?: number | null
  cols?: number | null
}

/** `metaData` comes back as a JSON-encoded string (or null) — parse it defensively. */
export const parseCategoryMetadata = (metaData: string | null): CategoryMetadata => {
  if (!metaData) return {}
  try {
    return JSON.parse(metaData) as CategoryMetadata
  } catch {
    return {}
  }
}

export interface Category {
  categoryId: string
  name: string
  name_En: string | null

  description: string | null
  description_En: string | null

  position: number | null

  metaData: string | null

  startTime: string | null
  endTime: string | null

  type: CategoryProductType
  isActive: boolean

  userId: string
  parentId: string | null

  parent: Category | null
  children: Category[]

  productCount: number | null
  productIds: string[] | null

  page: CategoryProductPage[] | null
}

export interface GetCategoriesParams {
  pageIndex?: number
  pageSize?: number
  keyword?: string
}

export interface CreateCategoryPayload {
  name: string
  name_En: string | null
  description: string | null
  description_En: string | null
  position: number | null
  metaData: string | null
  type: CategoryProductType
  isActive: boolean
  startTime: string | null
  endTime: string | null
  parentId?: string | null
  page?: CategoryProductPage[]
}

export interface AssignProductsPayload {
  productIds: string[]
}

export interface SortableCategory {
  categoryId: string
  name: string
  nameEn: string | null
  description: string | null
  descriptionEn: string | null
  position: number | null
  metaData: string | null
  startTime: string | null
  endTime: string | null
  type: CategoryProductType
  userId: string
  parentId: string | null
  children: SortableCategory[]
  page: CategoryProductPage[] | null
}

/** Payload carried by every draggable node in the (arbitrarily deep) category sort tree. */
export interface CategoryNodeDragData {
  type: 'CategoryNode'
  category: SortableCategory
}
