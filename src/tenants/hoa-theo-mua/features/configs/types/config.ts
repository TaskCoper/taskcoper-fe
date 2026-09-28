/**
 * Bản thân config record: lớp vỏ mà mọi row trong feature này được lưu trong đó.
 *
 * `InputType` và `ConfigKind` là enum dạng const object chứ không phải union thuần, vì nơi gọi
 * dùng thành viên của chúng như giá trị (`InputType.json`, `ConfigKind.content`). Chúng đặt ở đây,
 * cạnh các shape mà chúng phân loại, để contract của một record đọc trọn trong một file.
 */

export const InputType = {
  text: 'text',
  textarea: 'textarea',
  number: 'number',
  boolean: 'boolean',
  switch: 'switch',
  date: 'date',
  select: 'select',
  multiSelect: 'multiSelect',
  json: 'json',
  file: 'file',
  address: 'address'
} as const

export type InputType = (typeof InputType)[keyof typeof InputType]

export const ConfigKind = {
  secret: 'secret',
  content: 'content',
  setting: 'setting'
} as const

export type ConfigKind = (typeof ConfigKind)[keyof typeof ConfigKind]

export type ValidationRule =
  | { minLength: number }
  | { maxLength: number }
  | { min: number }
  | { max: number }
  | { pattern: string } // regex source, vd "^[a-z]+$"
  | { enum: Array<string | number> }
  | { email: true }
  | { url: true }
  | { integer: true }

export interface InputOption {
  label: string
  value: string | number
}

export interface ConfigDefinition {
  group: string
  label: string
  inputType: InputType
  value: unknown
  description?: string
  required: boolean
  options?: InputOption[]
  validations: ValidationRule[]
}

export interface Config {
  id: string
  key: string
  isPublic: boolean
  value: ConfigDefinition
  kind: ConfigKind
  userId: string
  group: string
}

export interface GetConfigsParams {
  groupName?: string
  key?: string
}
