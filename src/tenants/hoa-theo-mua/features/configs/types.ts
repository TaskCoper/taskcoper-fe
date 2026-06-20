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

// Legacy type — kept for backward compat with existing components
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

// ─── Dynamic config key types ───────────────────────────────────────────────

export type ConfigValidationRule = Record<string, string | number | boolean>

export type ConfigOption = { label: string; value: string }

export type ConfigSwitch = { key: string; label: string }

export type AddressValue = {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export type DateRangeValue = { from?: string; to?: string }

export type ConfigRecordValue = {
  group: string
  label: string
  description?: string
  inputType: ConfigInputType
  value: unknown
  required?: boolean
  active?: boolean
  validations?: ConfigValidationRule[]
  options?: ConfigOption[]
  switches?: ConfigSwitch[]
}

export type ConfigRecord = {
  id: string
  key: string
  userId: string
  value: ConfigRecordValue
  _isNew?: boolean
}
