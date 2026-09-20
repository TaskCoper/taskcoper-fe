import { parseAsString, useQueryState } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../config'
import { resolveEditor } from '../config-registry'
import type { Config, InputOption } from '../types'
import { useGetDepots } from '../../../hooks/use-get-depots'
import { useGetOrderSources } from '../../../hooks/use-get-order-sources'
import { useGetOrderTags } from '../../../hooks/use-get-order-tags'
import { useGetProductLabels } from '../../../hooks/use-get-product-labels'
import { LOCKED_ASYNC_CONFIG_KEYS } from '../locked-config-keys'

/** Key đánh dấu việc tạo mới một record trong họ config chưa có key cho tới khi lưu. */
export const NEW_PRODUCT_COLLECTION = 'products'
export const NEW_BANNERS = 'banners'
export const NEW_FEEDBACKS = 'feedbacks'

const toNamedOptions = (rows: { id: number; name: string }[]): InputOption[] =>
  rows.map((row) => ({ label: row.name, value: row.id }))

/**
 * Mọi thứ liên quan tới mở, đóng và điều hướng tới editor của một record - dialog, route riêng,
 * hay record nào đang được chọn trong panel của category.
 */
export function useRecordEditor({ requestNavigation }: { requestNavigation: (navigate: () => void) => void }) {
  const navigate = useNavigate()

  // Bản ghi đang được chọn trong panel của category: một config key, hoặc `new:<key>` khi đang
  // tạo mới trong một họ config. Deep-link được, và `replace` giữ history phẳng.
  const [editingKey, setEditingKey] = useQueryState('edit', parseAsString)

  const [editOpen, setEditOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)

  const { depots, refetchDepots } = useGetDepots()
  const { orderTags, refetchOrderTags } = useGetOrderTags()
  const { orderSources, refetchOrderSources } = useGetOrderSources()
  const { productLabels, refetchProductLabels } = useGetProductLabels()

  const depotOptions = useMemo<InputOption[]>(() => toNamedOptions(depots), [depots])
  const orderTagOptions = useMemo<InputOption[]>(() => toNamedOptions(orderTags), [orderTags])
  const orderSourceOptions = useMemo<InputOption[]>(() => toNamedOptions(orderSources), [orderSources])
  const productLabelOptions = useMemo<InputOption[]>(() => toNamedOptions(productLabels), [productLabels])

  const liveOptionsByKey = useMemo<Record<string, InputOption[]>>(
    () => ({
      [LOCKED_ASYNC_CONFIG_KEYS.defaultDepot]: depotOptions,
      [LOCKED_ASYNC_CONFIG_KEYS.orderTags]: orderTagOptions,
      [LOCKED_ASYNC_CONFIG_KEYS.orderSources]: orderSourceOptions,
      [LOCKED_ASYNC_CONFIG_KEYS.productLabels]: productLabelOptions
    }),
    [depotOptions, orderTagOptions, orderSourceOptions, productLabelOptions]
  )

  // Dialog sửa gọi hàm này để tải lại danh sách nguồn; key không lấy dữ liệu từ API thì trả
  // `null` để dialog ẩn nút đồng bộ đi.
  const syncLiveOptions = useCallback(
    async (key: string): Promise<InputOption[] | null> => {
      switch (key) {
        case LOCKED_ASYNC_CONFIG_KEYS.defaultDepot: {
          const { data } = await refetchDepots({ throwOnError: true })
          return toNamedOptions(data ?? [])
        }
        case LOCKED_ASYNC_CONFIG_KEYS.orderTags: {
          const { data } = await refetchOrderTags({ throwOnError: true })
          return toNamedOptions(data ?? [])
        }
        case LOCKED_ASYNC_CONFIG_KEYS.orderSources: {
          const { data } = await refetchOrderSources({ throwOnError: true })
          return toNamedOptions(data ?? [])
        }
        case LOCKED_ASYNC_CONFIG_KEYS.productLabels: {
          const { data } = await refetchProductLabels({ throwOnError: true })
          return toNamedOptions(data ?? [])
        }
        default:
          return null
      }
    },
    [refetchDepots, refetchOrderTags, refetchOrderSources, refetchProductLabels]
  )

  const openB2BOverviewEditor = useCallback(() => {
    navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/configs/b2b-overview`)
  }, [navigate])

  // Document dịch vụ B2B sửa ở trang editor riêng. Trang đó tự tìm record theo slug và tạo mới ở
  // lần lưu đầu tiên, nên ở đây chỉ cần điều hướng.
  const openB2BServiceEditor = useCallback(
    (slug: string) => {
      navigate(`/${HOA_THEO_MUA_ROUTE_PREFIX}/configs/b2b-service/${slug}`)
    },
    [navigate]
  )

  /**
   * Mở một record từ danh sách row.
   *
   * Các editor chuyên dụng giờ là panel của chính category chúng thuộc về, nên ở đây chỉ còn
   * `b2b` (trang riêng) và generic dialog. Một record lọt sang category khác - ví dụ bản ghi
   * `kind: secret` - vì thế được mở bằng generic dialog, thứ duy nhất xử lý được luồng reveal.
   */
  const openEdit = useCallback(
    (config: Config) => {
      const target = resolveEditor(config)

      if (target.type === 'route') {
        if (target.route === 'b2b-overview') openB2BOverviewEditor()
        else openB2BServiceEditor(target.slug)
        return
      }

      setEditingConfig(config)
      setEditOpen(true)
    },
    [openB2BOverviewEditor, openB2BServiceEditor]
  )

  const closeEdit = useCallback(() => {
    setEditOpen(false)
  }, [])

  // Đóng sau khi lưu thành công thì bỏ qua guard - chẳng còn gì chưa lưu để giữ.
  // Editor nào biết key vừa lưu thì truyền vào, để một bản ghi vừa tạo được chọn luôn thay vì
  // rơi về bản đầu tiên của họ config.
  const finishEditor = useCallback(
    (savedKey?: string | null) => {
      void setEditingKey(savedKey ?? null)
    },
    [setEditingKey]
  )

  // Đổi bản ghi trong một họ config (thanh chọn của `CategoryEditorPanel`) cũng unmount editor
  // đang mở, nên phải đi qua đúng guard như khi đổi category.
  const selectRecord = useCallback(
    (key: string) => {
      void requestNavigation(() => setEditingKey(key))
    },
    [requestNavigation, setEditingKey]
  )

  return {
    editingKey,
    openEdit,
    finishEditor,
    selectRecord,
    editOpen,
    editingConfig,
    closeEdit,
    liveOptionsByKey,
    syncLiveOptions,
    openB2BOverviewEditor,
    openB2BServiceEditor
  }
}
