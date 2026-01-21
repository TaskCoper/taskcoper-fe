import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { uploadAttachmentSchema, type UploadAttachmentFormValues } from '../validations'
import { useGetAttachments } from './use-get-attachments'

interface UseUploadAttachmentProps {
  taskId: string
  parentMilestoneId: string
  projectId: string
}

export const useUploadAttachment = ({ taskId, parentMilestoneId, projectId }: UseUploadAttachmentProps) => {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { attachments } = useGetAttachments({ taskId })

  const existingAttachments = useMemo(() => attachments?.value.items ?? [], [attachments])

  const methods = useForm<UploadAttachmentFormValues>({
    defaultValues: {
      name: '',
      url: '',
      bytes: 0,
      mimeType: '',
      storageKey: '',
      position: 0,
      taskId: '',
      commentId: '',
      isUpload: false
    },
    resolver: zodResolver(uploadAttachmentSchema(t))
  })

  const getNextPosition = useCallback(() => {
    return calculateNewItemPosition(existingAttachments)
  }, [existingAttachments])

  const recalculatePosition = useCallback(() => {
    const newPosition = getNextPosition()
    methods.setValue('position', newPosition)
  }, [getNextPosition, methods])

  useEffect(() => {
    if (open) {
      recalculatePosition()
    }
  }, [open, recalculatePosition])

  const {
    mutate: uploadAttachment,
    mutateAsync: uploadAttachmentAsync,
    isPending: isUploadingAttachment
  } = useMutation({
    mutationFn: taskService.uploadAttachment,
    onSuccess: () => {
      methods.reset()
      setOpen(false)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.milestones.byParent(projectId, parentMilestoneId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectId, user?.UserId) })
    }
  })

  return {
    methods,
    uploadAttachment,
    uploadAttachmentAsync,
    isUploadingAttachment,
    open,
    setOpen,
    recalculatePosition,
    getNextPosition
  }
}
