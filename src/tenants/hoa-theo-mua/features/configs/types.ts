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
  image: 'image',
  file: 'file',
  address: 'address'
} as const

export type InputType = (typeof InputType)[keyof typeof InputType]

export const InputTypeLabel: Record<InputType, string> = {
  [InputType.text]: 'Text',
  [InputType.textarea]: 'Textarea',
  [InputType.number]: 'Number',
  [InputType.boolean]: 'Boolean',
  [InputType.switch]: 'Switch',
  [InputType.date]: 'Date',
  [InputType.select]: 'Select',
  [InputType.multiSelect]: 'Multi-Select',
  [InputType.json]: 'JSON',
  [InputType.image]: 'Image',
  [InputType.file]: 'File',
  [InputType.address]: 'Address'
} as const

export type InputTypeLabel = (typeof InputTypeLabel)[keyof typeof InputTypeLabel]

export const ConfigKind = {
  secret: 'secret',
  content: 'content',
  setting: 'setting'
} as const

export type ConfigKind = (typeof ConfigKind)[keyof typeof ConfigKind]

export const ConfigKindLabel: Record<ConfigKind, string> = {
  [ConfigKind.secret]: 'systemConfigs.kind.secret',
  [ConfigKind.content]: 'systemConfigs.kind.content',
  [ConfigKind.setting]: 'systemConfigs.kind.setting'
} as const

export type ConfigKindLabel = (typeof ConfigKindLabel)[keyof typeof ConfigKindLabel]

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

export interface InputOption {
  label: string
  value: string | number
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

export const INPUT_TYPE_COLOR: Record<InputType, string> = {
  [InputType.text]: 'text-red-500 bg-red-50',
  [InputType.textarea]: 'text-blue-500 bg-blue-50',
  [InputType.number]: 'text-green-500 bg-green-50',
  [InputType.boolean]: 'text-yellow-500 bg-yellow-50',
  [InputType.switch]: 'text-purple-500 bg-purple-50',
  [InputType.date]: 'text-sky-500 bg-sky-50',
  [InputType.select]: 'text-indigo-500 bg-indigo-50',
  [InputType.multiSelect]: 'text-pink-500 bg-pink-50',
  [InputType.json]: 'text-gray-500 bg-gray-50',
  [InputType.image]: 'text-sky-500 bg-sky-50',
  [InputType.file]: 'text-orange-500 bg-orange-50',
  [InputType.address]: 'text-red-500 bg-red-50'
}

export interface GetConfigsParams {
  groupName?: string
  key?: string
}
