import type { ErrorResponse } from '@/lib/axios'
import { isAxiosError } from 'axios'
import { CARD_CONFIG_GROUP } from '../../card-config-palette'
import configService from '../../services'
import { ConfigKind, InputType, type Config } from '../../types'
import type { CreateConfigFormValues } from '../../validations'

/**
 * `card_config.sizes` và `card_config.prices` là hai singleton dùng chung một dạng document
 * (`{ items: [...] }`) và một luồng lưu, chỉ khác key với nội dung `items`.
 */
export async function saveCardConfigDocument({
  key,
  label,
  items,
  existingConfig
}: {
  key: string
  label: string
  items: unknown[]
  existingConfig: Config | null
}): Promise<'created' | 'updated'> {
  const body: CreateConfigFormValues = {
    key,
    isPublic: true,
    group: CARD_CONFIG_GROUP,
    kind: ConfigKind.setting,
    value: {
      group: CARD_CONFIG_GROUP,
      label,
      inputType: InputType.json,
      required: false,
      options: [],
      validations: [],
      value: JSON.stringify({ items })
    }
  }

  if (existingConfig) {
    await configService.updateConfig({ id: existingConfig.id, body })
    return 'updated'
  }
  await configService.createConfig({ body })
  return 'created'
}

/** BE trả 409 khi có hơn một record active cho cùng (group, key). */
export const isAmbiguousCardConfigError = (error: unknown): boolean =>
  isAxiosError<ErrorResponse>(error) && error.response?.data?.messageCode === 'CARD_CONFIG_AMBIGUOUS'
