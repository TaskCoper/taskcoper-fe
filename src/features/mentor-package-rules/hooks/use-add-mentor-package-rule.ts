import { queryKeys } from '@/lib/query-keys'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import mentorPackageRuleService from '../services'
import { addMentorPackageRuleSchema, type AddMentorPackageRuleFormValues } from '../validations'

export const useAddMentorPackageRule = (mentorPackageId?: string) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const methods = useForm<AddMentorPackageRuleFormValues>({
    defaultValues: {
      mentorPackageId,
      no: undefined,
      totalTimeSlots: undefined
    },
    resolver: zodResolver(addMentorPackageRuleSchema(t))
  })

  const { mutate: addMentorPackageRule, isPending: isAddingMentorPackageRule } = useMutation({
    mutationFn: mentorPackageRuleService.addMentorPackageRule,
    onSuccess: (message) => {
      toast.success(message)
      methods.reset()
      setOpen(false)
    },
    onError: (error) => {
      toast(t('error.somethingWentWrong'), {
        description: error.response?.data?.detail
      })
    },
    onSettled: (_, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.mentorPackages.detail(variables.body.mentorPackageId),
        exact: true
      })
    }
  })

  return { methods, addMentorPackageRule, isAddingMentorPackageRule, open, setOpen }
}
