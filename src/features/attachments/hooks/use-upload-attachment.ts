import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/lib/zustand/auth.store'
import taskService from '@/services/task.service'
import { calculateNewItemPosition } from '@/shared/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { uploadAttachmentSchema, type UploadAttachmentFormValues } from '../validations'
import { useGetAttachments } from './use-get-attachments'

interface UseUploadAttachmentProps {
  taskId: string
  parentMilestoneIdentifier: string
  projectIdentifier: string
}

export const useUploadAttachment = ({
  taskId,
  parentMilestoneIdentifier,
  projectIdentifier
}: UseUploadAttachmentProps) => {
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
    onSuccess: (message) => {
      methods.reset()
      toast.success(message)
      setOpen(false)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.byTask(taskId) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.milestones.byParent(projectIdentifier, parentMilestoneIdentifier)
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.listParent(parentMilestoneIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.myAssigned(projectIdentifier, user?.UserId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projectResources.all(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resourceStats(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resourceMemberStats(projectIdentifier) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.mimeTypeStats(projectIdentifier) })
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
