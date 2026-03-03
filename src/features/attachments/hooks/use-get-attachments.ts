import { queryKeys } from '@/lib/query-keys'
import taskService from '@/services/task.service'
import { getDefaultPaginationResponse } from '@/shared/utils'
import type { Attachment } from '@/types/attachment.type'
import { useQuery } from '@tanstack/react-query'

interface UseGetAttachmentsProps {
  taskId?: string
}

export const useGetAttachments = ({ taskId }: UseGetAttachmentsProps) => {
  const { data: attachments = getDefaultPaginationResponse<Attachment>(), isLoading: isLoadingAttachments } = useQuery({
    queryKey: queryKeys.attachments.byTask(taskId),
    queryFn: () => taskService.getAttachments({ taskId }),
    enabled: !!taskId
  })

  return { attachments, isLoadingAttachments }
}
