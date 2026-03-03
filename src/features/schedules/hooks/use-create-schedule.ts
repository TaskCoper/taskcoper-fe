import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { createScheduleSchema, type CreateScheduleFormValues } from '../validations'

export const useCreateSchedule = () => {
  const { t } = useTranslation()

  const methods = useForm<CreateScheduleFormValues>({
    defaultValues: { dayOfWeeks: [], startTime: '', endTime: '', activeFrom: null, activeTo: null },
    resolver: zodResolver(createScheduleSchema(t))
  })

  return { methods }
}
