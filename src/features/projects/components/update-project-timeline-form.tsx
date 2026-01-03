import { DatePickerField } from '@/components/date-picker-field'
import { useFormContext } from 'react-hook-form'
import type { UpdateProjectFormValues } from '../validations'

export default function UpdateProjectTimelineForm() {
  const { control } = useFormContext<UpdateProjectFormValues>()

  return (
    <div className='flex flex-col gap-2 w-full'>
      <DatePickerField
        control={control}
        name='startDate'
        label='common.field.startDate'
        placeholder='project.createProject.field.startDate.placeholder'
        isRequired
      />

      <DatePickerField
        control={control}
        name='endDate'
        label='common.field.endDate'
        placeholder='project.createProject.field.endDate.placeholder'
        isRequired
      />
    </div>
  )
}
