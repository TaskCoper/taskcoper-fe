import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorDetail } from '../api-error'
import { marketingPostKeys } from '../query-keys'
import type { MarketingPlanImportResult } from '../types'

// TODO(BE): API nhập kế hoạch chưa có. Giả lập độ trễ upload để dựng UI; khi BE xong thì đổi
// mutationFn sang `marketingPostService.importMarketingPlan` và xoá hàm này.
const mockImportMarketingPlan = async ({ file }: { file: File }): Promise<MarketingPlanImportResult> => {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return { planId: `mock-${file.name}` }
}

export const useImportMarketingPlan = () => {
  const { t } = useTenantTranslation()
  const queryClient = useQueryClient()

  const { mutateAsync: importMarketingPlan, isPending: isImportingMarketingPlan } = useMutation({
    mutationFn: mockImportMarketingPlan,
    onSuccess: () => {
      // Backend sinh bài chạy nền, danh sách sẽ lần lượt có bài mới
      queryClient.invalidateQueries({ queryKey: marketingPostKeys.lists() })
      toast.success(t('marketingPosts.planImport.success'), {
        description: t('marketingPosts.planImport.successDescription')
      })
    },
    onError: (error) => {
      toast.error(t('marketingPosts.planImport.error'), { description: getApiErrorDetail(error) })
    }
  })

  return { importMarketingPlan, isImportingMarketingPlan }
}
