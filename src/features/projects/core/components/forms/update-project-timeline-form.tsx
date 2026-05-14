import { DatePickerField } from '@/components/date-picker-field'
import { useFormContext } from 'react-hook-form'
import type { UpdateProjectFormValues } from '../../validations'

interface UpdateProjectTimelineFormProps {
  onDateChange?: () => void
}

export default function UpdateProjectTimelineForm({ onDateChange }: UpdateProjectTimelineFormProps) {
  const { control } = useFormContext<UpdateProjectFormValues>()

  return (
    <div className='flex flex-col gap-4 w-full'>
      <DatePickerField
        control={control}
        name='startDate'
        onValueChange={() => onDateChange?.()}
        label='common.field.startDate'
        placeholder='project.createProject.field.startDate.placeholder'
        displayError={false}
      />

      <DatePickerField
        control={control}
        name='endDate'
        onValueChange={() => onDateChange?.()}
        label='common.field.endDate'
        placeholder='project.createProject.field.endDate.placeholder'
        displayError={false}
      />
    </div>
  )
}
