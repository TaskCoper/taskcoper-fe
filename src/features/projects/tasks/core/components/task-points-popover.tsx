import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useGetMyProjectPermissions } from '@/features/projects/roles/hooks/use-get-my-project-permissions'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

interface TaskPointsPopoverProps {
  children: React.ReactNode
  onSubmit: () => void
  disabled?: boolean
}

export default function TaskPointsPopover({ children, onSubmit, disabled = false }: TaskPointsPopoverProps) {
  const [open, setOpen] = useState(false)

  const onClose = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        onInteractOutside={onClose}
        sideOffset={8}
        align='start'
        className='p-0 max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto w-72'
      >
        <StoryPointsPopoverContent onSubmit={onSubmit} onClose={onClose} />
      </PopoverContent>
    </Popover>
  )
}

interface StoryPointsPopoverContentProps {
  onSubmit: () => void
  onClose: () => void
}

function StoryPointsPopoverContent({ onSubmit, onClose }: StoryPointsPopoverContentProps) {
  const { t } = useTranslation()
  const { watch, setValue } = useFormContext()
  const estimatedPoints = watch('estimatedPoints')

  const [localPoints, setLocalPoints] = useState<string>(estimatedPoints?.toString() || '')
  const currentAsString = estimatedPoints?.toString() ?? ''
  const hasChanged = localPoints !== currentAsString

  const { identifier } = useParams<{ identifier: string }>()

  const { check } = useGetMyProjectPermissions({ projectIdentifier: identifier })
  const canDelete = check('TASKS', 'canDelete')

  const handleSave = () => {
    const points = localPoints === '' ? null : Number(localPoints)
    if (points !== null && isNaN(points)) return

    setValue('estimatedPoints', points, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    onSubmit()
    onClose()
  }

  const handleRemove = () => {
    setValue('estimatedPoints', null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    onSubmit()
    onClose()
  }

  return (
    <div className='p-4 space-y-4'>
      <div className='flex items-center justify-center relative'>
        <p className='text-sm font-bold w-full text-center text-foreground/80'>{t('task.detail.storyPoints')}</p>
        <XIcon className='size-4 absolute right-0 cursor-pointer' onClick={onClose} />
      </div>

      <Input
        type='number'
        placeholder={t('task.detail.enterStoryPoints')}
        autoFocus={true}
        value={localPoints}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalPoints(e.target.value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            handleSave()
          }
        }}
      />

      <div className='flex justify-end items-center gap-2'>
        {canDelete ? (
          <Button variant='ghost' onClick={handleRemove}>
            {t('common.button.remove')}
          </Button>
        ) : null}

        <Button onClick={handleSave} disabled={!hasChanged}>
          {t('common.button.save')}
        </Button>
      </div>
    </div>
  )
}
