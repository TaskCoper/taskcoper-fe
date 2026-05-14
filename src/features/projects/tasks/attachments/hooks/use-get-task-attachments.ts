import { queryKeys } from '@/lib/query-keys'
import { getDefaultPaginationResponse } from '@/shared/utils'
import { useQuery } from '@tanstack/react-query'
import taskAttachmentService from '../services'
import type { Attachment } from '../types'

interface GetTaskAttachmentsParams {
  taskId?: string
}

export const useGetTaskAttachments = ({ taskId }: GetTaskAttachmentsParams) => {
  const { data: attachments = getDefaultPaginationResponse<Attachment>(), isLoading: isLoadingAttachments } = useQuery({
    queryKey: queryKeys.attachments.byTask(taskId),
    queryFn: () => taskAttachmentService.getTaskAttachments({ taskId }),
    enabled: !!taskId
  })

  return { attachments, isLoadingAttachments }
}
