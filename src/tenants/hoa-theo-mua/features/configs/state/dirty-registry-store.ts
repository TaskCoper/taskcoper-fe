/**
 * Registry theo dõi những config row đang có thay đổi chưa lưu. Không phụ thuộc React; phần nối
 * với React nằm ở `dirty-registry.tsx`.
 *
 * Mỗi row mang hai cờ và chúng KHÔNG loại trừ nhau:
 *
 *   isDirty  - người dùng đã sửa form nhưng chưa submit; nội dung mới chỉ nằm trên trình duyệt.
 *              Đây là thứ duy nhất được phép chặn điều hướng.
 *   isSaving - đang có mutation bay đi. Unmount không huỷ request và React Query vẫn xử lý tiếp,
 *              nên cờ này TUYỆT ĐỐI không được tự mình chặn điều hướng.
 *
 * Luồng "sửa rồi bấm Lưu" bật cả hai cùng lúc, nên không gộp được thành một enum. Khi lưu THẤT
 * BẠI, `isDirty` phải giữ nguyên `true` để bản nháp còn đó - quyết định đó thuộc về row, store
 * chỉ phản ánh lại.
 */

export interface DirtyRowHandlers {
  /**
   * Đưa form của row về giá trị server gần nhất. Chỉ làm ở local, không gửi request; sau đó row
   * tự báo lại `isDirty: false` qua vòng đồng bộ state của nó.
   */
  reset: () => void
  /** Cuộn row vào tầm nhìn và đưa focus vào control giá trị của nó. */
  focus: () => void
}

export interface DirtyRowSnapshot {
  configId: string
  configKey: string
  isDirty: boolean
  isSaving: boolean
}

export interface DirtySnapshot {
  /** Các row đã đăng ký, theo đúng thứ tự đăng ký, để "row dirty đầu tiên" luôn ổn định từ trên xuống. */
  rows: readonly DirtyRowSnapshot[]
  dirtyCount: number
  savingCount: number
  /**
   * Điều kiện duy nhất mà guard điều hướng được dùng. Chỉ đọc `dirtyCount`, không đọc
   * `savingCount`: một lượt autosave đang bay không phải là thay đổi chưa lưu.
   */
  hasUnsavedWork: boolean
}

interface Entry {
  configId: string
  configKey: string
  isDirty: boolean
  isSaving: boolean
  /** Đọc qua getter để render lại một row không làm hỏng snapshot. */
  getHandlers: () => DirtyRowHandlers
  /** Định danh một lượt đăng ký, để cleanup cũ không xoá nhầm lượt đăng ký mới hơn. */
  token: number
}

export const EMPTY_SNAPSHOT: DirtySnapshot = Object.freeze({
  rows: Object.freeze([]) as readonly DirtyRowSnapshot[],
  dirtyCount: 0,
  savingCount: 0,
  hasUnsavedWork: false
})

export interface DirtyRegistryStore {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => DirtySnapshot
  register: (configId: string, configKey: string, getHandlers: () => DirtyRowHandlers) => () => void
  setStatus: (configId: string, patch: { isDirty?: boolean; isSaving?: boolean }) => void
  /** Focus row dirty đầu tiên tính từ trên xuống; trả về row đã focus nếu có. */
  reviewNext: () => DirtyRowSnapshot | null
  focusRow: (configId: string) => boolean
  /**
   * Reset các row dirty, bỏ qua row đang lưu: lệnh ghi của chúng đã bay đi nên cuộn form về sẽ
   * đánh nhau với response sắp về. Trả về danh sách id thực sự được reset.
   */
  discard: (configIds?: readonly string[]) => string[]
}

export const createDirtyRegistryStore = (): DirtyRegistryStore => {
  const entries = new Map<string, Entry>()
  /** Thứ tự đăng ký, giữ riêng để đăng ký lại một row không làm xáo trộn danh sách. */
  const order: string[] = []
  const listeners = new Set<() => void>()
  let snapshot: DirtySnapshot = EMPTY_SNAPSHOT
  let tokenSeq = 0

  const rebuild = (): void => {
    const rows: DirtyRowSnapshot[] = []
    let dirtyCount = 0
    let savingCount = 0

    for (const id of order) {
      const entry = entries.get(id)
      if (!entry) continue
      rows.push({
        configId: entry.configId,
        configKey: entry.configKey,
        isDirty: entry.isDirty,
        isSaving: entry.isSaving
      })
      if (entry.isDirty) dirtyCount++
      if (entry.isSaving) savingCount++
    }

    snapshot = { rows, dirtyCount, savingCount, hasUnsavedWork: dirtyCount > 0 }
  }

  // Snapshot chỉ đổi identity khi thực sự có gì đó quan sát được thay đổi - điều kiện
  // `useSyncExternalStore` cần để không rơi vào vòng render vô tận.
  const notify = (): void => {
    rebuild()
    for (const listener of listeners) listener()
  }

  const register: DirtyRegistryStore['register'] = (configId, configKey, getHandlers) => {
    const token = ++tokenSeq
    const previous = entries.get(configId)

    entries.set(configId, {
      configId,
      configKey,
      // Đăng ký lại cùng một row (effect chạy hai lần của StrictMode, hoặc key đổi) giữ nguyên
      // trạng thái cũ, để một lần remount không âm thầm làm mất cờ dirty.
      isDirty: previous?.isDirty ?? false,
      isSaving: previous?.isSaving ?? false,
      getHandlers,
      token
    })
    if (!previous) order.push(configId)
    notify()

    return () => {
      const current = entries.get(configId)
      // Cleanup của lượt đăng ký cũ không được xoá row đã thay thế nó.
      if (!current || current.token !== token) return
      entries.delete(configId)
      const index = order.indexOf(configId)
      if (index >= 0) order.splice(index, 1)
      notify()
    }
  }

  const setStatus: DirtyRegistryStore['setStatus'] = (configId, patch) => {
    const entry = entries.get(configId)
    // Trạng thái gửi tới cho một row chưa đăng ký thì bỏ qua, không hồi sinh entry: nếu không,
    // một row đã unmount có thể để lại entry ma chặn điều hướng vĩnh viễn.
    if (!entry) return

    const isDirty = patch.isDirty ?? entry.isDirty
    const isSaving = patch.isSaving ?? entry.isSaving
    if (isDirty === entry.isDirty && isSaving === entry.isSaving) return

    entry.isDirty = isDirty
    entry.isSaving = isSaving
    notify()
  }

  const focusRow: DirtyRegistryStore['focusRow'] = (configId) => {
    const entry = entries.get(configId)
    if (!entry) return false
    entry.getHandlers().focus()
    return true
  }

  const reviewNext: DirtyRegistryStore['reviewNext'] = () => {
    for (const id of order) {
      const entry = entries.get(id)
      if (!entry?.isDirty) continue
      entry.getHandlers().focus()
      return { configId: entry.configId, configKey: entry.configKey, isDirty: true, isSaving: entry.isSaving }
    }
    return null
  }

  const discard: DirtyRegistryStore['discard'] = (configIds) => {
    const scope = configIds ? new Set(configIds) : null
    const reset: string[] = []

    for (const id of order) {
      const entry = entries.get(id)
      if (!entry || !entry.isDirty) continue
      if (scope && !scope.has(id)) continue
      if (entry.isSaving) continue

      entry.getHandlers().reset()
      reset.push(id)
    }

    // Không lật cờ kiểu optimistic: mỗi row tự báo `isDirty: false` khi form của nó ổn định, nhờ
    // vậy registry không bao giờ nói một row đã sạch trong khi form của nó nói ngược lại.
    return reset
  }

  return {
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => snapshot,
    register,
    setStatus,
    reviewNext,
    focusRow,
    discard
  }
}
