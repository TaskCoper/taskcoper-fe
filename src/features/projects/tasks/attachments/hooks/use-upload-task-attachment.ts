import { useGetMe } from '@/features/auth/hooks/use-get-me'
import { invalidateProjectResources, invalidateTaskTree } from '@/lib/invalidations'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import taskAttachmentService from '../services'
import { uploadTaskAttachmentSchema, type UploadTaskAttachmentFormValues } from '../validations'
import { useGetTaskAttachments } from './use-get-task-attachments'

interface UploadTaskAttachmentParams {
  taskId: string
  parentMilestoneIdentifier: string
  projectIdentifier: string
}

export const useUploadTaskAttachment = ({
  taskId,
  parentMilestoneIdentifier,
  projectIdentifier
}: UploadTaskAttachmentParams) => {
  const queryClient = useQueryClient()
  const { me: user } = useGetMe()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { attachments } = useGetTaskAttachments({ taskId })

  const existingAttachments = useMemo(() => attachments?.value.items ?? [], [attachments])

  const methods = useForm<UploadTaskAttachmentFormValues>({
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
    resolver: zodResolver(uploadTaskAttachmentSchema(t))
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
    mutate: uploadTaskAttachment,
    mutateAsync: uploadTaskAttachmentAsync,
    isPending: isUploadingTaskAttachment
  } = useMutation({
    mutationFn: taskAttachmentService.uploadTaskAttachment,
    onSuccess: (message) => {
      methods.reset()
      toast.success(message)
      setOpen(false)
    },
    onSettled: () => {
      invalidateTaskTree(queryClient, {
        taskId,
        projectIdentifier,
        parentMilestoneIdentifier,
        userId: user?.id
      })
      invalidateProjectResources(queryClient, projectIdentifier)
    }
  })

  return {
    methods,
    uploadTaskAttachment,
    uploadTaskAttachmentAsync,
    isUploadingTaskAttachment,
    open,
    setOpen,
    recalculatePosition,
    getNextPosition
  }
}
