export const CategoryProductType = {
  Fix: 'Fix',
  Campaign: 'Campaign'
} as const

export type CategoryProductType = (typeof CategoryProductType)[keyof typeof CategoryProductType]

export interface CategoryMetadata {
  filterByName?: boolean
  filterByPrice?: boolean
  isFilterable?: boolean
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
}

/** Payload carried by every draggable node in the (arbitrarily deep) category sort tree. */
export interface CategoryNodeDragData {
  type: 'CategoryNode'
  category: SortableCategory
}

/** Payload for the empty drop zone a childless node exposes so a node can be nested into it. */
export interface CategoryDropZoneData {
  type: 'CategoryDropZone'
  containerId: string
}
