import { useConfirmStore } from '@/lib/zustand/confirm.store'
import { useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { useBeforeUnload, useBlocker } from 'react-router'
import { DirtyRegistryContext } from './dirty-registry-context'
import type { DirtyRowHandlers, DirtySnapshot } from './dirty-registry-store'

const useStore = () => {
  const store = useContext(DirtyRegistryContext)
  if (!store) throw new Error('useDirtyRegistry must be used inside <DirtyRegistryProvider>')
  return store
}

/** Theo dõi snapshot của registry; chỉ render lại khi trạng thái của một row thật sự đổi. */
export const useDirtySnapshot = (): DirtySnapshot => {
  const store = useStore()
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}

export const useDirtyActions = () => {
  const store = useStore()
  return useMemo(() => ({ discard: store.discard, reviewNext: store.reviewNext, focusRow: store.focusRow }), [store])
}

interface RegisterRowOptions {
  configId: string
  configKey: string
  isDirty: boolean
  isSaving: boolean
  /** Cuộn về giá trị server gần nhất, chỉ ở local - không được gửi request. */
  onReset: () => void
}

/**
 * Đăng ký một config row với registry của trang và giữ trạng thái của nó đồng bộ.
 *
 * Trả về một ref mà row phải gắn vào phần tử ngoài cùng - đó là điểm neo để "Xem lại" cuộn tới
 * và focus row.
 *
 * Row chỉ báo `isDirty`/`isSaving` dưới dạng boolean, không bao giờ báo giá trị, nên gõ trong một
 * field không làm cả trang render lại: effect bên dưới chỉ chạy khi có chuyển trạng thái.
 */
export const useRegisterDirtyRow = ({ configId, configKey, isDirty, isSaving, onReset }: RegisterRowOptions) => {
  const store = useStore()
  const rowRef = useRef<HTMLDivElement | null>(null)

  const focusRow = useCallback(() => {
    const element = rowRef.current
    if (!element) return
    element.scrollIntoView?.({ block: 'center', behavior: 'smooth' })

    // Thu hẹp về control giá trị nếu row có đánh dấu. Không có bước này, `querySelector` trả về
    // phần tử đầu tiên theo thứ tự DOM - trong một config row đó là switch "công khai" ở header,
    // không phải field người dùng đang sửa.
    const scope = element.querySelector<HTMLElement>('[data-dirty-focus]') ?? element
    const focusable =
      scope.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [role="combobox"]:not([disabled]), [role="switch"]:not([disabled])'
      ) ?? scope.querySelector<HTMLElement>('button:not([disabled])')
    ;(focusable ?? element).focus({ preventScroll: true })
  }, [])

  // Handler nằm sau một ref để render lại không làm hỏng snapshot của store, và ref được ghi
  // trong effect (không phải lúc render) để giữ đúng tính chất side effect. Store chỉ gọi chúng
  // khi người dùng thao tác, tức luôn sau khi effect đã flush.
  const handlersRef = useRef<DirtyRowHandlers>({ reset: () => {}, focus: () => {} })
  useEffect(() => {
    handlersRef.current = { reset: onReset, focus: focusRow }
  })

  // Khai báo sau phần đồng bộ handler nhưng trước effect trạng thái, để row luôn được đăng ký
  // xong rồi mới báo trạng thái.
  useEffect(() => store.register(configId, configKey, () => handlersRef.current), [store, configId, configKey])

  useEffect(() => {
    store.setStatus(configId, { isDirty, isSaving })
  }, [store, configId, isDirty, isSaving])

  return rowRef
}

interface GuardCopy {
  title: string
  description: string
  confirmText: string
  cancelText: string
}

/**
 * Chặn mọi đường rời trang khi còn thay đổi chưa lưu:
 *
 *   điều hướng route  - `useBlocker`, cùng cách làm với `project-role.page.tsx`
 *   reload / đóng tab - `useBeforeUnload`
 *   đổi category/kind - `requestNavigation`, do chính handler của trang gọi, vì đây là cập nhật
 *                       query-state của nuqs mà blocker của router không nhìn thấy
 *
 * `hasUnsavedWork` chỉ đếm row dirty, nên một lượt autosave đang bay không giam chân người dùng.
 */
export const useUnsavedChangesGuard = (copy: GuardCopy) => {
  const { hasUnsavedWork } = useDirtySnapshot()
  const { confirm } = useConfirmStore()

  // Chỉ một hộp thoại xác nhận tại một thời điểm. Không có chốt này, effect blocker khi render
  // lại có thể chồng hộp thoại thứ hai lên hộp thứ nhất và kẹt router ở trạng thái `blocked`.
  const confirmInFlight = useRef(false)

  const copyRef = useRef(copy)
  copyRef.current = copy

  const confirmDiscard = useCallback(async (): Promise<boolean> => {
    if (confirmInFlight.current) return false
    confirmInFlight.current = true
    try {
      return await confirm({
        title: copyRef.current.title,
        description: copyRef.current.description,
        confirmText: copyRef.current.confirmText,
        cancelText: copyRef.current.cancelText
      })
    } finally {
      confirmInFlight.current = false
    }
  }, [confirm])

  const blocker = useBlocker(hasUnsavedWork)

  useBeforeUnload(
    (event) => {
      if (!hasUnsavedWork) return
      event.preventDefault()
      event.returnValue = ''
    },
    { capture: true }
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return

    let isCancelled = false
    const run = async () => {
      const ok = await confirmDiscard()
      if (isCancelled) return
      if (ok) blocker.proceed?.()
      else blocker.reset?.()
    }
    void run()

    return () => {
      isCancelled = true
    }
  }, [blocker, confirmDiscard])

  /**
   * Bọc các thao tác điều hướng trong trang (đổi category hoặc kind) vốn sẽ unmount row dirty.
   * Chỉ chạy `proceed` khi không có gì để mất, hoặc người dùng đồng ý mất.
   */
  const requestNavigation = useCallback(
    async (proceed: () => void) => {
      if (!hasUnsavedWork) {
        proceed()
        return
      }
      if (await confirmDiscard()) proceed()
    },
    [hasUnsavedWork, confirmDiscard]
  )

  return { hasUnsavedWork, requestNavigation }
}
