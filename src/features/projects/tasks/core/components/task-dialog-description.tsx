import RichTextEditor from '@/components/rich-text-editor'
import SanitizedHtml from '@/components/sanitized-html'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/shared/utils'
import { ChevronDownIcon, ChevronUpIcon, TextAlignStartIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useFormContext, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { TaskDetail } from '../types'
import type { UpdateTaskFormValues } from '../validations'

interface TaskDialogDescriptionProps {
  task: TaskDetail | null | undefined
  canUpdate: boolean
  identifier?: string
  isUpdatingTask: boolean
  onSubmitUpdateTask: SubmitHandler<UpdateTaskFormValues>
}

export default function TaskDialogDescription({
  task,
  canUpdate,
  identifier,
  isUpdatingTask,
  onSubmitUpdateTask
}: TaskDialogDescriptionProps) {
  const { t } = useTranslation()
  const { control, handleSubmit, setValue, reset } = useFormContext<UpdateTaskFormValues>()

  const [isEditDescription, setIsEditDescription] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [showDescriptionToggle, setShowDescriptionToggle] = useState(false)
  const [descriptionElement, setDescriptionElement] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!descriptionElement) return

    const checkHeight = () => {
      if (descriptionElement) {
        setShowDescriptionToggle(descriptionElement.scrollHeight > 384)
      }
    }

    checkHeight()

    const observer = new ResizeObserver(checkHeight)

    observer.observe(descriptionElement)
    return () => observer.disconnect()
  }, [descriptionElement, task?.taskDescription, isEditDescription])

  const handleSaveDescription = () => {
    handleSubmit((body) => {
      setIsEditDescription(false)
      onSubmitUpdateTask(body)
    })()
  }

  return (
    <div className='flex gap-3'>
      <TextAlignStartIcon className='mt-0.5 size-4' />
      <div className='w-full space-y-4'>
        <div className='flex items-start justify-between'>
          <p className='font-semibold'>{t('common.field.description')}</p>
          {!isEditDescription && task?.taskDescription && canUpdate ? (
            <Button variant='outline' size='sm' onClick={() => setIsEditDescription(true)}>
              {t('common.button.edit')}
            </Button>
          ) : null}
        </div>

        {isEditDescription ? (
          <>
            <Controller
              name='description'
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1'>
                  <RichTextEditor
                    isInitialFocus={true}
                    content={field.value ?? ''}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                    error={fieldState.error}
                    onMentionIdsChange={(ids) => {
                      const currentMentionUsers = task?.mentionedUsers ?? []
                      const mentionIdQueues = currentMentionUsers.reduce<Record<string, string[]>>((acc, user) => {
                        if (!acc[user.userId]) acc[user.userId] = []
                        acc[user.userId].push(user.id)
                        return acc
                      }, {})

                      setValue(
                        'mentionUsers',
                        ids.map((userId) => ({
                          userId,
                          mentionId: mentionIdQueues[userId]?.shift() ?? null
                        })),
                        { shouldDirty: true }
                      )
                    }}
                    projectIdentifier={identifier}
                    mentionedUsers={task?.mentionedUsers}
                  />
                </Field>
              )}
            />

            <div className='flex items-center gap-2'>
              <Button onClick={handleSaveDescription} disabled={isUpdatingTask}>
                {isUpdatingTask ? <Spinner /> : null}
                {t('common.button.save')}
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditDescription(false)
                  reset()
                }}
                disabled={isUpdatingTask}
              >
                {t('common.button.cancel')}
              </Button>
            </div>
          </>
        ) : task?.taskDescription ? (
          <div>
            <div className='relative'>
              <div
                ref={setDescriptionElement}
                role='button'
                className={cn('overflow-hidden transition-all', !isDescriptionExpanded && 'max-h-96')}
              >
                <SanitizedHtml html={task.taskDescription} mentionedUsers={task.mentionedUsers} />
              </div>
              {showDescriptionToggle && !isDescriptionExpanded && (
                <div className='absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent pointer-events-none' />
              )}
            </div>

            {showDescriptionToggle && (
              <Button
                variant='outline'
                className='w-full mt-1'
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                {isDescriptionExpanded ? (
                  <>
                    <ChevronUpIcon className='size-4' />
                    {t('common.ui.viewLess')}
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className='size-4' />
                    {t('common.ui.viewMore')}
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <Textarea
            placeholder={t('task.description.addDescription')}
            className='resize-none w-full font-semibold h-24'
            readOnly
            disabled={!canUpdate}
            onClick={() => canUpdate && setIsEditDescription(true)}
          />
        )}
      </div>
    </div>
  )
}
