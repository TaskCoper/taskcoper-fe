import { ConfigKind, InputType } from '../../types'

/**
 * Nhãn hiển thị cho hai enum của config. Đây là phần trình bày, không phải contract, nên đặt cạnh
 * form render chúng thay vì trong `types/`.
 */

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
  [InputType.file]: 'File',
  [InputType.address]: 'Address'
} as const

export type InputTypeLabel = (typeof InputTypeLabel)[keyof typeof InputTypeLabel]

export const ConfigKindLabel: Record<ConfigKind, string> = {
  [ConfigKind.secret]: 'systemConfigs.kind.secret',
  [ConfigKind.content]: 'systemConfigs.kind.content',
  [ConfigKind.setting]: 'systemConfigs.kind.setting'
} as const

export type ConfigKindLabel = (typeof ConfigKindLabel)[keyof typeof ConfigKindLabel]
