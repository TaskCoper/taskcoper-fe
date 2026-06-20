import { FormProvider, type SubmitHandler } from 'react-hook-form'
import CreateJobDescriptionForm from '../features/job-descriptions/components/create-job-description-form'
import { useCreateJobDescription } from '../features/job-descriptions/hooks/use-create-job-description'
import type { CreateJobDescriptionFormValues } from '../features/job-descriptions/validations'

export default function RecruitmentJobCreatePage() {
  const { methods, createJobDescription, isCreatingJobDescription } = useCreateJobDescription()

  const onSubmit: SubmitHandler<CreateJobDescriptionFormValues> = async (body) => {
    createJobDescription({ body })
  }

  return (
    <div className='p-6 w-6xl mx-auto'>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <CreateJobDescriptionForm onSubmit={onSubmit} isLoading={isCreatingJobDescription} />
        </form>
      </FormProvider>
    </div>
  )
}
