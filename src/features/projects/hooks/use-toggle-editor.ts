import type { BasePaginationResponse } from '@/lib/axios'
import projectService from '@/services/project.service'
import type { ProjectMember } from '@/types/project.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export const useToggleEditor = ({ identifier }: { identifier: string }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const queryKey = ['members', identifier]

  const { mutate: toggleEditor, isPending: isTogglingEditor } = useMutation({
    mutationFn: projectService.toggleEditor,
    onMutate: async ({ userId, isEditor }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousMembers = queryClient.getQueryData<BasePaginationResponse<ProjectMember>>(queryKey)

      queryClient.setQueryData<BasePaginationResponse<ProjectMember>>(queryKey, (old) => {
        if (!old) return old

        return {
          ...old,
          value: {
            ...old.value,
            items: old.value.items.map((member) =>
              member.userId === userId ? { ...member, isEditor: isEditor } : member
            )
          }
        }
      })

      return { previousMembers }
    },
    onSuccess: (message) => {
      toast.success(message)
    },
    onError: (error, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(queryKey, context.previousMembers)
      }

      toast.error(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  })

  return { toggleEditor, isTogglingEditor }
}
