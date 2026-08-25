export type ComboMaterialRole = 1 | 2 | '1' | '2' | 'Core' | 'Support'

export interface ComboMaterial {
  materialId: string
  subId?: string | null
  materialName?: string | null
  coverImage?: string | null
  role?: ComboMaterialRole | null
  roleName?: string | null
  isCore: boolean
  quantityPerCombo: number
  unit: string | null
  availableForSale: number | null
  maxComboPossible: number | null
}

export interface ComboSpecification {
  subId: string
  productCode: string
  productName: string
  isActive?: boolean | null
  factor?: number | null
  materials: ComboMaterial[]
}

export type MaterialProductLabel = 'Thành phần' | 'Phụ liệu'

export interface MaterialOption {
  materialId: string
  materialCode: string
  materialName: string
  coverImage?: string | null
  unit: string | null
  availableForSale: number | null
}

export interface MaterialsPage {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  items: MaterialOption[]
}

export interface UpdateComboSpecificationMaterial {
  matId: string
  quantity: number
  isCore: boolean
  isActive: boolean
}

export interface UpdateComboSpecificationPayload {
  subId: string
  factor: number | null
  materials: UpdateComboSpecificationMaterial[]
}

export interface DeleteComboSpecificationItemsPayload {
  materials: string[]
}
export interface UpdateComboSpecificationItem {
  matId: string
  quantity: number
  isCore: boolean
  isActive: boolean
}

export interface UpdateComboSpecificationItemsPayload {
  items: UpdateComboSpecificationItem[]
}

export type AddComboSpecificationItem = UpdateComboSpecificationItem

export interface AddComboSpecificationItemsPayload {
  items: AddComboSpecificationItem[]
}
