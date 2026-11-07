import { useQuery } from '@tanstack/react-query'
import { productKeys } from '../query-keys'
import productService from '../services'

/**
 * Danh sách sản phẩm đã ghim của một scope. Không có `categoryId` → danh sách ghim global (cấp
 * Product); có `categoryId` → danh sách ghim của category đó. Key có `categoryId` để hai scope không
 * dùng chung cache, và `queryFn` là closure để truyền `categoryId` (truyền thẳng service thì nó nhận
 * context của React Query và gửi `CategoryId=undefined`).
 *
 * Không sort lại ở FE: BE đã trả theo (position, tên, id) và cũng dùng đúng thứ tự đó khi tính move,
 * nên thứ tự mảng trong cache chính là thứ tự hiển thị. Sort lại theo `position` sẽ làm optimistic
 * update (chỉ đổi thứ tự mảng, không đổi `position`) bị sắp ngược về chỗ cũ.
 *
 * Trả `isPinnedProductsError` để load lỗi hiện nút thử lại thay vì empty state "chưa ghim gì", vì hai
 * trường hợp này không thể phân biệt được.
 */
export const useGetPinnedProducts = (categoryId?: string) => {
  const {
    data: pinnedProducts,
    isLoading: isGettingPinnedProducts,
    isError: isPinnedProductsError,
    refetch: refetchPinnedProducts
  } = useQuery({
    queryKey: productKeys.pinned(categoryId),
    queryFn: () => productService.getPinnedProducts({ categoryId })
  })

  return { pinnedProducts, isGettingPinnedProducts, isPinnedProductsError, refetchPinnedProducts }
}
