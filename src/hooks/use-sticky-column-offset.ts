import { useCallback, useEffect, useRef, useState } from 'react'

const findScrollParent = (element: HTMLElement | null) => {
  let parent = element?.parentElement ?? null

  while (parent) {
    const { overflowY } = getComputedStyle(parent)
    if (overflowY === 'auto' || overflowY === 'scroll') return parent

    parent = parent.parentElement
  }

  return null
}

/**
 * Giữ một cột phụ dính cả mép trên lẫn mép dưới khi cột cao hơn màn hình.
 *
 * `position: sticky` chỉ nhận được một mốc nên tự nó không làm được việc này:
 * - Chỉ `top`: cột cao hơn màn bị ghim ở trên, phần đáy nằm ngoài tầm nhìn vĩnh viễn.
 * - Chỉ `bottom`: không ăn gì cả. Muốn thỏa mốc dưới, cột phải dịch lên trên, mà cột vốn nằm sát
 *   đầu ô lưới nên bị kẹp lại ngay.
 *
 * Cách làm: giữ `position: sticky` nhưng tự lái `top` theo hướng cuộn. Mốc `top` trôi ngược chiều
 * cuộn đúng bằng quãng vừa cuộn, kẹp trong khoảng [chiều_cao_màn − chiều_cao_cột − gap, gap].
 * Cuộn xuống thì mốc trôi dần về cận dưới, chạm cận là đáy cột đứng yên ở đáy màn; đổi chiều lên
 * thì trôi ngược về cận trên, chạm cận là đỉnh cột đứng yên ở đỉnh màn. Cột thấp hơn màn thì mốc
 * luôn là `gap`, tức là dính mép trên như thường.
 *
 * Chiều cao cột đổi liên tục (mở/đóng khối, thêm bớt mục) nên phải đo lại bằng ResizeObserver.
 *
 * Trả về ref dạng hàm chứ không phải `useRef` trần: có trang render khung chờ trước rồi mới dựng
 * cột, lúc effect chạy lần đầu thì phần tử chưa tồn tại và sẽ không bao giờ chạy lại. Ref hàm vừa
 * cất phần tử vào ref (để còn gán `style.top` - giá trị từ `useState` bị coi là bất biến), vừa
 * tăng một số đếm để effect chạy lại đúng lúc cột gắn vào DOM.
 */
export const useStickyColumnOffset = <T extends HTMLElement>(gap = 24) => {
  const elementRef = useRef<T | null>(null)
  const [attachCount, setAttachCount] = useState(0)

  const setElement = useCallback((node: T | null) => {
    elementRef.current = node
    setAttachCount((current) => current + 1)
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const scrollParent = findScrollParent(element)
    const getViewportHeight = () => scrollParent?.clientHeight ?? window.innerHeight
    const getScrollTop = () => scrollParent?.scrollTop ?? window.scrollY

    // Gom vào một object để sửa thuộc tính thay vì gán lại biến đã đóng gói trong closure
    const state = { offset: gap, lastScrollTop: getScrollTop() }

    const apply = (scrollDelta: number) => {
      const viewportHeight = getViewportHeight()
      // Cột lọt trong màn thì không có gì để trôi, cứ dính mép trên
      const minOffset = Math.min(gap, viewportHeight - element.offsetHeight - gap)

      state.offset = Math.min(gap, Math.max(minOffset, state.offset - scrollDelta))
      // Gán `top` không làm đổi chiều cao cột nên ResizeObserver không tự kích lại chính nó
      element.style.top = `${state.offset}px`
    }

    const onScroll = () => {
      const scrollTop = getScrollTop()
      const scrollDelta = scrollTop - state.lastScrollTop
      state.lastScrollTop = scrollTop

      apply(scrollDelta)
    }

    // Đổi chiều cao thì chỉ cần kẹp lại mốc cũ vào khoảng mới, không coi là vừa cuộn
    const onResize = () => apply(0)

    apply(0)

    const scrollTarget = scrollParent ?? window
    scrollTarget.addEventListener('scroll', onScroll, { passive: true })

    const observer = new ResizeObserver(onResize)
    observer.observe(element)
    if (scrollParent) observer.observe(scrollParent)
    window.addEventListener('resize', onResize)

    return () => {
      scrollTarget.removeEventListener('scroll', onScroll)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [attachCount, gap])

  return setElement
}
