import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useRevealConfig } from '../../hooks/use-reveal-config'
import { configKeys } from '../../query-keys'
import configService from '../../services'
import { useRegisterDirtyRow } from '../../state/dirty-registry-hooks'
import { ConfigKind, InputType, type Config } from '../../types'
import { buildValueValidator } from '../../validations'

export interface InlineForm {
  value: unknown
}

/**
 * Group mà một lệnh ghi phải mang theo. `configExportSchema` từ chối mọi body có `value.group`
 * khác prefix của key, nên prefix thắng. Đọc `config.value?.group` có phòng thủ vì record API trả
 * về thiếu `value` sẽ ném lỗi ngay tại đây.
 */
const resolveWriteGroup = (config: Config): string => config.key.split('.')[0] || config.value?.group || ''

export interface ConfigRowState {
  form: UseFormReturn<InlineForm>
  /** Gắn vào phần tử ngoài cùng của row: điểm neo mà nút "Xem lại" của registry focus tới. */
  rowRef: ReturnType<typeof useRegisterDirtyRow>

  isDirty: boolean
  isSavingValue: boolean
  isTogglingPublic: boolean
  errorMessage?: string
  /**
   * Kết quả lần ghi gần nhất, dùng cho live region của row. Toast ở góc màn hình và spinner biến
   * mất không đến được trình đọc màn hình, nhất là với autosave.
   */
  saveStatus: 'idle' | 'saving' | 'saved' | 'failed'
  /** Id của phần tử mô tả lỗi validate hiện tại, dùng cho `aria-describedby`. */
  errorId: string

  /** Row kiểu boolean ghi ngay khi gạt và không bao giờ hiện nút Lưu. */
  isAutosaved: boolean

  isSecret: boolean
  isRevealed: boolean
  isRevealingConfig: boolean
  /** `true` khi giá trị secret còn phải che - không được render control sửa được. */
  isValueHidden: boolean

  save: () => void
  revert: () => void
  saveImmediately: (value: unknown) => void
  togglePublic: (isPublic: boolean) => void
  reveal: () => void
}

/**
 * Toàn bộ hành vi của một config row: state form, validate, hai mutation, mở khoá secret và việc
 * tham gia dirty registry.
 */
export const useConfigRow = (config: Config): ConfigRowState => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  const initialValue = useMemo(
    () =>
      config.value.inputType === InputType.multiSelect
        ? Array.isArray(config.value.value)
          ? config.value.value
          : []
        : config.value.value,
    [config.value.inputType, config.value.value]
  )

  const resolver = useMemo(() => zodResolver(z.object({ value: buildValueValidator(config.value) })), [config.value])
  const form = useForm<InlineForm>({ defaultValues: { value: initialValue }, resolver })
  const isDirty = form.formState.isDirty

  const isAutosaved = config.value.inputType === InputType.boolean || config.value.inputType === InputType.switch
  const isSecret = config.kind === ConfigKind.secret

  const [isRevealed, setIsRevealed] = useState(false)
  const [revealedValue, setRevealedValue] = useState<unknown>(undefined)
  const { revealConfig, isRevealingConfig } = useRevealConfig()

  const {
    mutate: saveValue,
    isPending: isSavingValue,
    isSuccess: isSaveSuccess,
    isError: isSaveError
  } = useMutation({
    mutationFn: (value: unknown) => {
      const group = resolveWriteGroup(config)

      return configService.updateConfig({
        id: config.id,
        body: {
          key: config.key,
          group,
          kind: config.kind,
          isPublic: config.isPublic,
          value: { ...config.value, group, value }
        }
      })
    },
    onSuccess: (_, saved) => {
      toast.success(t('configKeys.toast.updated'))
      // Chỉ khi thành công: lệnh ghi lỗi phải giữ nguyên bản nháp.
      form.reset({ value: saved })
    },
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: () => queryClient.invalidateQueries({ queryKey: configKeys.all })
  })

  const {
    mutate: togglePublic,
    isPending: isTogglingPublic,
    isSuccess: isPublicSuccess,
    isError: isPublicError
  } = useMutation({
    mutationFn: (isPublic: boolean) => {
      const group = resolveWriteGroup(config)
      // Gửi giá trị ĐÃ LƯU chứ không phải bản nháp: switch này đổi khả năng hiển thị, không đổi nội dung.
      const value = isSecret && isRevealed ? revealedValue : config.value.value

      return configService.updateConfig({
        id: config.id,
        body: { key: config.key, group, kind: config.kind, isPublic, value: { ...config.value, group, value } }
      })
    },
    onSuccess: () => toast.success(t('configKeys.toast.updated')),
    onError: () => toast.error(t('configKeys.toast.error')),
    onSettled: () => queryClient.invalidateQueries({ queryKey: configKeys.all })
  })

  const save = form.handleSubmit(({ value }) => saveValue(value))

  const revert = useCallback(() => form.reset({ value: initialValue }), [form, initialValue])

  const reveal = useCallback(() => {
    revealConfig(
      { id: config.id },
      {
        onSuccess: (revealed) => {
          form.reset({ value: revealed.value.value })
          setRevealedValue(revealed.value.value)
          setIsRevealed(true)
        },
        onError: () => toast.error(t('configKeys.toast.error'))
      }
    )
  }, [revealConfig, config.id, form, t])

  // `isDirty` và `isSaving` báo độc lập nhau: "sửa rồi Lưu" bật cả hai, và lưu lỗi thì `isDirty`
  // giữ `true` để bản nháp còn đó.
  //
  // Row kiểu boolean là ngoại lệ. Handler của chúng gọi `field.onChange` trước khi ghi, nên RHF
  // đánh dấu dirty suốt một lượt autosave mà người dùng chẳng cần xem lại; chặn điều hướng lúc đó
  // sẽ giam họ sau một hộp xác nhận cho lệnh ghi đã bay đi. Vì vậy khi đang lưu, row loại này báo
  // là sạch. Nếu ghi LỖI, `isSaving` tắt trong khi form vẫn giữ giá trị mới, và row trở thành
  // dirty đúng nghĩa: nó đang lệch với server.
  const rowRef = useRegisterDirtyRow({
    configId: config.id,
    configKey: config.key,
    isDirty: isAutosaved ? isDirty && !isSavingValue : isDirty,
    // `togglePublic` không chạm vào form nên chỉ là việc đang bay, không để lại dấu vết dirty nào.
    isSaving: isSavingValue || isTogglingPublic,
    onReset: revert
  })

  return {
    form,
    rowRef,
    isDirty,
    isSavingValue,
    isTogglingPublic,
    errorMessage: form.formState.errors.value?.message as string | undefined,
    errorId: `cfg-err-${config.id}`,
    saveStatus:
      isSavingValue || isTogglingPublic
        ? 'saving'
        : isSaveError || isPublicError
          ? 'failed'
          : isSaveSuccess || isPublicSuccess
            ? 'saved'
            : 'idle',
    isAutosaved,
    isSecret,
    isRevealed,
    isRevealingConfig,
    isValueHidden: isSecret && !isRevealed,
    save,
    revert,
    saveImmediately: saveValue,
    togglePublic,
    reveal
  }
}
