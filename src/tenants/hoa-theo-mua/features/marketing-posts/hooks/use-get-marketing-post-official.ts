import { useQueries } from '@tanstack/react-query'
import { marketingPostKeys } from '../query-keys'
import marketingPostService from '../services'
import type { MarketingPostOfficial, MarketingPostPlatform } from '../types'

// Backend tự soát bản chốt: có nội dung chưa, có ảnh chưa, đang sinh hay đã đăng.
// Tin nó hơn tự suy ở frontend vì nó thấy cả những thứ detail không trả về.
export const useGetMarketingPostOfficial = ({ id, platforms }: { id?: string; platforms: MarketingPostPlatform[] }) => {
  const queries = useQueries({
    queries: platforms.map((platform) => ({
      queryKey: marketingPostKeys.official(id ?? '', platform),
      queryFn: () => marketingPostService.getMarketingPostOfficial({ id: id ?? '', platform }),
      enabled: Boolean(id),
      // Chỉ là phần soát thêm, hỏng thì vẫn còn checklist tính ở frontend
      throwOnError: false
    }))
  })

  const stamp = queries.map((query) => query.dataUpdatedAt).join()

  return {
    official: Object.fromEntries(platforms.map((platform, index) => [platform, queries[index]?.data])) as Partial<
      Record<MarketingPostPlatform, MarketingPostOfficial>
    >,
    stamp
  }
}
