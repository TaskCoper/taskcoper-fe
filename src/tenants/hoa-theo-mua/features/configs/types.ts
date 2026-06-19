export type ConfigInputType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'select'
  | 'address'
  | 'checkbox'
  | 'switch-group'
  | 'date'
  | 'dateRange'

export type ConfigSystemItem = {
  key: string
  value: {
    label: string
    description?: string
    group: string
    inputType: ConfigInputType
    value: unknown
    isActive?: boolean
    isEditable?: boolean
    order?: number
    unit?: string
    placeholder?: string
    options?: Array<{ label: string; value: string | number }>
    items?: unknown[]
    validations?: {
      required?: boolean
      min?: number
      max?: number
      minLength?: number
      maxLength?: number
      pattern?: string
    }
  }
}
